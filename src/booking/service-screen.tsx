'use client';

import { type ComponentType, type ReactNode, useState } from 'react';
import { cn } from '../lib/utils.js';
import type { BookingFormat } from './format.js';
import { renderLabel } from './internal/label-parts.js';
import { BookingButton } from './internal/ui.js';
import { fillLabel } from './labels.js';
import { type SlotClassNames, slotClass } from './slots.js';
import type { BookingServiceDto } from './types.js';

/**
 * The service step — what should be done?
 *
 * Presentational. A tap raises `onPick` and the caller's machine decides what
 * that means; nothing here knows which step comes next or whether the basket
 * already holds a child.
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

export type ServiceScreenLabels = Record<(typeof SERVICE_SCREEN_LABEL_KEYS)[number], string>;

/**
 * - `root` — the `<section>`
 * - `heading` — the `<h2>`
 * - `pill` / `pillSelected` — a category pill / the marked one
 * - `groupHeading` — a category's (or a party member's) `<h3>`
 * - `card` / `cardSelected` — a service card / a pressed one (passed to `ServiceCard`)
 * - `price` — a card's price (passed to `ServiceCard`, and the «same as last time» card's)
 */
export type ServiceScreenSlot =
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
}

const HEADING_ID = 'booking-service-heading';

function groupHeadingId(category: string): string {
  return `booking-services-${category}`;
}

const allFit = () => true;
const asIs = (name: string) => name;

/** The age divider's sentence for `name`. */
function ageDividerLabel(
  labels: ServiceScreenLabels,
  name: string | null | undefined,
  possessive: (name: string) => string
): string {
  if (!name) return labels['service.ageDivider.unnamed'];
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

function Heading({ shared }: { shared: Shared }) {
  return (
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
  shared,
}: ServiceScreenProps & { shared: Shared }) {
  const { Card, labels, classNames } = shared;
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
      <Heading shared={shared} />

      {suggestion && (
        <div className="space-y-2">
          <SameAsLast
            suggestion={suggestion}
            selected={chosenId === suggestion.service.id}
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
          <ul className="space-y-2">
            {items.map((service) => (
              <li key={service.id}>
                <Card
                  service={service}
                  kind={service.bookableOnline ? 'book' : 'phone'}
                  selected={false}
                  onPick={() => onPick(service)}
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
          <Card
            service={service}
            kind="book"
            selected={false}
            onPick={() => onPick(service)}
            phone={phone}
            {...cardProps(shared)}
          />
        )}
      </UnlikelyForAge>
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
 * a `childCategory`, a child gets that menu and an adult everything else,
 * which is often nothing, and is told so.
 */
function PartyServiceScreen({
  services,
  categories,
  categoryOf,
  childCategory,
  serviceFits = allFit,
  party,
  shared,
}: ServiceScreenProps & { party: NonNullable<ServiceScreenProps['party']>; shared: Shared }) {
  const { Card, labels, classNames } = shared;
  const fileUnder = categoryOf ?? defaultCategoryOf(categories);
  const size = party.people.length;
  const fits = services.filter(
    (service) => service.bookableOnline && service.maxPerBooking >= size
  );
  return (
    <section aria-labelledby={HEADING_ID} className={slotClass(classNames, 'root', 'space-y-6')}>
      <Heading shared={shared} />
      {party.people.map((person, index) => {
        const headingId = `booking-service-for-${index}`;
        const { fitting: menu, unlikely } = byFit(
          // A grown-up gets the grown-ups' menu and a child the children's —
          // a kids' cut for «myself» is not an answer, it is a way round the
          // note below that books the wrong thing.
          childCategory === undefined
            ? fits
            : fits.filter((service) => (fileUnder(service) === childCategory) === !person.adult),
          (service) => serviceFits(service, index)
        );
        const chosen = party.choices[index]?.id ?? null;
        const suggestion = person.suggestion ?? null;
        const pick = (service: BookingServiceDto) => party.onPickFor(index, service);
        const choiceCard = (service: BookingServiceDto) => (
          <Card
            service={service}
            kind="choice"
            selected={service.id === chosen}
            onPick={() => pick(service)}
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
        let body: ReactNode;
        if (suggestion && menu.some((service) => service.id === suggestion.service.id)) {
          body = (
            <PersonWithSuggestion
              listLabel={listLabel}
              suggestion={suggestion}
              menu={menu}
              chosen={chosen}
              onPick={pick}
              choiceCard={choiceCard}
              unlikely={unlikelyList}
              hasUnlikely={unlikely.length > 0}
              shared={shared}
            />
          );
        } else if (menu.length === 0 && unlikely.length === 0) {
          body = (
            <NothingInThisParty
              person={person}
              labels={labels}
              onRemove={party.onRemove ? () => party.onRemove?.(index) : undefined}
            />
          );
        } else {
          body = (
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
        return (
          <section key={person.key} aria-labelledby={headingId} className="space-y-3">
            <h3
              id={headingId}
              className={slotClass(classNames, 'groupHeading', 'font-sans text-lg font-bold')}
            >
              {person.label}
            </h3>
            {body}
          </section>
        );
      })}
    </section>
  );
}

/**
 * Nothing can be booked for this person IN A PARTY THIS SIZE.
 *
 * The engine's rule: one request holds at most as many people as the
 * STRICTEST `maxPerBooking` among its services allows, so a one-per-booking
 * adult service cannot ride along with the children's. The step says so in
 * one line (the caller keeps «next» shut) and offers the one way on: take them
 * out, and book them as their own time.
 */
function NothingInThisParty({
  person,
  labels,
  onRemove,
}: {
  person: ServicePartyPerson;
  labels: ServiceScreenLabels;
  onRemove: (() => void) | undefined;
}) {
  const values = { label: person.label };
  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border px-5 py-4 text-sm">
      <p>
        {renderLabel(
          labels[person.adult ? 'service.party.adultAlone' : 'service.party.nothingFits'],
          values
        )}
      </p>
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
  chosen: string | null;
  onPick: (service: BookingServiceDto) => void;
  choiceCard: (service: BookingServiceDto) => ReactNode;
  /** The age divider and what is below it, shown with the rest of the menu. */
  unlikely: ReactNode;
  hasUnlikely: boolean;
  shared: Shared;
}) {
  const [open, setOpen] = useState(chosen !== null && chosen !== suggestion.service.id);
  const others = menu.filter((service) => service.id !== suggestion.service.id);
  return (
    <div className="space-y-2">
      <SameAsLast
        suggestion={suggestion}
        selected={chosen === suggestion.service.id}
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
