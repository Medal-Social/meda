'use client';

import { type ComponentType, useId, useOptimistic, useState, useTransition } from 'react';
import { cn } from '../../lib/utils.js';
import { Field } from '../../primitives/field.js';
import { Input } from '../../primitives/input.js';
import { Textarea } from '../../primitives/textarea.js';
import type { BookingFormat } from '../format.js';
import { BOOKING_INPUT_CLASS, BOOKING_TEXTAREA_CLASS, BookingButton } from '../internal/ui.js';
import { fillLabel } from '../labels.js';
import { type SlotClassNames, slotClass } from '../slots.js';
import type { PortalFamilyMemberDto, PortalPersonNouns } from '../types.js';
import { type PortalActionFailure, settle } from './action-result.js';
import {
  AGE_CONFIRM_CARD_LABEL_KEYS,
  AgeConfirmCard,
  type AgeConfirmCardLabels,
} from './age-confirm-card.js';

/**
 * The children a parent books for, ONE CHILD AT A TIME.
 *
 * Each row saves on its own, through `onSavePerson` / `onRemovePerson`, which
 * edit one stored person in place: the id the booking system keeps for the
 * child survives a rename, and that id is what a booking points at. A backend
 * without per-person endpoints may fall back to patching the whole list
 * (`fallback: true` in the answer) and the row says what could not be kept.
 *
 * Beside name and birth year, three fields the backend keeps where it can
 * (`personDetails`): the birth MONTH (optional — it makes an age exact across
 * the birthday; never a full date), a preferred stylist (a preference the
 * wizard preselects, not a booking rule) and a note for the stylist.
 *
 * OPTIMISTIC: the tap shows the outcome at once — the row as it will be
 * stored and «saved» — with every row locked (`disabled` on the fieldset)
 * until the callback answers. On success the rows are rebuilt from what was
 * stored, keeping any OTHER row's unsaved typing; on failure the optimistic
 * view ends, which puts the parent's edits back exactly as they were, with
 * the reason in the live region.
 *
 * Fixed row shapes, so nothing below a row moves when a save lands: a row's
 * status line is always there, empty until it has something to say.
 *
 * AGE PROMPT (`agePrompt`): above the rows, one `AgeConfirmCard` for the
 * first child the backend can address whose birth month it does not know. It
 * saves through the same `onSavePerson` and the same rebuild, so the row below
 * shows what the card stored. Its patch is the minimum — name, year and, when
 * chosen, month — so notes and preferred stylist are left alone. Confirmed or
 * waved away, the child's id is reported through `onAgeAnswered` (the caller
 * remembers it, e.g. in a cookie) and the card is not drawn for them again.
 */

const MAX_MEMBERS = 10;
const OLDEST_YEARS_BACK = 18;
const NOTES_MAX = 500;

export const FAMILY_EDITOR_OWN_LABEL_KEYS = [
  'familyEditor.heading',
  'familyEditor.lead',
  'familyEditor.empty',
  'familyEditor.legend',
  'familyEditor.add',
  'familyEditor.name',
  'familyEditor.birthYear',
  'familyEditor.birthYearPlaceholder',
  'familyEditor.birthMonth',
  'familyEditor.birthMonthUnknown',
  'familyEditor.stylist',
  'familyEditor.stylistNone',
  'familyEditor.stylistFormer',
  'familyEditor.notes',
  'familyEditor.notesPlaceholder',
  'familyEditor.newRow',
  'familyEditor.save',
  'familyEditor.remove',
  'familyEditor.removeNamed',
  'familyEditor.removeRow',
  'familyEditor.saved',
  'familyEditor.savedNoDetails',
  'familyEditor.partial',
  'familyEditor.removed',
  'familyEditor.unreachable',
  'familyEditor.ageConfirmed',
  'familyEditor.ageSaved',
] as const;

export const FAMILY_EDITOR_LABEL_KEYS = [
  ...FAMILY_EDITOR_OWN_LABEL_KEYS,
  ...AGE_CONFIRM_CARD_LABEL_KEYS,
] as const;

/**
 * `heading` is used when no `nouns` are given. `removeNamed`, `ageConfirmed`
 * and `ageSaved` take `{name}`. The card's `ageConfirm.*` keys are included.
 */
export type FamilyEditorLabels = Record<(typeof FAMILY_EDITOR_OWN_LABEL_KEYS)[number], string> &
  AgeConfirmCardLabels;

