'use client';

import {
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
} from 'react';
import { cn } from '../lib/utils.js';
import type { BookingFormat } from './format.js';
import { renderLabel } from './internal/label-parts.js';
import { LiveStatus } from './live-status.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { BookingResourceDto, PartyMode } from './types.js';

/**
 * The stylist step — who would you like to see?
 *
 * Presentational, and one decision short of the machine's: `null` is a real
 * answer here — «first available» — so the tap raises `onPick(null)` rather
 * than raising nothing.
 *
 * ONE list of options at every width, restyled rather than swapped. Under `md`
 * it is a single fixed-height row of avatars that scrolls sideways — full
 * cards stacked above a time grid push everything a phone could tap below the
 * fold — and from `md` up it is the column of cards. A second, phone-only list
 * would be a second set of radios in the accessibility tree and a layout that
 * could only be picked after hydration, i.e. a jump.
 *
 * A radiogroup, because that is what it is: exactly one answer, «first
 * available» included. Arrow keys move and choose, Tab enters and leaves once.
 */

export const STYLIST_SCREEN_LABEL_KEYS = [
  'stylist.heading',
  'stylist.firstAvailable',
  'stylist.firstAvailableSubtitle',
  'stylist.firstAvailableBadge',
  'stylist.pendingName',
  'stylist.nextAvailable',
  'stylist.loading',
  'stylist.party.legend',
  'stylist.party.sequential',
  'stylist.party.sequentialMinutes',
  'stylist.party.parallel.two',
  'stylist.party.parallel.three',
  'stylist.party.parallel.other',
  'stylist.party.parallelMinutes',
  'stylist.party.parallelNote.two',
  'stylist.party.parallelNote.three',
  'stylist.party.parallelNote.other',
] as const;

export type StylistScreenLabels = Record<(typeof STYLIST_SCREEN_LABEL_KEYS)[number], string>;

/**
 * - `root` — the `<section>`
 * - `heading` — the `<h2>`
 * - `group` — the radiogroup (the sideways row / the column)
 * - `card` / `cardSelected` — a stylist option / the checked one (passed to `StylistCard`)
 * - `modeCard` / `modeCardSelected` — a family's mode card / the pressed one
 * - `nextAvailable` — a stylist option's next-opening line (passed to `StylistCard`)
 */
export type StylistScreenSlot =
  | 'root'
  | 'heading'
  | 'group'
  | 'card'
  | 'cardSelected'
  | 'modeCard'
  | 'modeCardSelected'
  | 'nextAvailable';

/** One option of the radiogroup as the card draws it. */
export interface StylistOption {
  /** `null` is «first available». */
  resourceId: string | null;
  name: string;
  /** What a phone tile has room for: a stylist's first name, else the whole label. */
  shortName: string;
  subtitle?: string | null;
  /** The avatar's fallback: initials, or a symbol for «first available». */
  badge: string;
  photoUrl?: string | null;
  /** The formatted next opening, when there is one. */
  availability?: string | null;
  availabilityLoading?: boolean;
  /** Hold the next-opening row's height even when empty. */
  reserveAvailability?: boolean;
}

export interface StylistCardProps {
  ref: Ref<HTMLButtonElement>;
  option: StylistOption;
  selected: boolean;
  tabIndex: number;
  onClick: () => void;
  labels: StylistScreenLabels;
  className?: string;
  selectedClassName?: string;
  /** Merged onto the next-opening line (the `nextAvailable` slot). */
  nextAvailableClassName?: string;
}

export interface StylistScreenComponents {
  StylistCard?: ComponentType<StylistCardProps>;
}

