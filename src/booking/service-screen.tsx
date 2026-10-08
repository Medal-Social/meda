'use client';

import { type ComponentType, type ReactNode, useState } from 'react';
import { cn } from '../lib/utils.js';
import type { BookingFormat } from './format.js';
import { renderLabel } from './internal/label-parts.js';
import {
  MultiServiceCard,
  PersonTabs,
  serviceTabId,
  serviceTabPanelId,
  TotalBar,
} from './internal/service-multi.js';
import { BookingButton } from './internal/ui.js';
import { type BookingLabel, fillLabel, labelText } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { BookingServiceDto } from './types.js';

/**
 * The service step — what should be done?
 *
 * Presentational. A tap raises `onPick` and the caller's machine decides what
 * that means; nothing here knows which step comes next or whether the basket
 * already holds a child.
 *
 * With a `selection`, the step is multi-select instead: one person may have
 * several services as ONE visit, the cards tick rather than answer, and a
 * sticky bar carries the running total and the way on.
 */

export const SERVICE_SCREEN_LABEL_KEYS = [
  'service.heading',
  'service.categoriesLegend',
  'service.sameAsLast',
  'service.chooseOther',
  'service.duration',
  'service.phoneOnly',
  'service.phoneOnlyLinkLabel',
  'service.ageDivider.named',
  'service.ageDivider.unnamed',
  'service.party.listLabel',
  'service.party.adultAlone',
  'service.party.nothingFits',
  'service.party.remove',
] as const;

/**
 * The keys only the multi-select step reads (`ServiceScreenProps.selection`).
 * Optional in `ServiceScreenLabels`, so a pack written before they existed
 * still type-checks; a `selection` carries them all, required, in
 * `ServiceSelection.labels` — a multi-select step cannot compile without them.
 *
 * - `service.multiHint` — under the heading: you may tick more than one;
 * - `service.total` — the sticky bar's running total, `{minutes}` and `{price}`;
 * - `service.chooseFirst` — the sticky bar's line while someone has nothing ticked;
 * - `service.continue` — the sticky bar's button;
 * - `service.party.nothingBookable` — a family member with nothing on their
 *   menu, `{label}`: the business takes nothing for them online (the party's
 *   size is no longer the reason, as `service.party.nothingFits` says);
 * - `service.tabDone` — read after a family member's tab name once they have
 *   something ticked (the visible tick, in words): «Theo, ferdig».
 */
export const SERVICE_SCREEN_MULTI_LABEL_KEYS = [
  'service.multiHint',
  'service.total',
  'service.chooseFirst',
  'service.continue',
  'service.party.nothingBookable',
  'service.tabDone',
] as const;

/** The multi-select step's labels, every one required (`ServiceSelection.labels`). */
export type ServiceMultiLabels = Record<
  (typeof SERVICE_SCREEN_MULTI_LABEL_KEYS)[number],
  BookingLabel
>;

export type ServiceScreenLabels = Record<(typeof SERVICE_SCREEN_LABEL_KEYS)[number], BookingLabel> &
  Partial<ServiceMultiLabels>;

/**
 * - `root` — the `<section>`
 * - `heading` — the `<h2>`
 * - `pill` / `pillSelected` — a category pill / the marked one
 * - `groupHeading` — a category's (or a party member's) `<h3>`
 * - `card` / `cardSelected` — a service card / a pressed one (passed to `ServiceCard`)
 * - `price` — a card's price (passed to `ServiceCard`, and the «same as last time» card's)
 * - `tab` / `tabSelected` — a person's tab in a multi-select family / the open one
 * - `bar` — the multi-select step's sticky total bar
 */
export type ServiceScreenSlot =
  | 'tab'
  | 'tabSelected'
  | 'bar'
  | 'root'
  | 'heading'
  | 'pill'
  | 'pillSelected'
  | 'groupHeading'
  | 'card'
  | 'cardSelected'
  | 'price';

/** One service group, in display order. */
export interface ServiceScreenCategory {
  key: string;
  /** The pill's and the section heading's text. */
  label: string;
  /**
   * Who the group is for. In a family, a child's menu is `childCategory` plus
   * every group marked `'any'` (an ear piercing, say) — never a grown-ups'
   * group. Absent: the group is a grown-ups' one, as before.
   */
  audience?: 'child' | 'adult' | 'any';
}

