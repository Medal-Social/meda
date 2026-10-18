'use client';

import { Check, Minus, Plus } from 'lucide-react';
import { type ComponentType, type KeyboardEvent, type ReactNode, useEffect, useRef } from 'react';
import { cn } from '../lib/utils.js';
import {
  ADD_CHILD_SHEET_LABEL_KEYS,
  AddChildSheet,
  type AddChildSheetLabels,
} from './add-child-sheet.js';
import type { BookingFormat } from './format.js';
import { renderLabel } from './internal/label-parts.js';
import { type BookingLabel, fillLabel, labelText } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { NewChild, SaveResult, WizardPerson } from './types.js';

/**
 * The first step — who is the visit for?
 *
 * Presentational, like the other steps: every answer leaves as `onChoose` and
 * the caller's machine decides what it means.
 *
 * TWO SHAPES, one question:
 *
 * - **A guest** gets a row of chips (e.g. «1 child · 2 children · 3 children ·
 *   Adult») and a chip is the whole answer: one tap, and the next step is on
 *   screen. Nothing about the child is asked here.
 * - **A logged-in parent** gets their children as cards — initial, name, a
 *   line (age on the appointment day, last visit) — to tick, up to
 *   `maxPeople`, plus a «myself (adult)» row, and moves on with the wizard's
 *   own «next». Ticking is a live answer to the machine, so the sticky bar
 *   knows when there is one.
 *
 * «+ Add child» opens a small sheet for either: a logged-in parent's new child
 * is created by the caller (`onAddChild` resolves once it exists), a guest's
 * lives only in this booking.
 *
 * SEMANTICS. The chips are a radio group (one answer of several); the cards
 * are checkboxes in a fieldset whose legend says the rule. At the limit an
 * unticked card is `aria-disabled`, not `disabled`: it stays in the tab order
 * and says why it does nothing, instead of vanishing from a screen reader's
 * list of the children.
 *
 * Heights are fixed — cards, chips and the dashed card are one size whatever
 * they hold — so a login that swaps chips for cards, or a child that arrives
 * from the sheet, grows the list by whole rows and moves nothing sideways.
 */

export const WHO_SCREEN_LABEL_KEYS = [
  'who.heading',
  'who.guest.groupLabel',
  'who.guest.children.one',
  'who.guest.children.other',
  'who.guest.adult',
  'who.guest.addedList',
  'who.family.legend',
  'who.family.self',
  'who.family.limit',
  ...ADD_CHILD_SHEET_LABEL_KEYS,
] as const;

/**
 * Opt-in keys for `guestParty`. `who.party.fewer` / `who.party.more` are the
 * stepper buttons' accessible names; `who.party.count` `{count}` is read out
 * when the number changes.
 */
export const WHO_SCREEN_PARTY_LABEL_KEYS = [
  /** «Children». */
  'who.party.children',
  /** Under it, e.g. «0–12 years». */
  'who.party.childrenNote',
  /** The grown-up's row, e.g. «I'm getting a cut too». */
  'who.party.adult',
  /**
   * Under it. Check row: about sitting beside a child («Side by side, at the
   * same time»), so shown only while there is one. Stepper
   * (`guestParty.adults`): it describes the grown-ups' row the way
   * `childrenNote` does the children's («Cut, beard, colour»), so always.
   */
  'who.party.adultNote',
  'who.party.fewer',
  'who.party.more',
  /** `{count}` — the children's number, read out, e.g. «{count} children». */
  'who.party.count',
  /** With `guestParty.adults`: the grown-ups' stepper buttons and their number read out. */
  'who.party.adultFewer',
  'who.party.adultMore',
  /** `{count}` — e.g. «{count} grown-ups». */
  'who.party.adultCount',
  /** Under the heading, e.g. «Up to three in one booking». */
  'who.party.lead',
  /** Under the steppers while there are children and no grown-up. */
  'who.party.togetherHint',
  /**
   * A logged-in parent's grown-ups row, e.g. «Grown-ups», when
   * `guestParty.adults` makes it a stepper: «myself» is seat 1, the rest are
   * the guest's seats 2, 3. Without it the «myself» check row stays.
   */
  'who.family.adults',
] as const;