export interface StylistScreenProps {
  labels: StylistScreenLabels;
  /** `format.clock.when` prints the next opening; `stylistName` / `initials` the names. */
  format: BookingFormat;
  /** «Now» for «today / tomorrow» in the next-opening line. Default `Date.now()`. */
  now?: number;
  /** Every service in the basket. A named stylist has to cover all of them. */
  serviceIds: string[];
  resources: BookingResourceDto[];
  /** The machine's resource answer; `null` is «first available». */
  selectedResourceId?: string | null;
  /**
   * The first opening per stylist, epoch milliseconds. A stylist with no entry
   * gets no line: inventing a time, or printing an empty prefix, both promise
   * more than is known.
   */
  nextAvailableTs?: Record<string, number | null>;
  /** The next-opening answer is still on its way: the rows it will fill pulse instead of sitting blank. */
  nextAvailableLoading?: boolean;
  /**
   * The stylist list itself has not arrived. Cards of the final height stand
   * in for it, so what is below does not jump when it lands.
   */
  loading?: boolean;
  /** How many placeholders to hold while `loading`. Default 5. */
  skeletonCount?: number;
  /**
   * The name to show for a NAMED stylist restored before the list that can
   * vouch for them has landed (a saved draft, a rebook link). `null` reads
   * `stylist.pendingName`. Ignored once the list is here.
   */
  pendingName?: string | null;
  /** A polite announcement once the list is here (e.g. the restored stylist is gone). */
  notice?: string | null;
  onPick: (resourceId: string | null) => void;
  /**
   * Present only for a family. One child gets no picker: «one after the
   * other» is not a choice when there is nobody to be after.
   */
  party?: {
    mode: PartyMode;
    /** How many people, for the option labels. */
    size: number;
    /**
     * The size as the copy spells it (e.g. «two»), filled into `{sizeWord}`
     * in `stylist.party.parallel.*` and `stylist.party.parallelNote.*`.
     * Default: the number. Lets a pack keep the word as its own text piece
     * (`'We find {sizeWord} stylists …'`) rather than writing it into the
     * sentence.
     */
    sizeWord?: string;
    /** How long the visit is in each mode. */
    minutes: { sequential: number; parallel: number };
    onMode: (mode: PartyMode) => void;
  };
  classNames?: SlotClassNames<StylistScreenSlot>;
  components?: StylistScreenComponents;
}

/**
 * One height per breakpoint for every option, filled or not, so nothing on the
 * step — nor what is under it — moves when a list or a line lands: a 128 px
 * avatar tile on a phone, the 96 px card from `md` up.
 */
const OPTION_HEIGHT = 'h-32 md:h-24';

const DEFAULT_SKELETON_COUNT = 5;

const HEADING_ID = 'booking-stylist-heading';

/** «Ada» from «Ada Demo»: a phone tile has room for one word. */
function firstName(displayName: string): string {
  return displayName.split(/\s+/u)[0] ?? displayName;
}

/** Sizes the label packs write out in words; any other size reads `.other`. */
const SIZE_WORDS: Record<number, 'two' | 'three'> = { 2: 'two', 3: 'three' };

/**
 * The size-specific label: `.two`, `.three`, else `.other`, filled with
 * `{count}` (the number) and `{sizeWord}` (`party.sizeWord`, else the number).
 */
function bySize(
  labels: StylistScreenLabels,
  base: 'stylist.party.parallel' | 'stylist.party.parallelNote',
  size: number,
  sizeWord: string | undefined
): ReactNode {
  const suffix = SIZE_WORDS[size] ?? 'other';
  return renderLabel(labels[`${base}.${suffix}`], { count: size, sizeWord: sizeWord ?? size });
}