/**
 * `root` (the section), `heading`, `list` (the `<ul>` of rows), `card` (each
 * row's form), `listStatus` (the live region under the list), `add` (the add
 * button), `ageCard` (the age prompt's section).
 */
export type FamilyEditorSlot =
  | 'root'
  | 'heading'
  | 'list'
  | 'card'
  | 'listStatus'
  | 'add'
  | 'ageCard';

/** One child as the form holds it. Every field is text; `''` is «not chosen». */
export interface FamilyEditorRow {
  key: number;
  /** The backend's id for the child, `null` for a new row or one it could not name. */
  personId: string | null;
  /** Where the child sits in the profile's family — the fallback's address. */
  index: number | null;
  name: string;
  birthYear: string;
  birthMonth: string;
  notes: string;
  stylist: string;
}

export type FamilyEditorRowStatus =
  | { kind: 'saved'; note?: string }
  | { kind: 'error'; message: string }
  /** A name without a year, or the reverse. */
  | { kind: 'partial' };

export type FamilyEditorRowPatch = Partial<Omit<FamilyEditorRow, 'key' | 'personId' | 'index'>>;

/** Which child a call is about: the id, or the family index where there is none. */
export interface PersonTarget {
  personId: string | null;
  /** Present only when `personId` is `null` and the child is on file. */
  index?: number;
}

/** A person as a save sends it. The three detail fields are absent unless offered; `null` clears. */
export interface PersonPatch {
  name: string;
  birthYear: number;
  birthMonth?: number | null;
  notes?: string | null;
  preferredResourceId?: string | null;
}

export interface PersonSaveRequest {
  /** A new child (no id and no index yet). */
  create: boolean;
  target: PersonTarget;
  person: PersonPatch;
}

/** A person save or removal's answer: the family as now stored, or why not. */
export type PersonSaveResult =
  | {
      ok: true;
      family: PortalFamilyMemberDto[];
      /** The id a created child got, when the backend names one. */
      personId: string | null;
      /** The backend could keep only name and year (no per-person endpoints). */
      fallback: boolean;
    }
  | PortalActionFailure;

export interface FamilyMemberCardProps {
  /** Unique id prefix for the row's controls. */
  id: string;
  row: FamilyEditorRow;
  years: readonly number[];
  months: readonly string[];
  /** Whether month, stylist and notes are offered for this row. */
  offerDetails: boolean;
  stylists: ReadonlyArray<{ id: string; name: string }>;
  status: FamilyEditorRowStatus | null;
  labels: FamilyEditorLabels;
  className?: string;
  onPatch: (patch: FamilyEditorRowPatch) => void;
  onSave: () => void;
  onRemove: () => void;
}

export interface FamilyEditorComponents {
  /** One child's row (a `<form>`). Wrap `DefaultFamilyMemberCard` to extend it. */
  FamilyMemberCard?: ComponentType<FamilyMemberCardProps>;
}

export interface FamilyEditorProps {
  labels: FamilyEditorLabels;
  /** Month names come from `format.clock.monthName`; the current year from `format.clock.dayKey(now)`. */
  format: BookingFormat;
  family: PortalFamilyMemberDto[];
  /** What the business calls the people on a profile; `persons` becomes the heading. */
  nouns?: PortalPersonNouns;
  /** Overrides the year derived from `now`. */
  currentYear?: number;
  /** Defaults to `Date.now()`. */
  now?: number;
  /**
   * Whether the backend keeps month, notes and stylist. A new row offers them
   * too when there is nobody on the profile to tell from.
   */
  personDetails?: boolean;
  /** Preferred-stylist choices, display names. */
  stylists?: ReadonlyArray<{ id: string; name: string }>;
  /**
   * Draw the age prompt for the first child with no birth month.
   * `dismissed` are the ids already answered on this device. Absent: no card.
   */
  agePrompt?: { dismissed: readonly string[] };
  /** Saves one child. Called with the trimmed name. */
  onSavePerson: (request: PersonSaveRequest) => Promise<PersonSaveResult>;
  /** Removes one child. */
  onRemovePerson: (target: PersonTarget) => Promise<PersonSaveResult>;
  /** A callback answered `{ kind: 'session' }`: send the visitor to the login. */
  onSessionExpired?: () => void;
  /**
   * The age prompt was answered (confirmed or waved away). `dismissed` is the
   * whole list to remember, the new id last.
   */
  onAgeAnswered?: (dismissed: readonly string[]) => void;
  classNames?: SlotClassNames<FamilyEditorSlot>;
  components?: FamilyEditorComponents;
}