/** The labels a «Voksen» stepper cannot draw without. */
const ADULT_STEPPER_LABEL_KEYS = [
  'who.party.adultFewer',
  'who.party.adultMore',
  'who.party.adultCount',
] as const;

/** The `who.party.*` keys `guestParty` cannot draw without; the two notes are extras. */
const PARTY_REQUIRED_LABEL_KEYS = [
  'who.party.children',
  'who.party.adult',
  'who.party.fewer',
  'who.party.more',
  'who.party.count',
] as const;

export type WhoScreenLabels = Record<(typeof WHO_SCREEN_LABEL_KEYS)[number], BookingLabel> &
  Partial<Record<(typeof WHO_SCREEN_PARTY_LABEL_KEYS)[number], BookingLabel>> &
  AddChildSheetLabels;

/**
 * - `root` — the `<section>`
 * - `heading` — the `<h2>`
 * - `chip` / `chipSelected` — a guest chip / the pressed one
 * - `card` / `cardSelected` — a person card (and the «myself» row) / a ticked one
 * - `limit` — the always-mounted limit sentence
 */
export type WhoScreenSlot =
  | 'root'
  | 'heading'
  | 'chip'
  | 'chipSelected'
  | 'card'
  | 'cardSelected'
  | 'limit';

/** One guest chip: the seats it stands for. */
export interface WhoGuestChoice {
  key: string;
  /** The seats this chip answers with (e.g. two anonymous child seats). */
  people: WizardPerson[];
  /**
   * The chip's text. Absent: an all-adult choice reads `who.guest.adult`,
   * anything else `who.guest.children.one|other` with `{count}`.
   */
  label?: string;
}

/** A person the screen draws as a card, with its display line precomputed. */
export interface WhoPersonEntry {
  /** The seat the card ticks (its `key` identifies it; `name` is shown). */
  person: WizardPerson;
  /** «7 years · Last: Kids' cut, 12 Aug», or the age alone, or `''`. */
  line: string;
}

export interface PersonCardProps {
  name: string;
  line: string;
  /** Position in the list — the default card picks an avatar tint from it. */
  index: number;
  selected: boolean;
  /** At the limit: announced and inert, but still focusable (`aria-disabled`). */
  disabled: boolean;
  describedBy?: string;
  onToggle: () => void;
  className?: string;
  selectedClassName?: string;
}

export interface WhoScreenComponents {
  PersonCard?: ComponentType<PersonCardProps>;
}

export interface WhoScreenProps {
  labels: WhoScreenLabels;
  format: BookingFormat;
  /** The machine's current answer. */
  people: WizardPerson[];
  /** The logged-in parent's children, in profile order; `null` for a guest. */
  family: WhoPersonEntry[] | null;
  /** A guest's chips, in display order. */
  guestChoices: WhoGuestChoice[];
  /**
   * Children a guest named in the sheet (they live only in this booking),
   * drawn as ticked cards under the chips. Ignored for a family.
   */
  addedChildren?: WhoPersonEntry[];
  /** The most people one booking may seat. */
  maxPeople: number;
  /** The key of the «myself (adult)» seat on a family's list. */
  selfKey: string;
  /**
   * A seat only a guest's shape can draw (a chip's anonymous seat, a guest's
   * named child, the guest «adult»). Under a family such a seat is one nobody
   * can see or untick, so it never counts towards the limit and never
   * survives the next tap. Default: none.
   */
  isGuestSeat?: (person: WizardPerson) => boolean;
  onChoose: (people: WizardPerson[], advance: boolean) => void;
  /**
   * Save a new child. Logged in: creates the person and resolves once they
   * exist (or with a sentence for the sheet); a guest's is local.
   */
  onAddChild: (child: NewChild) => Promise<SaveResult>;
  /**
   * A guest picks how many children and whether they come too, instead of the
   * chips: a stepper (1 child to begin with) and a «me too» row, up to
   * `maxPeople` in all. Each change is a live answer (`advance: false`); the
   * caller's «next» moves on. `child(seat)` is the 1-based child seat the chips
   * use; `adult` the grown-up's seat. Named children from the add-child
   * sheet keep their seats. Needs the `who.party.*` labels: without
   * `children`, `adult`, `fewer`, `more` and `count` the chips are drawn
   * instead, rather than unnamed controls.
   */
  guestParty?: {
    child: (seat: number) => WizardPerson;
    adult: WizardPerson & { adult: true };
    /**
     * Start with nobody, rather than one child: for a salon where a grown-up
     * booking for themselves is as common as a child. Children go down to 0
     * and the grown-up's row is a free choice either way; «next» waits for an
     * answer. Default `false`.
     */
    startEmpty?: boolean;
    /**
     * The grown-ups' seats, 1-based, when «Voksen» is a number (a stepper)
     * rather than one check row: two parents, or a parent and a grandparent,
     * in one booking. Seat 1 must be `adult`. Needs the `who.party.adultFewer`,
     * `adultMore` and `adultCount` labels; without them the check row stays.
     *
     * The one part of `guestParty` a logged-in parent's list reads too: with
     * `who.family.adults` as well, its «myself» row is the same stepper, seat 1
     * being `selfKey` and seats 2, 3 these — so a second grown-up survives a
     * login. `isGuestSeat` must then not claim seats 2 and up.
     */
    adults?: (seat: number) => WizardPerson & { adult: true };
  };
  /** Shown under the heading for a guest — e.g. an offer to log in. */
  loginRow?: ReactNode;
  /** Newest birth year the sheet offers (see `AddChildSheet`). */
  currentYear?: number;
  classNames?: SlotClassNames<WhoScreenSlot>;
  components?: WhoScreenComponents;
}