/** A person's «same as last time», and the one-line note when it was swapped (e.g. for age). */
export interface ServiceSuggestion {
  service: BookingServiceDto;
  note?: string;
}

/** One chair on the step for a family — who, as the section heading names them. */
export interface ServicePartyPerson {
  key: string;
  /** The section heading, e.g. «Theo · 7 years», «Child 2», «Myself». */
  label: string;
  adult: boolean;
  suggestion?: ServiceSuggestion | null;
  /** The child's own name, for the age divider; absent for an anonymous seat. */
  name?: string;
}

export interface ServiceCardProps {
  service: BookingServiceDto;
  /**
   * `book` — a one-tap card that answers the step;
   * `choice` — one person's pressed/unpressed choice in a family;
   * `phone` — not bookable online: no button, a number to call instead.
   */
  kind: 'book' | 'choice' | 'phone';
  selected: boolean;
  /**
   * `choice` only: the card is one of several the person may tick (a
   * checkbox, `selected` = ticked), not their one answer (a pressed button).
   * Set on the multi-select step (`ServiceScreenProps.selection`).
   */
  multiple?: boolean;
  /** Raised on a tap. On a `multiple` card it toggles; nothing advances. */
  onPick: () => void;
  /** The number for `phone` cards; `null` renders the sentence without a link. */
  phone: string | null;
  format: BookingFormat;
  labels: ServiceScreenLabels;
  className?: string;
  selectedClassName?: string;
  /** Merged onto the price (the `price` slot). */
  priceClassName?: string;
}

/**
 * The multi-select step: each person ticks one or more services, done back to
 * back as one visit. The caller's machine owns the lists; the screen only
 * reports taps.
 */
export interface ServiceSelection {
  /** Each person's services so far, in order (index = party person; a lone person is index 0). */
  lists: ReadonlyArray<ReadonlyArray<{ id: string }>>;
  /** A tick or an untick on the person whose tab is open (0 for a lone person). Never advances. */
  onToggle: (personIndex: number, service: BookingServiceDto) => void;
  /** «Next» in the sticky bar. Called whether or not `canContinue`: the caller decides. */
  onContinue: () => void;
  /** The running total for the whole booking, or `null` when nothing is chosen. */
  total: { minutes: number; priceOre: number } | null;
  /**
   * Whether every person has at least one service. «Next» stays enabled
   * either way (a disabled button explains nothing); while `false` the bar
   * shows `service.chooseFirst` instead of the total.
   */
  canContinue: boolean;
  /** A refusal to say politely (e.g. too many services), announced as a live region. */
  notice?: string | null;
  /**
   * The multi-select step's labels (`SERVICE_SCREEN_MULTI_LABEL_KEYS`), all
   * required: a pack written before multi-select cannot reach this step and
   * draw an unnamed «Next». A pack that defines them can be passed whole.
   */
  labels: ServiceMultiLabels;
}

export interface ServiceScreenComponents {
  ServiceCard?: ComponentType<ServiceCardProps>;
}