interface View {
  rows: FamilyEditorRow[];
  statuses: Record<number, FamilyEditorRowStatus>;
  /** For the list as a whole — «removed», or why a removal failed. */
  listStatus: FamilyEditorRowStatus | null;
}

function toRow(member: PortalFamilyMemberDto, key: number, index: number): FamilyEditorRow {
  return {
    key,
    personId: member.personId,
    index,
    name: member.name,
    birthYear: String(member.birthYear),
    birthMonth: member.birthMonth === null ? '' : String(member.birthMonth),
    notes: member.notes ?? '',
    stylist: member.preferredResourceId ?? '',
  };
}

function same(a: FamilyEditorRow, b: FamilyEditorRow): boolean {
  return (
    a.name === b.name &&
    a.birthYear === b.birthYear &&
    a.birthMonth === b.birthMonth &&
    a.notes === b.notes &&
    a.stylist === b.stylist
  );
}

/** A row typed here and never saved: nothing on the backend's side to address. */
function isNewRow(row: FamilyEditorRow): boolean {
  return row.personId === null && row.index === null;
}

function target(row: FamilyEditorRow): PersonTarget {
  return {
    personId: row.personId,
    ...(row.personId === null && row.index !== null ? { index: row.index } : {}),
  };
}

/** The three detail fields; `null` clears. */
function details(row: FamilyEditorRow) {
  const notes = row.notes.trim();
  return {
    birthMonth: row.birthMonth === '' ? null : Number(row.birthMonth),
    notes: notes === '' ? null : notes,
    preferredResourceId: row.stylist === '' ? null : row.stylist,
  };
}

/**
 * What one existing row becomes once the backend has answered: what was
 * stored, unless the parent has unsaved typing in it — then their draft,
 * re-indexed. The row just saved from the editor always takes the answer; the
 * row the age card saved (`submitted`) keeps its draft and takes only those
 * fields.
 */
function keptRow(
  previous: FamilyEditorRow,
  storedRow: FamilyEditorRow,
  lastStored: FamilyEditorRow | undefined,
  isSaved: boolean,
  submitted: ReadonlyArray<'birthYear' | 'birthMonth'> | undefined
): FamilyEditorRow {
  const draftSurvives = !isSaved || submitted !== undefined;
  if (!draftSurvives || lastStored === undefined || same(previous, lastStored)) return storedRow;
  const merged: FamilyEditorRow = { ...previous, index: storedRow.index };
  if (isSaved) {
    for (const field of submitted ?? []) merged[field] = storedRow[field];
  }
  return merged;
}

function hasDetails(row: FamilyEditorRow): boolean {
  return row.birthMonth !== '' || row.notes.trim() !== '' || row.stylist !== '';
}

function yearOptions(currentYear: number, extra: number[]): number[] {
  const years = new Set<number>();
  for (let year = currentYear; year >= currentYear - OLDEST_YEARS_BACK; year -= 1) {
    years.add(year);
  }
  // A child who has aged out of the range keeps their own year on the list
  // rather than being silently moved to the newest one the select allows.
  for (const year of extra) years.add(year);
  return [...years].sort((a, b) => b - a);
}

/**
 * The index of the child the age prompt asks about, or `null`: one the
 * backend can address, with no birth month, not already answered, on a
 * backend that keeps months.
 */
function agePromptIndex(
  family: ReadonlyArray<{ personId: string | null; birthMonth: number | null }>,
  dismissed: readonly string[],
  personDetails: boolean
): number | null {
  if (!personDetails) return null;
  const index = family.findIndex(
    (member) =>
      member.personId !== null && member.birthMonth === null && !dismissed.includes(member.personId)
  );
  return index === -1 ? null : index;
}