export function StylistScreen({
  labels,
  format,
  now,
  serviceIds,
  resources,
  selectedResourceId = null,
  nextAvailableTs,
  nextAvailableLoading = false,
  loading = false,
  skeletonCount = DEFAULT_SKELETON_COUNT,
  pendingName = null,
  notice = null,
  onPick,
  party,
  classNames,
  components,
}: StylistScreenProps) {
  // `every`, not `some`: the step asks one question for the whole visit, so a
  // stylist who covers one of two services is not an answer — it is a refusal
  // the engine issues at submit, offered here as a choice.
  const qualified = resources
    .filter((resource) => serviceIds.every((id) => resource.serviceIds.includes(id)))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const at = now ?? Date.now();

  // A named answer restored before the list: held in the first slot after
  // «first available», checked and tabbable, so the group does not claim
  // «nobody chosen» — nor put the tab stop on the one answer the visitor did
  // NOT give — for the second it takes the list to land.
  const held: StylistOption[] =
    selectedResourceId === null
      ? []
      : [pendingOption(selectedResourceId, pendingName, labels, format)];

  // First and pre-selected: most people do not mind who does it, and the
  // business fills its gaps best when they do not.
  const options: StylistOption[] = [
    {
      resourceId: null,
      name: labels['stylist.firstAvailable'],
      shortName: labels['stylist.firstAvailable'],
      subtitle: labels['stylist.firstAvailableSubtitle'],
      badge: labels['stylist.firstAvailableBadge'],
    },
    ...(loading
      ? held
      : qualified.map((resource) => {
          const nextTs = nextAvailableTs?.[resource.id];
          const name = format.stylistName(resource.name);
          return {
            resourceId: resource.id,
            name,
            shortName: firstName(name),
            subtitle: resource.bio,
            photoUrl: resource.photoUrl,
            badge: format.initials(name),
            availability: typeof nextTs === 'number' ? format.clock.when(nextTs, at) : null,
            availabilityLoading: nextAvailableLoading && typeof nextTs !== 'number',
            reserveAvailability: true,
          };
        })),
  ];

  return (
    <section aria-labelledby={HEADING_ID} className={slotClass(classNames, 'root', 'space-y-6')}>
      <h2
        id={HEADING_ID}
        tabIndex={-1}
        className={slotClass(
          classNames,
          'heading',
          'font-sans text-2xl font-bold outline-none md:text-3xl'
        )}
      >
        {labels['stylist.heading']}
      </h2>

      {party && (
        <fieldset className="flex flex-col gap-2 sm:flex-row">
          <legend className="mb-2 font-sans text-lg font-bold">
            {labels['stylist.party.legend']}
          </legend>
          <ModeCard
            selected={party.mode === 'sequential'}
            onClick={() => party.onMode('sequential')}
            title={labels['stylist.party.sequential']}
            subtitle={renderLabel(labels['stylist.party.sequentialMinutes'], {
              minutes: party.minutes.sequential,
            })}
            classNames={classNames}
          />
          <ModeCard
            selected={party.mode === 'parallel'}
            onClick={() => party.onMode('parallel')}
            title={bySize(labels, 'stylist.party.parallel', party.size, party.sizeWord)}
            subtitle={renderLabel(labels['stylist.party.parallelMinutes'], {
              minutes: party.minutes.parallel,
            })}
            classNames={classNames}
          />
        </fieldset>
      )}

      {party?.mode === 'parallel' ? (
        // No stylist list, deliberately. People seen at once are seen by
        // different stylists, so a named preference and this mode cannot both
        // be true — and the machine drops the preference when the mode is
        // chosen. A list left on screen would show a stylist the search is
        // quietly ignoring, which is the worse of the two ways to be wrong.
        <p className="rounded-lg border border-border bg-card px-5 py-4 text-sm">
          {bySize(labels, 'stylist.party.parallelNote', party.size, party.sizeWord)}
        </p>
      ) : (
        <StylistRadioGroup
          options={options}
          selectedResourceId={selectedResourceId}
          // The held option takes one placeholder's place, so the row is
          // exactly as long as it was and nothing after it moves.
          skeletons={loading ? Math.max(0, skeletonCount - (options.length - 1)) : 0}
          busy={loading}
          onPick={onPick}
          labels={labels}
          classNames={classNames}
          Card={components?.StylistCard ?? DefaultStylistCard}
        />
      )}
      {/* Beside the list, not in it: a status is not a list item. */}
      <LiveStatus text={loading ? labels['stylist.loading'] : notice} />
    </section>
  );
}

/**
 * The options as one radiogroup with a roving tab stop.
 *
 * Arrow keys move AND choose, as a native radio group does — picking a
 * stylist is cheap and reversible, and a group that needed Space after every
 * arrow would be a list of buttons in a radiogroup's clothes.
 */
