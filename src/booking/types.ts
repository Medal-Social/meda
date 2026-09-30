/**
 * Structural data shapes the booking screens take as props.
 *
 * These are local copies, on purpose: `@medalsocial/meda/booking` renders a
 * booking flow but never fetches one, so it must not depend on the booking
 * package or the Medal SDK. Whatever produces the data (the booking package,
 * a test, a story) only has to be assignable to these shapes.
 *
 * Conventions every shape follows:
 * - instants are epoch milliseconds (`…Ts`), never ISO strings;
 * - money is integer minor units (`…Ore`: øre / cents);
 * - optional fields are ABSENT rather than `undefined`-or-blank, except where a
 *   `null` is itself an answer (documented on the field).
 */

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

/** One bookable service as the wizard carries it. */
export interface WizardService {
  id: string;
  name: string;
  /** The service group key (see `ServiceScreen`'s `categories`). */
  category: string;
  durationMinutes: number;
  priceOre: number;
  /** How many of this service one booking may hold. */
  maxPerBooking: number;
  /** 0 when there is no weekend surcharge. */
  weekendSurchargePct: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  /** Inclusive age bounds, when the service is age-restricted. */
  ageMinYears?: number;
  ageMaxYears?: number;
}

/** A service as the service step lists it: online-bookable or «call us». */
export interface BookingServiceDto extends WizardService {
  bookableOnline: boolean;
}

/** One stylist (bookable resource). */
export interface BookingResourceDto {
  id: string;
  name: string;
  photoUrl: string | null;
  bio: string | null;
  /** The services this resource can perform. */
  serviceIds: string[];
  sortOrder: number;
}

/** One free slot. `resourceId: null` = «first available», not yet resolved. */
export interface BookingSlotDto {
  startTs: number;
  resourceId: string | null;
}

/**
 * One date the business keeps opening hours on. A date missing from the list
 * is one it keeps no hours on. `lastStartTs` is the last start THIS visit could
 * take (not the closing time); `null` = open-hours posted but shut (holiday).
 */
export interface BookingDayDto {
  dayKey: string;
  opensTs: number;
  closesTs: number;
  lastStartTs: number | null;
}

// ---------------------------------------------------------------------------
// Wizard state (the machine lives outside meda; these are its public shapes)
// ---------------------------------------------------------------------------

export type WizardStep = 'who' | 'service' | 'when' | 'details';

/** One seat in the booking: a child (named or not) or an adult. */
export interface WizardPerson {
  key: string;
  adult?: boolean;
  personId?: string;
  name?: string;
  birthYear?: number;
  birthMonth?: number;
}

/** One line of the basket. */
export interface WizardItem {
  service: WizardService;
  bookedForName?: string;
  bookedForBirthYear?: number;
  bookedForPersonId?: string;
  bookedForBirthMonth?: number;
  adult?: boolean;
}

export type WizardError =
  | 'maxParty'
  | 'slotTaken'
  | 'conflict'
  | 'invalidInput'
  | 'unconfigured'
  | 'upstreamError'
  | 'inProgress';

export type PartyMode = 'sequential' | 'parallel';

export interface WizardState {
  step: WizardStep;
  people: WizardPerson[];
  choices: Array<WizardService | null>;
  items: WizardItem[];
  resourceId: string | null;
  stylistAnswered: boolean;
  partyMode: PartyMode;
  startTs: number | null;
  resolvedResourceId: string | null;
  partyResourceIds: string[] | null;
  contact: { phone: string; name: string; email: string };
  notes: string;
  consentTerms: boolean;
  consentMarketing: boolean;
  pendingService: WizardService | null;
  error: WizardError | null;
}

/**
 * The subset of the machine's actions the screens raise. A screen never
 * reduces them — it hands them to its `onChange` / callback and the caller's
 * machine decides what they mean.
 */