const SELECT_CLASS =
  'h-9 w-full rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export function FamilyEditor({
  labels,
  format,
  family,
  nouns,
  now = Date.now(),
  currentYear = Number(format.clock.dayKey(now).slice(0, 4)),
  personDetails = false,
  stylists = [],
  agePrompt,
  onSavePerson,
  onRemovePerson,
  onSessionExpired,
  onAgeAnswered,
  classNames,
  components,
}: FamilyEditorProps) {
  const FamilyMemberCard = components?.FamilyMemberCard ?? DefaultFamilyMemberCard;
  const id = useId();
  const [rows, setRows] = useState<FamilyEditorRow[]>(() =>
    family.map((member, index) => toRow(member, index, index))
  );
  /** What each row last was on the backend's side — what «dirty» is measured from. */
  const [stored, setStored] = useState<Record<number, FamilyEditorRow>>(() =>
    Object.fromEntries(family.map((member, index) => [index, toRow(member, index, index)]))
  );
  const [nextKey, setNextKey] = useState(family.length);
  const [statuses, setStatuses] = useState<Record<number, FamilyEditorRowStatus>>({});
  const [listStatus, setListStatus] = useState<FamilyEditorRowStatus | null>(null);
  const [pending, startTransition] = useTransition();
  const [ageDismissed, setAgeDismissed] = useState<readonly string[]>(
    () => agePrompt?.dismissed ?? []
  );
  const [ageError, setAgeError] = useState<string | null>(null);
  const [shown, showSaving] = useOptimistic<View, View>(
    { rows, statuses, listStatus },
    (_current, saving) => saving
  );

  const detailsKnown = personDetails;
  const months = Array.from({ length: 12 }, (_, index) => format.clock.monthName(index + 1));
  const years = yearOptions(
    currentYear,
    rows.map((row) => Number(row.birthYear)).filter((year) => Number.isInteger(year) && year > 0)
  );

  /**
   * The row the age card asks about: by what the backend HOLDS (`stored`),
   * not what the parent may be typing below — a month chosen but not yet
   * saved in the editor is not a month the backend knows.
   */
  const agePromptRow = (() => {
    if (agePrompt === undefined) return undefined;
    const candidates = rows.filter((row) => stored[row.key] !== undefined);
    const index = agePromptIndex(
      candidates.map((row) => ({
        personId: row.personId,
        birthMonth: stored[row.key].birthMonth === '' ? null : Number(stored[row.key].birthMonth),
      })),
      ageDismissed,
      detailsKnown
    );
    return index === null ? undefined : stored[candidates[index].key];
  })();

  function failed(failure: PortalActionFailure): string | null {
    if (failure.kind === 'session') {
      onSessionExpired?.();
      return null;
    }
    return failure.message ?? labels['familyEditor.unreachable'];
  }

  /** Never ask about this child again. */
  function rememberAgeAnswer(personId: string) {
    const next = [...ageDismissed, personId];
    setAgeDismissed(next);
    setAgeError(null);
    onAgeAnswered?.(next);
  }

  function confirmAge(row: FamilyEditorRow, answer: { birthYear: string; birthMonth: string }) {
    const personId = row.personId;
    if (personId === null) return;
    const name = row.name.trim();
    // Nothing to store: the year stands and the parent does not know (or
    // will not say) the month. Still an answer, and remembered as one.
    if (answer.birthYear === row.birthYear && answer.birthMonth === '') {
      rememberAgeAnswer(personId);
      setListStatus({
        kind: 'saved',
        note: fillLabel(labels['familyEditor.ageConfirmed'], { name }),
      });
      return;
    }
    setAgeError(null);
    startTransition(async () => {
      const result = await settle(() =>
        onSavePerson({
          create: false,
          target: { personId },
          person: {
            name,
            birthYear: Number(answer.birthYear),
            ...(answer.birthMonth === '' ? {} : { birthMonth: Number(answer.birthMonth) }),
          },
        })
      );
      if (result.ok) {
        // Only the fields the card sent come from the answer: anything the
        // parent is still typing in this child's editor row stays theirs.
        adopt(
          result.family,
          row.key,
          null,
          answer.birthMonth === '' ? ['birthYear'] : ['birthYear', 'birthMonth']
        );
        rememberAgeAnswer(personId);
        // No «saved» on the row itself: it may still hold unsaved typing.
        setListStatus({
          kind: 'saved',
          note: fillLabel(labels['familyEditor.ageSaved'], { name }),
        });
        return;
      }
      const message = failed(result);
      if (message !== null) setAgeError(message);
    });
  }

  function patchRow(key: number, patch: FamilyEditorRowPatch) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    setStatuses(({ [key]: _dropped, ...rest }) => rest);
    setListStatus(null);
  }

  function addRow() {
    if (rows.length >= MAX_MEMBERS) return;
    const row: FamilyEditorRow = {
      key: nextKey,
      personId: null,
      index: null,
      name: '',
      birthYear: '',
      birthMonth: '',
      notes: '',
      stylist: '',
    };
    setRows((current) => [...current, row]);
    setNextKey((key) => key + 1);
    setListStatus(null);
  }

  /**
   * Rebuild the rows from what the backend now holds. Rows the parent is
   * still typing in — changed and not the one just saved — keep their typing:
   * saving one child must not throw away another's half-finished edit.
   * Unsaved NEW rows stay at the end.
   */
  function adopt(
    fresh: PortalFamilyMemberDto[],
    savedKey: number,
    createdId: string | null,
    /**
     * The age card's save: the saved row is NOT the one the parent submitted
     * from the editor, so any unsaved typing in it survives — only the fields
     * the card sent are taken from the answer.
     */
    submitted?: ReadonlyArray<'birthYear' | 'birthMonth'>
  ) {
    let key = nextKey;
    const savedRow = rows.find((row) => row.key === savedKey);
    let claimed = false;
    // The fresh entry the new row became: by the id it was given, or — from
    // the list fallback, which names no id — by the name and year just typed.
    const isCreated = (member: PortalFamilyMemberDto): boolean => {
      if (claimed || savedRow === undefined || !isNewRow(savedRow)) return false;
      const match =
        createdId !== null
          ? member.personId === createdId
          : member.name === savedRow.name.trim() && String(member.birthYear) === savedRow.birthYear;
      claimed = match;
      return match;
    };
    const kept: FamilyEditorRow[] = [];
    const nextStored: Record<number, FamilyEditorRow> = {};
    for (const [index, member] of fresh.entries()) {
      const previous =
        member.personId === null ? undefined : rows.find((row) => row.personId === member.personId);
      // The child just created keeps the key of the row it was typed in, so
      // its «saved» stays where the parent is looking.
      const rowKey = previous?.key ?? (isCreated(member) ? savedKey : key++);
      const storedRow = toRow(member, rowKey, index);
      nextStored[rowKey] = storedRow;
      kept.push(
        previous === undefined
          ? storedRow
          : keptRow(previous, storedRow, stored[previous.key], previous.key === savedKey, submitted)
      );
    }
    // The row just created has no id in `rows` yet; it is in `fresh` now, so
    // it goes. Every other new row stays.
    const drafts = rows.filter(
      (row) => row.personId === null && row.index === null && row.key !== savedKey
    );
    setRows([...kept, ...drafts]);
    setStored(nextStored);
    setNextKey(Math.max(key, nextKey));
  }

  function fail(failure: PortalActionFailure, key: number | null) {
    const message = failed(failure);
    if (message === null) return;
    const status: FamilyEditorRowStatus = { kind: 'error', message };
    if (key === null) setListStatus(status);
    else setStatuses((current) => ({ ...current, [key]: status }));
  }

  function save(row: FamilyEditorRow) {
    const name = row.name.trim();
    if (name === '' || row.birthYear === '') {
      setStatuses((current) => ({ ...current, [row.key]: { kind: 'partial' } }));
      return;
    }
    const isNew = isNewRow(row);
    const offerDetails = detailsKnown || (isNew && family.length === 0);
    const person: PersonPatch = {
      name,
      birthYear: Number(row.birthYear),
      ...(offerDetails ? details(row) : {}),
    };
    const gaveDetails = offerDetails && hasDetails(row);

    startTransition(async () => {
      showSaving({
        rows: rows.map((current) => (current.key === row.key ? { ...row, name } : current)),
        statuses: { ...statuses, [row.key]: { kind: 'saved' } },
        listStatus: null,
      });
      const result = await settle(() =>
        onSavePerson({ create: isNew, target: target(row), person })
      );
      if (result.ok) {
        adopt(result.family, row.key, isNew ? result.personId : null);
        setStatuses({
          [row.key]:
            result.fallback && gaveDetails
              ? { kind: 'saved', note: labels['familyEditor.savedNoDetails'] }
              : { kind: 'saved' },
        });
        setListStatus(isNew ? { kind: 'saved' } : null);
        return;
      }
      fail(result, row.key);
    });
  }

  function remove(row: FamilyEditorRow) {
    // A row that was never saved has nothing on the backend's side to remove.
    if (isNewRow(row)) {
      setRows((current) => current.filter((other) => other.key !== row.key));
      return;
    }
    startTransition(async () => {
      showSaving({
        rows: rows.filter((current) => current.key !== row.key),
        statuses,
        listStatus: { kind: 'saved', note: labels['familyEditor.removed'] },
      });
      const result = await settle(() => onRemovePerson(target(row)));
      if (result.ok) {
        adopt(result.family, row.key, null);
        setStatuses({});
        setListStatus({ kind: 'saved', note: labels['familyEditor.removed'] });
        return;
      }
      fail(result, null);
    });
  }

  const listStatusId = `${id}-list-status`;

  return (
    <section
      aria-labelledby="portal-family-heading"
      className={slotClass(classNames, 'root', 'space-y-4')}
    >
      <div className="space-y-1">
        <h2
          id="portal-family-heading"
          className={slotClass(classNames, 'heading', 'font-sans text-xl font-bold md:text-2xl')}
        >
          {nouns?.persons ?? labels['familyEditor.heading']}
        </h2>
        <p className="text-sm text-muted-foreground">{labels['familyEditor.lead']}</p>
      </div>
      {agePromptRow !== undefined && (
        <AgeConfirmCard
          // A fresh card per child: the next child's must not inherit this one's answer.
          key={agePromptRow.personId}
          labels={labels}
          name={agePromptRow.name}
          birthYear={agePromptRow.birthYear}
          years={years}
          months={months}
          busy={pending}
          error={ageError}
          classNames={classNames?.ageCard ? { root: classNames.ageCard } : undefined}
          onConfirm={(answer) => confirmAge(agePromptRow, answer)}
          onDismiss={() => agePromptRow.personId && rememberAgeAnswer(agePromptRow.personId)}
        />
      )}
      {shown.rows.length === 0 && (
        <p className="text-muted-foreground">{labels['familyEditor.empty']}</p>
      )}
      <fieldset
        // Locked while saving: an edit typed mid-save would be shown through
        // the optimistic snapshot and then overwritten by the answer.
        disabled={pending}
        className="min-w-0 space-y-3"
        aria-describedby={shown.listStatus?.kind === 'error' ? listStatusId : undefined}
      >
        <legend className="sr-only">{labels['familyEditor.legend']}</legend>
        <ul className={slotClass(classNames, 'list', 'space-y-3')}>
          {shown.rows.map((row) => {
            const offerDetails = detailsKnown || (isNewRow(row) && family.length === 0);
            return (
              <li key={row.key}>
                <FamilyMemberCard
                  id={`${id}-${row.key}`}
                  row={row}
                  years={years}
                  months={months}
                  offerDetails={offerDetails}
                  stylists={stylists}
                  status={shown.statuses[row.key] ?? null}
                  labels={labels}
                  className={classNames?.card}
                  onPatch={(patch) => patchRow(row.key, patch)}
                  onSave={() => save(row)}
                  onRemove={() => remove(row)}
                />
              </li>
            );
          })}
        </ul>
      </fieldset>
      <div aria-live="polite" className={slotClass(classNames, 'listStatus', 'min-h-5')}>
        {shown.listStatus?.kind === 'saved' && shown.listStatus.note && (
          <p id={listStatusId} className="text-sm text-muted-foreground">
            {shown.listStatus.note}
          </p>
        )}
        {shown.listStatus?.kind === 'error' && (
          <Field.Error id={listStatusId}>{shown.listStatus.message}</Field.Error>
        )}
      </div>
      {shown.rows.length < MAX_MEMBERS && (
        <BookingButton
          variant="outline"
          onClick={addRow}
          disabled={pending}
          className={slotClass(classNames, 'add')}
        >
          {labels['familyEditor.add']}
        </BookingButton>
      )}
    </section>
  );
}