/** The tints the avatars take, in order. */
const AVATAR_TINTS = ['bg-secondary/30', 'bg-primary/10', 'bg-accent'] as const;

const HEADING_ID = 'booking-who-heading';
const LIMIT_ID = 'booking-who-limit';

const noGuestSeats = () => false;

const ARROW_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

function choiceLabel(choice: WhoGuestChoice, labels: WhoScreenLabels): ReactNode {
  if (choice.label !== undefined) return choice.label;
  if (choice.people.length > 0 && choice.people.every((person) => person.adult)) {
    return labels['who.guest.adult'];
  }
  const count = choice.people.length;
  return renderLabel(labels[count === 1 ? 'who.guest.children.one' : 'who.guest.children.other'], {
    count,
  });
}

function choicePressed(people: WizardPerson[], choice: WhoGuestChoice): boolean {
  const wanted = choice.people;
  return (
    people.length === wanted.length &&
    people.every((person, index) => person.key === wanted[index]?.key)
  );
}

export function WhoScreen({
  labels,
  format,
  people,
  family,
  guestChoices,
  addedChildren = [],
  maxPeople,
  selfKey,
  isGuestSeat = noGuestSeats,
  onChoose,
  onAddChild,
  guestParty,
  loginRow,
  currentYear,
  classNames,
  components,
}: WhoScreenProps) {
  const PersonCard = components?.PersonCard ?? DefaultPersonCard;
  const heading = (
    <h2
      id={HEADING_ID}
      tabIndex={-1}
      className={slotClass(
        classNames,
        'heading',
        'font-sans text-2xl font-bold outline-none md:text-3xl'
      )}
    >
      {labels['who.heading']}
    </h2>
  );
  const sheet = (disabled: boolean, saveNotes: boolean) => (
    <AddChildSheet
      labels={labels}
      format={format}
      saveNotes={saveNotes}
      disabled={disabled}
      currentYear={currentYear}
      onSave={onAddChild}
    />
  );
  const cardClasses = {
    className: classNames?.card,
    selectedClassName: classNames?.cardSelected,
  };

  const partyReady =
    guestParty !== undefined && PARTY_REQUIRED_LABEL_KEYS.every((key) => labels[key] !== undefined);

  if (family === null) {
    return (
      <section aria-labelledby={HEADING_ID} className={slotClass(classNames, 'root', 'space-y-6')}>
        {heading}
        {loginRow}
        <div className="space-y-4">
          {partyReady && guestParty ? (
            <GuestParty
              party={guestParty}
              people={people}
              maxPeople={maxPeople}
              labels={labels}
              classNames={classNames}
              onChoose={onChoose}
            />
          ) : (
            <GuestChips
              choices={guestChoices}
              people={people}
              labels={labels}
              classNames={classNames}
              onChoose={onChoose}
            />
          )}
          {addedChildren.length > 0 && (
            <ul aria-label={labelText(labels['who.guest.addedList'])} className="space-y-2">
              {addedChildren.map((entry, index) => (
                <li key={entry.person.key}>
                  <PersonCard
                    name={entry.person.name ?? ''}
                    line={entry.line}
                    index={index}
                    selected
                    disabled={false}
                    onToggle={() =>
                      onChoose(
                        people.filter((other) => other.key !== entry.person.key),
                        false
                      )
                    }
                    {...cardClasses}
                  />
                </li>
              ))}
            </ul>
          )}
          {sheet(
            partyReady ? people.length >= maxPeople : addedChildren.length >= maxPeople,
            false
          )}
        </div>
      </section>
    );
  }

  // Defensively only what this picker draws: the caller clears guest seats
  // when the family appears, and a seat nobody can see must never count
  // towards the limit nor survive the next tap.
  const seated = people.filter((person) => !isGuestSeat(person));
  const chosen = new Set(seated.map((person) => person.key));
  const full = seated.length >= maxPeople;
  const self: WizardPerson = { key: selfKey, adult: true };
  const selfChecked = chosen.has(selfKey);

  // «Voksne» as a number under a family too: «myself» first, then the guest's
  // seats 2, 3 — a second grown-up has no profile card to tick.
  const moreAdults =
    guestParty?.adults !== undefined &&
    labels['who.family.adults'] !== undefined &&
    ADULT_STEPPER_LABEL_KEYS.every((key) => labels[key] !== undefined)
      ? guestParty.adults
      : undefined;
  const otherAdultKeys = new Set(
    moreAdults ? Array.from({ length: maxPeople - 1 }, (_, index) => moreAdults(index + 2).key) : []
  );
  const isGrownUp = (person: WizardPerson) =>
    person.key === selfKey || otherAdultKeys.has(person.key);
  const grownUps = seated.filter(isGrownUp).length;
  const setGrownUps = (count: number) => {
    if (!moreAdults) return;
    const seats = Array.from({ length: count }, (_, index) =>
      index === 0 ? self : moreAdults(index + 1)
    );
    onChoose([...seated.filter((person) => !isGrownUp(person)), ...seats], false);
  };
  const partyText = (key: (typeof WHO_SCREEN_PARTY_LABEL_KEYS)[number], values = {}) => {
    const label = labels[key];
    return label ? fillLabel(label, values) : '';
  };
  const adultNote = labels['who.party.adultNote'];

  function toggle(person: WizardPerson) {
    if (chosen.has(person.key)) {
      onChoose(
        seated.filter((other) => other.key !== person.key),
        false
      );
      return;
    }
    if (full) return;
    onChoose([...seated, person], false);
  }

  return (
    <section aria-labelledby={HEADING_ID} className={slotClass(classNames, 'root', 'space-y-6')}>
      {heading}
      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm text-muted-foreground">
          {renderLabel(labels['who.family.legend'], { max: maxPeople })}
        </legend>
        <ul className="space-y-2">
          {family.map((entry, index) => {
            const selected = chosen.has(entry.person.key);
            return (
              <li key={entry.person.key}>
                <PersonCard
                  name={entry.person.name ?? ''}
                  line={entry.line}
                  index={index}
                  selected={selected}
                  disabled={!selected && full}
                  describedBy={!selected && full ? LIMIT_ID : undefined}
                  onToggle={() => toggle(entry.person)}
                  {...cardClasses}
                />
              </li>
            );
          })}
          <li>{sheet(full, true)}</li>
        </ul>
        {moreAdults ? (
          <div className={cn('rounded-lg border border-border bg-card', classNames?.card)}>
            <StepperRow
              title={partyText('who.family.adults')}
              note={adultNote ? renderLabel(adultNote) : null}
              value={grownUps}
              countLabel={partyText('who.party.adultCount', { count: grownUps })}
              fewerLabel={partyText('who.party.adultFewer')}
              moreLabel={partyText('who.party.adultMore')}
              canFewer={grownUps > 0}
              canMore={!full}
              limitId={full ? LIMIT_ID : undefined}
              onFewer={() => setGrownUps(grownUps - 1)}
              onMore={() => setGrownUps(grownUps + 1)}
            />
          </div>
        ) : (
          <CheckRow
            checked={selfChecked}
            disabled={!selfChecked && full}
            describedBy={!selfChecked && full ? LIMIT_ID : undefined}
            onToggle={() => toggle(self)}
            className={cn('h-14 justify-between px-5 text-sm', classNames?.card)}
            selectedClassName={classNames?.cardSelected}
          >
            <span className="font-medium">{labels['who.family.self']}</span>
            <CheckCircle checked={selfChecked} />
          </CheckRow>
        )}
        {/* Always mounted, so reaching the limit moves nothing. */}
        <p
          id={LIMIT_ID}
          aria-live="polite"
          className={slotClass(classNames, 'limit', 'min-h-5 text-sm text-muted-foreground')}
        >
          {full ? renderLabel(labels['who.family.limit'], { max: maxPeople }) : ''}
        </p>
      </fieldset>
    </section>
  );
}