export interface ServiceScreenProps {
  labels: ServiceScreenLabels;
  format: BookingFormat;
  /** The full catalogue, in the order the source returned it. */
  services: BookingServiceDto[];
  /** The groups, in display order. Only groups with services are drawn. */
  categories: ServiceScreenCategory[];
  /**
   * The group a service is filed under. Default: its `category` when that is
   * one of `categories`, else the LAST category — a service from a category
   * nobody planned for is filed at the end rather than dropped off the page.
   */
  categoryOf?: (service: BookingServiceDto) => string;
  /**
   * For a family: the category that is the children's menu. A child is
   * offered only it, an adult everything else. Absent: no split.
   */
  childCategory?: string;
  /**
   * Whether a bookable service suits the person at `personIndex` (0 for a
   * party of one) — typically their age on the day against the service's age
   * band. `false` moves it below a divider: suggested against, never refused.
   * Default: everything fits.
   */
  serviceFits?: (service: BookingServiceDto, personIndex: number) => boolean;
  /**
   * The business's number, for the services that cannot be booked online.
   * `null` renders the same sentence without a link: a `tel:` that dials
   * nothing looks like an offer and fails in the visitor's hand.
   */
  phone?: string | null;
  /** The category pill to open on (e.g. from a link). Unknown or empty categories are ignored. */
  initialCategory?: string | null;
  onPick: (service: BookingServiceDto) => void;
  /**
   * A FAMILY: the people the first step seated, when there is more than one,
   * each answered on their own. Absent or a single person, the step is the
   * one-tap catalogue and `onPick` is the answer.
   */
  party?: {
    people: ReadonlyArray<ServicePartyPerson>;
    /** `choices[i]` is `people[i]`'s service so far, `null` for none yet. */
    choices: ReadonlyArray<{ id: string } | null>;
    onPickFor: (index: number, service: BookingServiceDto) => void;
    /** Take one person out of the party — the way on when nothing fits them in a party this size. */
    onRemove?: (index: number) => void;
  };
  /** «Same as last time» for a party of one, offered first. The catalogue below stays whole. */
  suggestion?: ServiceSuggestion | null;
  /** The service already chosen for a party of one. */
  chosenId?: string | null;
  /** The child's name for a party of one, for the age divider. */
  childName?: string | null;
  /**
   * The possessive of a name for the age divider's `{nameGenitive}` — the
   * rule is the language's (e.g. «Theos» / «Jonas'»). Default: the name as is.
   */
  possessive?: (name: string) => string;
  classNames?: SlotClassNames<ServiceScreenSlot>;
  components?: ServiceScreenComponents;
  /**
   * Switches the step to multi-select (see `ServiceSelection`): bookable cards
   * become checkboxes, a family gets one tab per person, and a sticky bar
   * shows the total and «Next». `onPick` / `party.onPickFor` then serve only
   * the one-tap «same as last time». Its labels come in `selection.labels`.
   * Absent: the one-tap step, unchanged.
   */
  selection?: ServiceSelection;
}

const HEADING_ID = 'booking-service-heading';

function groupHeadingId(category: string): string {
  return `booking-services-${category}`;
}

const HINT_ID = 'booking-service-hint';

const allFit = () => true;
const asIs = (name: string) => name;

/** The age divider's sentence for `name`. */
function ageDividerLabel(
  labels: ServiceScreenLabels,
  name: string | null | undefined,
  possessive: (name: string) => string
): string {
  if (!name) return labelText(labels['service.ageDivider.unnamed']);
  return fillLabel(labels['service.ageDivider.named'], {
    name,
    nameGenitive: possessive(name),
  });
}

/** Split a menu into what fits and what usually does not. Phone-only cards always stay put. */
function byFit(
  services: BookingServiceDto[],
  fits: (service: BookingServiceDto) => boolean
): { fitting: BookingServiceDto[]; unlikely: BookingServiceDto[] } {
  const fitting: BookingServiceDto[] = [];
  const unlikely: BookingServiceDto[] = [];
  for (const service of services) {
    (!service.bookableOnline || fits(service) ? fitting : unlikely).push(service);
  }
  return { fitting, unlikely };
}

interface Shared {
  labels: ServiceScreenLabels;
  format: BookingFormat;
  classNames: SlotClassNames<ServiceScreenSlot> | undefined;
  Card: ComponentType<ServiceCardProps>;
  possessive: (name: string) => string;
}

function cardProps(shared: Shared) {
  return {
    format: shared.format,
    labels: shared.labels,
    className: shared.classNames?.card,
    selectedClassName: shared.classNames?.cardSelected,
    priceClassName: shared.classNames?.price,
  };
}

/** The ids `personIndex` has ticked so far. */
function tickedBy(selection: ServiceSelection, personIndex: number): Set<string> {
  return new Set((selection.lists[personIndex] ?? []).map((service) => service.id));
}

export function ServiceScreen(props: ServiceScreenProps) {
  const shared: Shared = {
    labels: props.labels,
    format: props.format,
    classNames: props.classNames,
    Card: props.components?.ServiceCard ?? DefaultServiceCard,
    possessive: props.possessive ?? asIs,
  };
  if (props.party && props.party.people.length > 1) {
    return <PartyServiceScreen {...props} party={props.party} shared={shared} />;
  }
  return <SingleServiceScreen {...props} shared={shared} />;
}