/** The default row: name + year, the three details where offered, save / remove and a status line. */
export function DefaultFamilyMemberCard({
  id,
  row,
  years,
  months,
  offerDetails,
  stylists,
  status,
  labels,
  className,
  onPatch,
  onSave,
  onRemove,
}: FamilyMemberCardProps) {
  const statusId = `${id}-status`;
  const partial = status?.kind === 'partial';
  const nameMissing = partial && row.name.trim() === '';
  const yearMissing = partial && row.birthYear === '';
  const name = row.name.trim();
  // A stylist no longer on the roster keeps their option rather than the
  // select silently showing «none» for a preference the backend still holds.
  const stylistOptions =
    row.stylist !== '' && !stylists.some((stylist) => stylist.id === row.stylist)
      ? [...stylists, { id: row.stylist, name: labels['familyEditor.stylistFormer'] }]
      : stylists;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
      aria-label={name || labels['familyEditor.newRow']}
      className={cn('space-y-3 rounded-lg border border-border bg-card px-5 py-4', className)}
    >
      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <Field>
          <Field.Label htmlFor={`${id}-name`}>{labels['familyEditor.name']}</Field.Label>
          <Input
            id={`${id}-name`}
            value={row.name}
            maxLength={60}
            aria-invalid={nameMissing || undefined}
            aria-describedby={partial ? statusId : undefined}
            onChange={(event) => onPatch({ name: event.target.value })}
            className={BOOKING_INPUT_CLASS}
          />
        </Field>
        <Field>
          <Field.Label htmlFor={`${id}-year`}>{labels['familyEditor.birthYear']}</Field.Label>
          <select
            id={`${id}-year`}
            value={row.birthYear}
            aria-invalid={yearMissing || undefined}
            aria-describedby={partial ? statusId : undefined}
            onChange={(event) => onPatch({ birthYear: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">{labels['familyEditor.birthYearPlaceholder']}</option>
            {years.map((year) => (
              <option key={year} value={String(year)}>
                {year}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {offerDetails && (
        <DetailFields
          id={id}
          row={row}
          months={months}
          stylists={stylistOptions}
          labels={labels}
          onPatch={onPatch}
        />
      )}
      <div className="flex flex-wrap items-center gap-3">
        <BookingButton type="submit" size="sm">
          {labels['familyEditor.save']}
        </BookingButton>
        <BookingButton
          type="button"
          variant="ghost"
          size="sm"
          aria-label={
            name
              ? fillLabel(labels['familyEditor.removeNamed'], { name })
              : labels['familyEditor.removeRow']
          }
          onClick={onRemove}
        >
          {labels['familyEditor.remove']}
        </BookingButton>
        {/* Always mounted: a status line that appears pushes the next child down. */}
        <RowStatusLine id={statusId} status={status} labels={labels} />
      </div>
    </form>
  );
}

/** Month, preferred stylist and a note for the stylist — where the backend keeps them. */
function DetailFields({
  id,
  row,
  months,
  stylists,
  labels,
  onPatch,
}: {
  id: string;
  row: FamilyEditorRow;
  months: readonly string[];
  stylists: ReadonlyArray<{ id: string; name: string }>;
  labels: FamilyEditorLabels;
  onPatch: (patch: FamilyEditorRowPatch) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <Field.Label htmlFor={`${id}-month`}>{labels['familyEditor.birthMonth']}</Field.Label>
          <select
            id={`${id}-month`}
            value={row.birthMonth}
            onChange={(event) => onPatch({ birthMonth: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">{labels['familyEditor.birthMonthUnknown']}</option>
            {months.map((month, index) => (
              <option key={month} value={String(index + 1)}>
                {month}
              </option>
            ))}
          </select>
        </Field>
        <Field>
          <Field.Label htmlFor={`${id}-stylist`}>{labels['familyEditor.stylist']}</Field.Label>
          <select
            id={`${id}-stylist`}
            value={row.stylist}
            onChange={(event) => onPatch({ stylist: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="">{labels['familyEditor.stylistNone']}</option>
            {stylists.map((stylist) => (
              <option key={stylist.id} value={stylist.id}>
                {stylist.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field>
        <Field.Label htmlFor={`${id}-notes`}>{labels['familyEditor.notes']}</Field.Label>
        <Textarea
          id={`${id}-notes`}
          rows={2}
          maxLength={NOTES_MAX}
          placeholder={labels['familyEditor.notesPlaceholder']}
          value={row.notes}
          onChange={(event) => onPatch({ notes: event.target.value })}
          className={BOOKING_TEXTAREA_CLASS}
        />
      </Field>
    </>
  );
}

function RowStatusLine({
  id,
  status,
  labels,
}: {
  id: string;
  status: FamilyEditorRowStatus | null;
  labels: FamilyEditorLabels;
}) {
  return (
    <span aria-live="polite" className="min-h-5 text-sm">
      {status?.kind === 'saved' && (
        <span id={id} className="text-muted-foreground">
          {status.note ?? labels['familyEditor.saved']}
        </span>
      )}
      {status?.kind === 'partial' && (
        <Field.Error id={id}>{labels['familyEditor.partial']}</Field.Error>
      )}
      {status?.kind === 'error' && <Field.Error id={id}>{status.message}</Field.Error>}
    </span>
  );
}
