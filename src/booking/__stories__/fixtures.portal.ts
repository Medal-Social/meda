/**
 * Portal fixtures for «Salong Demo»: an invented guardian, their children,
 * bookings ahead and behind, and rebook suggestions. Relative to `DEMO_NOW`
 * (Monday 14 September 2026, 08:00 Oslo). Stories and tests only.
 */
import type {
  ChildSummary,
  PortalBookingDto,
  PortalProfileDto,
  RebookSuggestion,
} from '../types.js';
import { DEMO_NOW } from './fixtures.js';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const demoProfile: PortalProfileDto = {
  email: 'demo.forelder@example.com',
  firstName: 'Demo',
  lastName: 'Forelder',
  phone: '400 00 000',
  family: [],
  personDetails: true,
  marketingConsent: false,
};

export function demoPortalBooking(overrides: Partial<PortalBookingDto> = {}): PortalBookingDto {
  // Wednesday 16 September 2026, 16:30 Oslo.
  const startTs = DEMO_NOW + 2 * DAY + 8.5 * HOUR;
  return {
    bookingId: 'bk-1',
    status: 'confirmed',
    startTs,
    endTs: startTs + 30 * 60_000,
    serviceId: 'svc-kids',
    serviceName: 'Barneklipp',
    resourceId: 'res-ada',
    resourceName: 'Ada',
    bookedForName: 'Mia',
    bookedForPersonId: 'p-mia',
    bookedForBirthYear: 2018,
    bookedForBirthMonth: null,
    amountOre: 39_000,
    notes: null,
    managePath: '/manage/demo-token',
    ...overrides,
  };
}

export const demoUpcoming: PortalBookingDto[] = [
  demoPortalBooking(),
  demoPortalBooking({
    bookingId: 'bk-2',
    startTs: DEMO_NOW + 16 * DAY + 2 * HOUR,
    endTs: DEMO_NOW + 16 * DAY + 3 * HOUR,
    serviceId: 'svc-cut',
    serviceName: 'Klipp',
    resourceId: null,
    resourceName: null,
    bookedForName: null,
    amountOre: 69_000,
    managePath: null,
  }),
];

/** Completed visits in 2026 and 2025, plus one cancelled. */
export const demoPast: PortalBookingDto[] = [
  demoPortalBooking({
    bookingId: 'past-1',
    status: 'completed',
    startTs: Date.UTC(2026, 5, 3, 8),
    endTs: Date.UTC(2026, 5, 3, 8, 30),
  }),
  demoPortalBooking({
    bookingId: 'past-2',
    status: 'completed',
    startTs: Date.UTC(2026, 4, 12, 13),
    endTs: Date.UTC(2026, 4, 12, 13, 45),
    serviceName: 'Barneklipp med vask',
    bookedForName: 'Leo',
    resourceName: 'Bo',
    amountOre: 49_000,
  }),
  demoPortalBooking({
    bookingId: 'past-3',
    status: 'cancelled',
    startTs: Date.UTC(2026, 3, 2, 9),
    endTs: Date.UTC(2026, 3, 2, 9, 30),
  }),
  demoPortalBooking({
    bookingId: 'past-4',
    status: 'completed',
    startTs: Date.UTC(2025, 10, 20, 14),
    endTs: Date.UTC(2025, 10, 20, 14, 30),
  }),
];

export const demoRebook: RebookSuggestion[] = [
  {
    serviceId: 'svc-kids',
    serviceName: 'Barneklipp',
    resourceId: 'res-ada',
    resourceName: 'Ada',
    bookedForName: 'Mia',
  },
  {
    serviceId: 'svc-cut',
    serviceName: 'Klipp',
    resourceId: null,
    resourceName: null,
    bookedForName: null,
  },
];

/** A demo href builder: catalogue ids only, never the person's name. */
export function demoRebookHref(ids: {
  serviceId?: string | null;
  resourceId?: string | null;
}): string {
  if (!ids.serviceId) return '/book';
  const params = [`service=${encodeURIComponent(ids.serviceId)}`];
  if (ids.resourceId) params.push(`stylist=${encodeURIComponent(ids.resourceId)}`);
  return `/book?${params.join('&')}`;
}

export const demoKids: ChildSummary[] = [
  {
    personId: 'p-mia',
    name: 'Mia',
    birthYear: 2018,
    birthMonth: 3,
    ageRange: { min: 8, max: 8 },
    age: 8,
    lastVisitTs: Date.UTC(2026, 5, 3, 8),
    serviceId: 'svc-kids',
    serviceName: 'Barneklipp',
    resourceId: 'res-bo',
    preferredResourceId: 'res-ada',
    nextVisitTs: DEMO_NOW + 2 * DAY + 8.5 * HOUR,
  },
  {
    personId: 'p-leo',
    name: 'Leo',
    birthYear: 2021,
    birthMonth: null,
    ageRange: { min: 4, max: 5 },
    age: 5,
    lastVisitTs: null,
    serviceId: null,
    serviceName: null,
    resourceId: null,
    preferredResourceId: null,
    nextVisitTs: null,
  },
];

export const demoStylistNames: Readonly<Record<string, string>> = {
  'res-ada': 'Ada',
  'res-bo': 'Bo',
};