function Heading({
  shared,
  multiLabels = null,
}: {
  shared: Shared;
  /** The multi-select step's labels; `null` on the one-tap step. */
  multiLabels?: ServiceMultiLabels | null;
}) {
  const heading = (
    <h2
      id={HEADING_ID}
      tabIndex={-1}
      className={slotClass(
        shared.classNames,
        'heading',
        'font-sans text-2xl font-bold outline-none md:text-3xl'
      )}
    >
      {shared.labels['service.heading']}
    </h2>
  );
  if (!multiLabels) return heading;
  // «Choose one or more» — said once, under the question, so the first tick
  // is not a surprise when it does not move the step on.
  return (
    <div className="space-y-1">
      {heading}
      <p id={HINT_ID} className="text-sm text-muted-foreground">
        {renderLabel(multiLabels['service.multiHint'])}
      </p>
    </div>
  );
}

/**
 * Below the ordinary list: what usually does not suit this person, still one
 * tap away. A labelled list, so a screen reader hears the divider as the name
 * of what follows rather than as a stray sentence.
 */
function UnlikelyForAge({
  id,
  name,
  services,
  shared,
  children,
}: {
  id: string;
  name: string | null | undefined;
  services: BookingServiceDto[];
  shared: Shared;
  children: (service: BookingServiceDto) => ReactNode;
}) {
  if (services.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 pt-2">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        <p id={id} className="text-sm text-muted-foreground">
          {ageDividerLabel(shared.labels, name, shared.possessive)}
        </p>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      <ul aria-labelledby={id} className="space-y-2">
        {services.map((service) => (
          <li key={service.id}>{children(service)}</li>
        ))}
      </ul>
    </div>
  );
}