/**
 * A guest's party: how many children (a stepper) and whether the grown-up
 * comes too (a check row), so «a child and me» is one booking without an
 * account. Starts at one child, which is the common answer, so «next» is live
 * from the first frame — or, with `startEmpty`, at nobody, so a grown-up
 * booking for themselves is one tap like anyone else.
 */
function GuestParty({
  party,
  people,
  maxPeople,
  labels,
  classNames,
  onChoose,
}: {
  party: NonNullable<WhoScreenProps['guestParty']>;
  people: WizardPerson[];
  maxPeople: number;
  labels: WhoScreenLabels;
  classNames: SlotClassNames<WhoScreenSlot> | undefined;
  onChoose: WhoScreenProps['onChoose'];
}) {
  const adultStepper =
    party.adults !== undefined &&
    ADULT_STEPPER_LABEL_KEYS.every((key) => labels[key] !== undefined);
  const adultSeat = (seat: number) =>
    seat === 1 || !party.adults ? party.adult : party.adults(seat);
  const adultKeys = new Set(
    Array.from({ length: maxPeople }, (_, index) => adultSeat(index + 1).key)
  );
  const isAdultSeat = (person: WizardPerson) => adultKeys.has(person.key);
  const adults = people.filter(isAdultSeat).length;
  const adultOn = adults > 0;
  // A grown-up's seat is never a child, flag or no flag.
  const childSeats = people.filter((person) => !person.adult && !isAdultSeat(person));
  const children = childSeats.length;
  const full = children + adults >= maxPeople;

  // Named children (from the add-child sheet) keep their seats, first; the
  // stepper adds and removes the unnamed ones after them.
  const generatedKeys = new Set(
    Array.from({ length: maxPeople }, (_, index) => party.child(index + 1).key)
  );
  const named = childSeats.filter((person) => !generatedKeys.has(person.key));

  const startEmpty = party.startEmpty === true;
  // The stepper never takes a named child away: their own card does that.
  // Without `startEmpty` it never empties the booking either.
  const floor = Math.max(named.length, adultOn || startEmpty ? 0 : 1);
  const adultFloor = children === 0 && !startEmpty ? 1 : 0;

  const answer = (count: number, grownUps: number) => {
    const kept = named;
    const used = new Set(kept.map((person) => person.key));
    const fill: WizardPerson[] = [];
    for (let seat = 1; kept.length + fill.length < count && seat <= maxPeople; seat += 1) {
      const next = party.child(seat);
      if (!used.has(next.key)) fill.push(next);
    }
    const seated = Array.from({ length: grownUps }, (_, index) => adultSeat(index + 1));
    onChoose([...kept, ...fill, ...seated], false);
  };

  // One child whenever the answer becomes empty (first frame or cleared
  // later): an empty answer would leave «next» dead on the most common visit.
  // Once per emptying, so a parent that ignores the answer is not flooded,
  // and a restored answer is never replaced.
  const wasEmpty = useRef(false);
  useEffect(() => {
    const empty = people.length === 0;
    if (empty && !wasEmpty.current && !startEmpty) answer(1, 0);
    // An empty answer `startEmpty` left alone is not one already seen: if the
    // flag goes, the child is still filled in.
    wasEmpty.current = empty && !startEmpty;
  });

  const text = (key: (typeof WHO_SCREEN_PARTY_LABEL_KEYS)[number], values = {}) => {
    const label = labels[key];
    return label ? fillLabel(label, values) : '';
  };
  const childrenNote = labels['who.party.childrenNote'];
  const adultNote = labels['who.party.adultNote'];

  return (
    <div className="space-y-3">
      {labels['who.party.lead'] && (
        <p className="text-sm text-muted-foreground">{renderLabel(labels['who.party.lead'])}</p>
      )}
      <div
        className={cn(
          'divide-y divide-border rounded-lg border border-border bg-card',
          classNames?.card
        )}
      >
        <StepperRow
          title={text('who.party.children')}
          note={childrenNote ? renderLabel(childrenNote) : null}
          value={children}
          countLabel={text('who.party.count', { count: children })}
          fewerLabel={text('who.party.fewer')}
          moreLabel={text('who.party.more')}
          canFewer={children > floor}
          canMore={!full}
          limitId={full ? LIMIT_ID : undefined}
          onFewer={() => answer(children - 1, adults)}
          onMore={() => answer(children + 1, adults)}
        />
        {adultStepper && (
          <StepperRow
            title={text('who.party.adult')}
            note={adultNote ? renderLabel(adultNote) : null}
            value={adults}
            countLabel={text('who.party.adultCount', { count: adults })}
            fewerLabel={text('who.party.adultFewer')}
            moreLabel={text('who.party.adultMore')}
            canFewer={adults > adultFloor}
            canMore={!full}
            limitId={full ? LIMIT_ID : undefined}
            onFewer={() => answer(children, adults - 1)}
            onMore={() => answer(children, adults + 1)}
          />
        )}
      </div>
      {!adultStepper && (
        <CheckRow
          checked={adultOn}
          // Never down to nobody: the last person in the booking stays — unless
          // the booking may start (and so stand) empty.
          disabled={(!adultOn && full) || (adultOn && children === 0 && !startEmpty)}
          describedBy={!adultOn && full ? LIMIT_ID : undefined}
          onToggle={() => answer(children, adultOn ? 0 : 1)}
          className={cn('min-h-14 justify-between px-5 py-3 text-sm', classNames?.card)}
          selectedClassName={classNames?.cardSelected}
        >
          <span className="flex min-w-0 flex-col text-left">
            <span className="font-medium">{text('who.party.adult')}</span>
            {/* «At the same time, in the next chair» is about the children: alone, it is noise. */}
            {adultNote && children > 0 && (
              <span className="text-muted-foreground">{renderLabel(adultNote)}</span>
            )}
          </span>
          <CheckCircle checked={adultOn} />
        </CheckRow>
      )}
      {labels['who.party.togetherHint'] && children > 0 && !adultOn && !full && (
        <p className="text-sm text-muted-foreground">
          {renderLabel(labels['who.party.togetherHint'])}
        </p>
      )}
      <p
        id={LIMIT_ID}
        aria-live="polite"
        className={slotClass(classNames, 'limit', 'min-h-5 text-sm text-muted-foreground')}
      >
        {full ? renderLabel(labels['who.family.limit'], { max: maxPeople }) : ''}
      </p>
    </div>
  );
}