export type WizardAction =
  | { type: 'setPartyMode'; mode: PartyMode }
  | { type: 'goToStep'; step: WizardStep }
  | { type: 'setContact'; field: keyof WizardState['contact']; value: string }
  | { type: 'setItemField'; index: number; field: 'bookedForName'; value: string }
  | { type: 'setItemField'; index: number; field: 'bookedForBirthYear'; value: number | null }
  | { type: 'setItemField'; index: number; field: 'bookedForPersonId'; value: string | null }
  | { type: 'setNotes'; value: string }
  | { type: 'setConsent'; which: 'terms' | 'marketing'; accepted: boolean };

/** One stylist seat inside a family (party) slot. */
export interface PartySeat {
  startTs: number;
  resourceId: string;
}

/** A whole family visit at one start. */
export interface PartySlot {
  startTs: number;
  mode: PartyMode;
  seats: PartySeat[];
}

/** An age, exact (`min === max`) or a two-year range when only the year is known. */
export interface AgeRange {
  min: number;
  max: number;
}

/** A child the «add child» sheet collects. Never a full birth date. */
export interface NewChild {
  name: string;
  birthYear: number;
  birthMonth?: number;
  notes?: string;
}

/** What an async save answers a sheet or form with. */
export type SaveResult = { ok: true } | { ok: false; message: string };

// ---------------------------------------------------------------------------
// Guardian (logged-in parent) and family
// ---------------------------------------------------------------------------

export interface BookingLastVisit {
  serviceId: string;
  serviceName: string | null;
  resourceId: string | null;
  startTs: number;
}

export interface BookingFamilyMember {
  name: string;
  birthYear: number;
  personId?: string;
  birthMonth?: number;
  preferredResourceId?: string;
  lastVisit?: BookingLastVisit;
}

export interface BookingGuardian {
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  family: BookingFamilyMember[];
}

// ---------------------------------------------------------------------------
// Manage page
// ---------------------------------------------------------------------------

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

/** One booking as the manage screen shows it. Never carries the manage token. */
export interface BookingManageDto {
  bookingId: string;
  status: BookingStatus;
  rescheduledFromId: string | null;
  startTs: number;
  endTs: number;
  serviceId: string | null;
  serviceName: string;
  resourceId: string | null;
  resourceName: string;
  bookedForName: string | null;
  partySequenceId: string | null;
  amountOre: number;
  cancelWindowHours: number;
  rescheduleWindowHours: number;
  canCancel: boolean;
  canReschedule: boolean;
}

// ---------------------------------------------------------------------------
// Portal («my page»)
// ---------------------------------------------------------------------------

export interface PortalFamilyMemberDto {
  personId: string | null;
  name: string;
  birthYear: number;
  birthMonth: number | null;
  notes: string | null;
  preferredResourceId: string | null;
}

/** What the business calls the people on a profile («barn» / «children»). */
export interface PortalPersonNouns {
  person: string;
  persons: string;
}

export interface PortalProfileDto {
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  family: PortalFamilyMemberDto[];
  /** Whether Medal speaks birth months / notes / preferred stylist. */
  personDetails: boolean;
  marketingConsent: boolean;
  labels?: PortalPersonNouns;
  vippsLinked?: boolean;
}

export interface PortalBookingDto {
  bookingId: string;
  status: BookingStatus;
  startTs: number;
  endTs: number;
  serviceId: string | null;
  serviceName: string | null;
  resourceId: string | null;
  resourceName: string | null;
  bookedForName: string | null;
  bookedForPersonId: string | null;
  bookedForBirthYear: number | null;
  bookedForBirthMonth: number | null;
  amountOre: number | null;
  notes: string | null;
  /** Where the booking is managed, when it can be. */
  managePath: string | null;
}

export interface RebookSuggestion {
  serviceId: string;
  serviceName: string | null;
  resourceId: string | null;
  resourceName: string | null;
  bookedForName: string | null;
}

/** One child's card on the portal, derived from the profile and the bookings. */
export interface ChildSummary {
  personId: string | null;
  name: string;
  birthYear: number;
  birthMonth: number | null;
  ageRange: AgeRange;
  age: number;
  lastVisitTs: number | null;
  serviceId: string | null;
  serviceName: string | null;
  resourceId: string | null;
  preferredResourceId: string | null;
  nextVisitTs: number | null;
}

/** One year of visit history. */
export interface VisitYear {
  year: number;
  bookings: PortalBookingDto[];
}