function SingleServiceScreen({
  services,
  categories,
  categoryOf,
  serviceFits = allFit,
  phone = null,
  initialCategory = null,
  onPick,
  suggestion = null,
  chosenId = null,
  childName = null,
  selection,
  shared,
}: ServiceScreenProps & { shared: Shared }) {
  const { Card, labels, classNames } = shared;
  const ticked = selection ? tickedBy(selection, 0) : null;
  // One person: a tap either answers the step or, multi-select, ticks.
  const bookable = (service: BookingServiceDto) =>
    ticked && selection
      ? {
          kind: 'choice' as const,
          multiple: true,
          selected: ticked.has(service.id),
          onPick: () => selection.onToggle(0, service),
        }
      : { kind: 'book' as const, selected: false, onPick: () => onPick(service) };
  const fileUnder = categoryOf ?? defaultCategoryOf(categories);
  // What certainly does not suit this person moves below a divider, still
  // bookable. Telephone-only cards stay where they are: the list stays whole.
  const { fitting: offered, unlikely } = byFit(services, (service) => serviceFits(service, 0));
  const groups = categories
    .map((category) => ({
      category,
      items: offered.filter((service) => fileUnder(service) === category.key),
    }))
    .filter((group) => group.items.length > 0);

  // Null until the visitor taps a pill, then read back through the groups that
  // exist — seeding it with the first category's key instead would leave a
  // catalogue without that group pointing at a section that is not on the
  // page. An `initialCategory` seeds it (in the initialiser, so the server
  // render already marks the right pill) when that group exists.
  const [tapped, setTapped] = useState<string | null>(() =>
    initialCategory !== null && groups.some((group) => group.category.key === initialCategory)
      ? initialCategory
      : null
  );
  const current = tapped ?? groups[0]?.category.key ?? null;

  function jumpTo(category: string) {
    setTapped(category);
    // The pills mark where you are in the list; they never shorten it.
    // Filtering would hide most of the catalogue behind a default nobody
    // chose. `scrollIntoView` is absent in jsdom and older browsers; the tap
    // still marks the pill, which is the half that matters.
    document.getElementById(groupHeadingId(category))?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <section aria-labelledby={HEADING_ID} className={slotClass(classNames, 'root', 'space-y-6')}>
      <Heading shared={shared} multiLabels={selection?.labels} />

      {suggestion && (
        <div className="space-y-2">
          <SameAsLast
            suggestion={suggestion}
            selected={
              ticked ? ticked.has(suggestion.service.id) : chosenId === suggestion.service.id
            }
            onPick={() => onPick(suggestion.service)}
            shared={shared}
          />
          <p className="text-sm font-semibold text-muted-foreground">
            {labels['service.chooseOther']}
          </p>
        </div>
      )}

      {groups.length > 1 && (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">{labels['service.categoriesLegend']}</legend>
          {groups.map(({ category }) => {
            const marked = category.key === current;
            return (
              <BookingButton
                key={category.key}
                variant="outline"
                size="sm"
                aria-pressed={marked}
                onClick={() => jumpTo(category.key)}
                // Weight and ring carry the selection alongside the colour, so
                // it survives a monochrome screen and a colour-blind visitor.
                className={cn(
                  'rounded-full',
                  marked
                    ? 'font-bold ring-2 ring-primary bg-primary/10 border-primary text-foreground'
                    : 'font-normal',
                  classNames?.pill,
                  marked && classNames?.pillSelected
                )}
              >
                {category.label}
              </BookingButton>
            );
          })}
        </fieldset>
      )}

      {groups.map(({ category, items }) => (
        <section
          key={category.key}
          aria-labelledby={groupHeadingId(category.key)}
          // Clears a sticky header when a pill jumps here.
          className="scroll-mt-24 space-y-3"
        >
          <h3
            id={groupHeadingId(category.key)}
            className={slotClass(
              classNames,
              'groupHeading',
              'font-sans text-lg font-bold text-muted-foreground'
            )}
          >
            {category.label}
          </h3>
          <ul aria-describedby={selection ? HINT_ID : undefined} className="space-y-2">
            {items.map((service) => (
              <li key={service.id}>
                <Card
                  service={service}
                  {...(service.bookableOnline
                    ? bookable(service)
                    : { kind: 'phone' as const, selected: false, onPick: () => onPick(service) })}
                  phone={phone}
                  {...cardProps(shared)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <UnlikelyForAge
        id="booking-services-unlikely"
        name={childName}
        services={unlikely}
        shared={shared}
      >
        {(service) => (
          <Card service={service} {...bookable(service)} phone={phone} {...cardProps(shared)} />
        )}
      </UnlikelyForAge>

      {selection && (
        <TotalBar selection={selection} format={shared.format} classNames={classNames} />
      )}
    </section>
  );
}

function defaultCategoryOf(
  categories: ServiceScreenCategory[]
): (service: BookingServiceDto) => string {
  const known = new Set(categories.map((category) => category.key));
  const fallback = categories[categories.length - 1]?.key ?? '';
  return (service) => (known.has(service.category) ? service.category : fallback);
}

/**
 * The step for a family: one short list per person, each answered on its own.
 *
 * What a person in a party can have is what the business takes online and —
 * like the booking engine — nothing whose `maxPerBooking` is below the party's
 * size: the strictest service in a request sets the limit for all of it. With
 * a `childCategory`, a child gets that menu plus the groups meant for anyone
 * (`audience: 'any'`), and an adult everything but the children's — which is
 * often nothing, and they are told so.
 */
function PartyServiceScreen({
  services,
  categories,
  categoryOf,
  childCategory,
  serviceFits = allFit,
  party,
  selection,
  shared,
}: ServiceScreenProps & { party: NonNullable<ServiceScreenProps['party']>; shared: Shared }) {
  const { Card, labels, classNames } = shared;
  const fileUnder = categoryOf ?? defaultCategoryOf(categories);
  const keysFor = (audience: ServiceScreenCategory['audience']) =>
    new Set(categories.filter((group) => group.audience === audience).map((group) => group.key));
  // Children's groups: the configured one plus any group marked 'child'.
  const forChildren = keysFor('child');
  if (childCategory !== undefined) forChildren.add(childCategory);
  const forAnyone = keysFor('any');
  const size = party.people.length;
  const [active, setActive] = useState(0);
  // Multi-select: the engine books a grown-up's visit alongside the
  // children's, so the party's size no longer narrows the menu; a refusal
  // comes back from the caller as `selection.notice`.
  const fits = services.filter(
    (service) =>
      service.bookableOnline && (selection !== undefined || service.maxPerBooking >= size)
  );

  function personBody(person: ServicePartyPerson, index: number): ReactNode {
    const { fitting: menu, unlikely } = byFit(
      // A grown-up gets the grown-ups' menu and a child the children's —
      // a kids' cut for «myself» is not an answer, it is a way round the
      // note below that books the wrong thing.
      childCategory === undefined
        ? fits
        : fits.filter((service) => {
            const key = fileUnder(service);
            if (forChildren.has(key)) return !person.adult;
            // A child gets an «anyone» group only when the service's OWN
            // category is that group — never through the display fallback,
            // which files an unlisted (possibly grown-up) category under the
            // last group.
            return person.adult || forAnyone.has(service.category);
          }),
      (service) => serviceFits(service, index)
    );
    const ticked = selection ? tickedBy(selection, index) : null;
    const chosen = party.choices[index]?.id ?? null;
    const suggestion = person.suggestion ?? null;
    const pick = (service: BookingServiceDto) => party.onPickFor(index, service);
    const choiceCard = (service: BookingServiceDto) => (
      <Card
        service={service}
        kind="choice"
        {...(ticked && selection
          ? {
              multiple: true,
              selected: ticked.has(service.id),
              onPick: () => selection.onToggle(index, service),
            }
          : { selected: service.id === chosen, onPick: () => pick(service) })}
        phone={null}
        {...cardProps(shared)}
      />
    );
    const unlikelyList = (
      <UnlikelyForAge
        id={`booking-service-unlikely-${index}`}
        name={person.name}
        services={unlikely}
        shared={shared}
      >
        {choiceCard}
      </UnlikelyForAge>
    );
    const listLabel = fillLabel(labels['service.party.listLabel'], { label: person.label });
    if (suggestion && menu.some((service) => service.id === suggestion.service.id)) {
      return (
        <PersonWithSuggestion
          // A fresh disclosure per person: the tabs share one panel.
          key={person.key}
          listLabel={listLabel}
          suggestion={suggestion}
          menu={menu}
          ticked={ticked}
          chosen={chosen}
          onPick={pick}
          choiceCard={choiceCard}
          unlikely={unlikelyList}
          hasUnlikely={unlikely.length > 0}
          shared={shared}
        />
      );
    }
    if (menu.length === 0 && unlikely.length === 0) {
      return (
        <NothingInThisParty
          person={person}
          labels={labels}
          multiLabels={selection?.labels ?? null}
          onRemove={party.onRemove ? () => party.onRemove?.(index) : undefined}
        />
      );
    }
    return (
      <>
        {menu.length > 0 && (
          <ul aria-label={listLabel} className="space-y-2">
            {menu.map((service) => (
              <li key={service.id}>{choiceCard(service)}</li>
            ))}
          </ul>
        )}
        {unlikelyList}
      </>
    );
  }

  if (selection) {
    // A tab that left the party falls back to the last one still in it.
    const current = Math.min(active, size - 1);
    return (
      <section aria-labelledby={HEADING_ID} className={slotClass(classNames, 'root', 'space-y-6')}>
        <Heading shared={shared} multiLabels={selection.labels} />
        <PersonTabs
          people={party.people}
          active={current}
          done={(index) => (selection.lists[index]?.length ?? 0) > 0}
          onSelect={setActive}
          labels={selection.labels}
          labelledBy={HEADING_ID}
          describedBy={HINT_ID}
          classNames={classNames}
        />
        {/* One panel, the open person's: no index lookup to go wrong. */}
        {party.people.map((person, index) =>
          index === current ? (
            <section
              key={person.key}
              role="tabpanel"
              id={serviceTabPanelId(index)}
              aria-labelledby={serviceTabId(index)}
              className="space-y-3"
            >
              {personBody(person, index)}
            </section>
          ) : null
        )}
        <TotalBar selection={selection} format={shared.format} classNames={classNames} />
      </section>
    );
  }

  return (
    <section aria-labelledby={HEADING_ID} className={slotClass(classNames, 'root', 'space-y-6')}>
      <Heading shared={shared} />
      {party.people.map((person, index) => {
        const headingId = `booking-service-for-${index}`;
        return (
          <section key={person.key} aria-labelledby={headingId} className="space-y-3">
            <h3
              id={headingId}
              className={slotClass(classNames, 'groupHeading', 'font-sans text-lg font-bold')}
            >
              {person.label}
            </h3>
            {personBody(person, index)}
          </section>
        );
      })}
    </section>
  );
}

/**
 * Nothing can be booked for this person.
 *
 * On the one-tap step that is IN A PARTY THIS SIZE — the engine's rule: one
 * request holds at most as many people as the STRICTEST `maxPerBooking` among
 * its services allows, so a one-per-booking adult service cannot ride along
 * with the children's. On the multi-select step the size narrows nothing, so
 * the reason is plainer: nothing on their menu is taken online. Either way the
 * step says so in one line (the caller keeps «next» shut) and offers the one
 * way on: take them out, and book them as their own time.
 */
function NothingInThisParty({
  person,
  labels,
  multiLabels,
  onRemove,
}: {
  person: ServicePartyPerson;
  labels: ServiceScreenLabels;
  /** The multi-select step's labels; `null` on the one-tap step. */
  multiLabels: ServiceMultiLabels | null;
  onRemove: (() => void) | undefined;
}) {
  const values = { label: person.label };
  let reason: BookingLabel;
  if (multiLabels) reason = multiLabels['service.party.nothingBookable'];
  else if (person.adult) reason = labels['service.party.adultAlone'];
  else reason = labels['service.party.nothingFits'];
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border px-5 py-4 text-sm">
      <p>{renderLabel(reason, values)}</p>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="font-semibold text-primary underline underline-offset-4"
        >
          {renderLabel(labels['service.party.remove'], values)}
        </button>
      )}
    </div>
  );
}

/**
 * One person with a «same as last time»: the suggestion as the answer, and the
 * rest of the menu one tap away behind «choose something else». The menu opens
 * by itself when the answer is something else already, so a choice is never
 * hidden.
 */
function PersonWithSuggestion({
  listLabel,
  suggestion,
  menu,
  ticked,
  chosen,
  onPick,
  choiceCard,
  unlikely,
  hasUnlikely,
  shared,
}: {
  listLabel: string;
  suggestion: ServiceSuggestion;
  menu: BookingServiceDto[];
  /** Multi-select: what the person has ticked; `null` on the one-tap step. */
  ticked: Set<string> | null;
  chosen: string | null;
  onPick: (service: BookingServiceDto) => void;
  choiceCard: (service: BookingServiceDto) => ReactNode;
  /** The age divider and what is below it, shown with the rest of the menu. */
  unlikely: ReactNode;
  hasUnlikely: boolean;
  shared: Shared;
}) {
  const id = suggestion.service.id;
  const [open, setOpen] = useState(
    ticked
      ? [...ticked].some((other) => other !== id)
      : chosen !== null && chosen !== suggestion.service.id
  );
  // Multi-select: the suggestion is in the menu too, so it can be unticked
  // there, and something added to it.
  const others = ticked ? menu : menu.filter((service) => service.id !== id);
  return (
    <div className="space-y-2">
      <SameAsLast
        suggestion={suggestion}
        selected={ticked ? ticked.has(id) : chosen === id}
        onPick={() => onPick(suggestion.service)}
        shared={shared}
      />
      {(others.length > 0 || hasUnlikely) && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="text-sm font-semibold text-primary underline underline-offset-4"
        >
          {shared.labels['service.chooseOther']}
        </button>
      )}
      {open && others.length > 0 && (
        <ul aria-label={listLabel} className="space-y-2">
          {others.map((service) => (
            <li key={service.id}>{choiceCard(service)}</li>
          ))}
        </ul>
      )}
      {open && unlikely}
    </div>
  );
}

/** «Same as last time · Kids' cut» — the person's last service, as one tap. */
function SameAsLast({
  suggestion,
  selected,
  onPick,
  shared,
}: {
  suggestion: ServiceSuggestion;
  selected: boolean;
  onPick: () => void;
  shared: Shared;
}) {
  const { service, note } = suggestion;
  const { labels, format, classNames } = shared;
  return (
    <div className="space-y-1">
      <button
        type="button"
        aria-pressed={selected}
        onClick={onPick}
        className={cn(
          'flex min-h-14 w-full items-baseline justify-between gap-4 rounded-lg border px-5 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          selected
            ? 'border-primary bg-primary/5 ring-2 ring-primary'
            : 'border-primary/60 bg-card hover:border-primary',
          classNames?.card,
          selected && classNames?.cardSelected
        )}
      >
        <span>
          <span className="block text-xs font-bold tracking-wide text-primary uppercase">
            {labels['service.sameAsLast']}
          </span>
          <span className="font-medium">{service.name}</span>
        </span>
        <span className="flex items-baseline gap-4 text-right">
          <span className="text-sm text-muted-foreground tabular-nums">
            {renderLabel(labels['service.duration'], { minutes: service.durationMinutes })}
          </span>
          <span
            className={slotClass(
              classNames,
              'price',
              'whitespace-nowrap font-semibold text-foreground tabular-nums'
            )}
          >
            {format.price(service.priceOre)}
          </span>
        </span>
      </button>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}

/**
 * The default service card.
 *
 * - `book`: the whole card is the target — on a phone, anything smaller is a
 *   missed tap.
 * - `choice`: pressed rather than advancing.
 * - `phone`: not a button, deliberately. The business does not take this one
 *   online, and a tap target that accepts the tap and does nothing is the dead
 *   end the phone number replaces. The card stays so the catalogue is whole.
 */
export function DefaultServiceCard({
  service,
  kind,
  selected,
  multiple = false,
  onPick,
  phone,
  format,
  labels,
  className,
  selectedClassName,
  priceClassName,
}: ServiceCardProps) {
  const duration = renderLabel(labels['service.duration'], { minutes: service.durationMinutes });
  const price = (
    <span
      className={cn('whitespace-nowrap font-semibold text-foreground tabular-nums', priceClassName)}
    >
      {format.price(service.priceOre)}
    </span>
  );

  if (kind === 'phone') {
    return (
      <div
        className={cn(
          'flex min-h-14 w-full items-baseline justify-between gap-4 rounded-lg border border-dashed border-border px-5 py-4',
          className
        )}
      >
        <span className="font-medium">{service.name}</span>
        <span className="flex items-baseline gap-4 text-right">
          <span className="text-sm text-muted-foreground tabular-nums">{duration}</span>
          <span className="text-sm">
            {labels['service.phoneOnly']}
            {phone ? (
              <>
                {' – '}
                {/* The visible text is the number; the label says what dialling
                    it is for, so the link still makes sense read on its own. */}
                <a
                  href={format.telHref(phone)}
                  aria-label={fillLabel(labels['service.phoneOnlyLinkLabel'], { phone })}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  {phone}
                </a>
              </>
            ) : null}
          </span>
        </span>
      </div>
    );
  }

  if (kind === 'choice' && multiple) {
    return (
      <MultiServiceCard
        name={service.name}
        selected={selected}
        onPick={onPick}
        duration={duration}
        price={price}
        className={className}
        selectedClassName={selectedClassName}
      />
    );
  }

  if (kind === 'choice') {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onPick}
        className={cn(
          'flex min-h-12 w-full items-baseline justify-between gap-4 rounded-lg border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          selected
            ? 'border-primary bg-primary/5 font-semibold ring-2 ring-primary'
            : 'border-border bg-card hover:border-primary',
          className,
          selected && selectedClassName
        )}
      >
        <span className="font-medium">{service.name}</span>
        <span className="flex items-baseline gap-3 text-right">
          <span className="text-muted-foreground tabular-nums">{duration}</span>
          {price}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onPick}
      className={cn(
        'flex min-h-14 w-full items-baseline justify-between gap-4 rounded-lg border border-border bg-card px-5 py-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className
      )}
    >
      <span className="font-medium">{service.name}</span>
      <span className="flex items-baseline gap-4 text-right">
        <span className="text-sm text-muted-foreground tabular-nums">{duration}</span>
        {price}
      </span>
    </button>
  );
}