const STEP_BUTTON =
  'flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40';

/** One «name, note, − n +» row of a guest party. */
function StepperRow({
  title,
  note,
  value,
  countLabel,
  fewerLabel,
  moreLabel,
  canFewer,
  canMore,
  limitId,
  onFewer,
  onMore,
}: {
  title: string;
  note: ReactNode;
  value: number;
  countLabel: string;
  fewerLabel: string;
  moreLabel: string;
  canFewer: boolean;
  canMore: boolean;
  limitId: string | undefined;
  onFewer: () => void;
  onMore: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{title}</p>
        {note !== null && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={fewerLabel}
          disabled={!canFewer}
          onClick={onFewer}
          className={STEP_BUTTON}
        >
          <Minus aria-hidden="true" className="size-4" />
        </button>
        <span
          aria-live="polite"
          aria-atomic="true"
          className="w-6 text-center text-lg font-bold tabular-nums"
        >
          <span aria-hidden="true">{value}</span>
          <span className="sr-only">{countLabel}</span>
        </span>
        <button
          type="button"
          aria-label={moreLabel}
          aria-describedby={limitId}
          disabled={!canMore}
          onClick={onMore}
          className={STEP_BUTTON}
        >
          <Plus aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * The guest chips as a radio group. Roving focus: one chip is in the tab
 * order (the chosen one, else the first) and the arrows move between them.
 * The arrows move focus WITHOUT choosing — a chip is a whole answer that
 * moves the wizard on, and an arrow key that jumped to the next step would
 * take the visitor somewhere they only glanced at.
 */
function GuestChips({
  choices,
  people,
  labels,
  classNames,
  onChoose,
}: {
  choices: WhoGuestChoice[];
  people: WizardPerson[];
  labels: WhoScreenLabels;
  classNames: SlotClassNames<WhoScreenSlot> | undefined;
  onChoose: WhoScreenProps['onChoose'];
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const checked = choices.findIndex((choice) => choicePressed(people, choice));
  const tabStop = checked === -1 ? 0 : checked;

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const step: number | undefined = ARROW_STEPS[event.key];
    let target: number;
    if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = choices.length - 1;
    else if (step !== undefined) target = (index + step + choices.length) % choices.length;
    else return;
    event.preventDefault();
    refs.current[target]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={labelText(labels['who.guest.groupLabel'])}
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {choices.map((choice, index) => {
        const pressed = index === checked;
        return (
          // biome-ignore lint/a11y/useSemanticElements: a native radio CHOOSES on the arrow keys, and choosing a chip moves the wizard on — these move focus only (see above).
          <button
            key={choice.key}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="radio"
            aria-checked={pressed}
            tabIndex={index === tabStop ? 0 : -1}
            onKeyDown={(event) => onKeyDown(event, index)}
            onClick={() => onChoose(choice.people, true)}
            className={cn(
              'flex h-12 items-center justify-center rounded-full border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              pressed
                ? 'border-primary bg-primary/10 font-bold ring-2 ring-primary'
                : 'border-border bg-card font-medium hover:border-primary',
              classNames?.chip,
              pressed && classNames?.chipSelected
            )}
          >
            {choiceLabel(choice, labels)}
          </button>
        );
      })}
    </div>
  );
}

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-full border',
        checked ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
      )}
    >
      {checked && <Check className="size-4" />}
    </span>
  );
}