function StylistRadioGroup({
  options,
  selectedResourceId,
  skeletons,
  busy,
  onPick,
  labels,
  classNames,
  Card,
}: {
  options: StylistOption[];
  selectedResourceId: string | null;
  skeletons: number;
  busy: boolean;
  onPick: (resourceId: string | null) => void;
  labels: StylistScreenLabels;
  classNames: SlotClassNames<StylistScreenSlot> | undefined;
  Card: ComponentType<StylistCardProps>;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedIndex = options.findIndex((option) => option.resourceId === selectedResourceId);
  // A preference the list cannot show (the stylist does not cover this basket)
  // still leaves the group one tab stop: the first option.
  const tabStop = selectedIndex === -1 ? 0 : selectedIndex;

  // On a phone the chosen stylist may sit past the right edge of the row —
  // coming back to the step must show the answer already given. Only the row
  // is scrolled, never the page: `scrollIntoView` would also move the
  // viewport. The row is `relative`, so an option's `offsetLeft` is already
  // measured from it.
  useEffect(() => {
    const group = groupRef.current;
    const chosen = optionRefs.current[tabStop];
    if (!group || !chosen || group.scrollWidth <= group.clientWidth) return;
    group.scrollLeft = Math.max(0, chosen.offsetLeft - 8);
  }, [tabStop]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1;
    const from = optionRefs.current.indexOf(document.activeElement as HTMLButtonElement | null);
    if (from === -1) return;
    let to: number;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        to = from === last ? 0 : from + 1;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        to = from === 0 ? last : from - 1;
        break;
      case 'Home':
        to = 0;
        break;
      case 'End':
        to = last;
        break;
      default:
        return;
    }
    event.preventDefault();
    optionRefs.current[to]?.focus();
    const target = options[to];
    if (target) onPick(target.resourceId);
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-labelledby={HEADING_ID}
      aria-busy={busy}
      onKeyDown={onKeyDown}
      data-testid="stylist-options"
      // Phone: one row of fixed height, scrolled sideways with snap; the
      // padding leaves room for the selected avatar's ring, which the scroll
      // box would otherwise clip. `md`: the column of cards.
      className={slotClass(
        classNames,
        'group',
        'relative -mx-1 flex h-36 snap-x snap-mandatory scroll-px-1 gap-1 overflow-x-auto overscroll-x-contain px-1 py-2',
        'md:mx-0 md:h-auto md:snap-none md:flex-col md:gap-2 md:overflow-visible md:p-0'
      )}
    >
      {options.map((option, index) => (
        <Card
          key={option.resourceId ?? 'first-available'}
          ref={(node) => {
            optionRefs.current[index] = node;
          }}
          option={option}
          selected={option.resourceId === selectedResourceId}
          tabIndex={index === tabStop ? 0 : -1}
          onClick={() => onPick(option.resourceId)}
          labels={labels}
          className={classNames?.card}
          selectedClassName={classNames?.cardSelected}
          nextAvailableClassName={classNames?.nextAvailable}
        />
      ))}
      {Array.from({ length: skeletons }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

/** The restored stylist's stand-in: a real, checked radio of the final size,
 * with its next-opening row pulsing like every card still waiting for one. */
function pendingOption(
  resourceId: string,
  pendingName: string | null,
  labels: StylistScreenLabels,
  format: BookingFormat
): StylistOption {
  const known = pendingName?.trim() ? pendingName.trim() : null;
  const name = known ?? labels['stylist.pendingName'];
  return {
    resourceId,
    name,
    shortName: known ? firstName(name) : name,
    badge: known ? format.initials(name) : '…',
    availability: null,
    availabilityLoading: true,
    reserveAvailability: true,
  };
}

/**
 * One of the two answers to how a family is seen.
 *
 * Its own card rather than a stylist card: that one carries a photo or a set
 * of initials, which a mode does not have, and a mode with an avatar reads as
 * a third stylist.
 */
function ModeCard({
  selected,
  onClick,
  title,
  subtitle,
  classNames,
}: {
  selected: boolean;
  onClick: () => void;
  title: ReactNode;
  subtitle: ReactNode;
  classNames: SlotClassNames<StylistScreenSlot> | undefined;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'flex min-h-16 flex-1 flex-col justify-center rounded-lg border px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected
          ? 'border-primary bg-primary/10 font-semibold ring-2 ring-primary'
          : 'border-border bg-card hover:border-primary',
        classNames?.modeCard,
        selected && classNames?.modeCardSelected
      )}
    >
      <span className="font-medium">{title}</span>
      <span className="text-sm font-normal text-muted-foreground tabular-nums">{subtitle}</span>
    </button>
  );
}

/** The default stylist option: avatar (photo or badge), name(s), bio, next opening. */
export function DefaultStylistCard({
  ref,
  option,
  selected,
  tabIndex,
  onClick,
  labels,
  className,
  selectedClassName,
  nextAvailableClassName,
}: StylistCardProps) {
  const id = useId();
  const nameId = `${id}-name`;
  const nextId = `${id}-next`;
  const bioId = `${id}-bio`;
  const {
    name,
    subtitle,
    badge,
    photoUrl,
    availability,
    availabilityLoading,
    reserveAvailability,
  } = option;

  return (
    // biome-ignore lint/a11y/useSemanticElements: a card with a photo, two names and an opening time is not an <input type="radio">; the group owns the roving tab stop and the arrow keys.
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={selected}
      tabIndex={tabIndex}
      onClick={onClick}
      // Named by the FULL name and its next opening, whichever of the two
      // name spans the breakpoint is showing: a phone shows the first name, a
      // screen reader on that phone still hears the whole one.
      aria-labelledby={availability ? `${nameId} ${nextId}` : nameId}
      aria-describedby={subtitle ? bioId : undefined}
      // Ring and weight alongside the tint: the selected option has to be
      // obvious on a monochrome screen too. On a phone the ring is on the
      // avatar; from `md` it is on the card.
      className={cn(
        'group flex w-24 shrink-0 snap-start flex-col items-center gap-1 rounded-lg px-1 pt-1 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'md:w-full md:shrink md:flex-row md:gap-4 md:border md:px-5 md:py-4 md:text-left',
        OPTION_HEIGHT,
        selected
          ? 'font-semibold md:border-primary md:bg-primary/10 md:ring-2 md:ring-primary'
          : 'md:border-border md:bg-card md:hover:border-primary',
        className,
        selected && selectedClassName
      )}
    >
      <span
        aria-hidden="true"
        data-testid="stylist-avatar"
        className={cn(
          'flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary/30 font-semibold md:size-12',
          selected
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background md:ring-0 md:ring-offset-0'
            : 'ring-1 ring-border md:ring-0'
        )}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt=""
            className="size-full object-cover"
            width={56}
            height={56}
            loading="lazy"
            decoding="async"
          />
        ) : (
          badge
        )}
      </span>
      <span className="flex w-full min-w-0 flex-col md:w-auto">
        <span aria-hidden="true" className="h-5 truncate text-sm font-medium md:hidden">
          {option.shortName}
        </span>
        <span id={nameId} className="hidden truncate font-medium md:block">
          {name}
        </span>
        {subtitle && (
          <span id={bioId} className="hidden truncate text-sm text-muted-foreground md:block">
            {subtitle}
          </span>
        )}
        {availability ? (
          <span
            id={nextId}
            data-testid="next-available-row"
            className={cn(
              'line-clamp-2 h-8 text-xs leading-4 text-foreground tabular-nums md:line-clamp-1 md:h-5 md:text-sm md:leading-5',
              nextAvailableClassName
            )}
          >
            <span className="sr-only md:not-sr-only">{labels['stylist.nextAvailable']}</span>{' '}
            {availability}
          </span>
        ) : (
          reserveAvailability && (
            <span
              data-testid="next-available-row"
              aria-hidden="true"
              className="flex h-8 justify-center pt-1 md:block md:h-5 md:py-1"
            >
              {availabilityLoading && (
                <span className="block h-3 w-16 animate-pulse rounded bg-muted md:w-36" />
              )}
            </span>
          )
        )}
      </span>
    </button>
  );
}

/** A stylist option before there is a stylist: the same box, the same circle, at both widths. */
function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      data-testid="stylist-skeleton"
      className={cn(
        'flex w-24 shrink-0 flex-col items-center gap-1 px-1 pt-1',
        'md:w-full md:flex-row md:gap-4 md:rounded-lg md:border md:border-border md:bg-card md:px-5 md:py-4',
        OPTION_HEIGHT
      )}
    >
      <span className="size-14 shrink-0 animate-pulse rounded-full bg-muted md:size-12" />
      <span className="flex w-full min-w-0 flex-col items-center gap-2 md:w-auto md:flex-1 md:items-start">
        <span className="h-4 w-14 animate-pulse rounded bg-muted md:w-28" />
        <span className="h-3 w-16 animate-pulse rounded bg-muted md:w-40" />
      </span>
    </div>
  );
}