/** The default person card: an initial on a tinted avatar, the name, a line, a tick. */
export function DefaultPersonCard({
  name,
  line,
  index,
  selected,
  disabled,
  describedBy,
  onToggle,
  className,
  selectedClassName,
}: PersonCardProps) {
  return (
    <CheckRow
      checked={selected}
      disabled={disabled}
      describedBy={describedBy}
      onToggle={onToggle}
      className={cn('h-[4.5rem] gap-3 px-4', className)}
      selectedClassName={selectedClassName}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-full font-sans text-lg font-bold',
          AVATAR_TINTS[index % AVATAR_TINTS.length]
        )}
      >
        {name.trim().charAt(0).toUpperCase()}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{name}</span>
        <span className="block truncate text-sm text-muted-foreground">{line}</span>
      </span>
      <CheckCircle checked={selected} />
    </CheckRow>
  );
}

/**
 * A card that IS a checkbox: a native one, visually hidden, inside the label
 * the whole card is — so the name is the card's text, Space toggles it, and
 * nothing re-implements what the browser already does. At the limit it is
 * `aria-disabled` rather than `disabled`: focusable, announced, inert.
 */
function CheckRow({
  checked,
  disabled,
  describedBy,
  onToggle,
  className,
  selectedClassName,
  children,
}: {
  checked: boolean;
  disabled: boolean;
  describedBy?: string;
  onToggle: () => void;
  className: string;
  selectedClassName?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        'flex w-full cursor-pointer items-center rounded-lg border text-left transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary',
        checked ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary',
        disabled && 'cursor-not-allowed opacity-50 hover:border-border',
        className,
        checked && selectedClassName
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        aria-disabled={disabled || undefined}
        aria-describedby={describedBy}
        onChange={() => {
          if (!disabled) onToggle();
        }}
      />
      {children}
    </label>
  );
}
