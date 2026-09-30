import { describe, expect, it } from 'vitest';
import { bookingLabelsEn, bookingLabelsNb } from '../../../src/booking/__stories__/labels.js';
import * as booking from '../../../src/booking/index.js';

const SCREENS = [
  'WhoScreen',
  'AddChildSheet',
  'ServiceScreen',
  'StylistScreen',
  'TimeScreen',
  'DetailsScreen',
  'SummaryBar',
  'Confirmation',
  'BookingSkeleton',
  'LiveStatus',
  'ManageScreen',
  'LoginPanel',
  'LoginSheet',
  'OtpSlots',
  'VippsButton',
  'PortalShell',
  'AccountCard',
  'PortalUnreachable',
  'UpcomingBookings',
  'VisitHistory',
  'RebookCards',
  'ChildCards',
  'FamilyEditor',
  'AgeConfirmCard',
  'ProfileForm',
  'DataControls',
  'LogoutButton',
  'VippsLinkRow',
] as const;

const DEFAULT_RENDERERS = [
  'DefaultPersonCard',
  'DefaultServiceCard',
  'DefaultStylistCard',
  'DefaultTimeChip',
  'DefaultDayChip',
] as const;

describe('@medalsocial/meda/booking entry', () => {
  it('exports every screen and the default card renderers', () => {
    const entry = booking as unknown as Record<string, unknown>;
    for (const name of [...SCREENS, ...DEFAULT_RENDERERS]) {
      expect(entry[name], name).toBeTypeOf('function');
    }
  });

  it('BOOKING_LABEL_KEYS is unique and every key is <screen>.<thing>', () => {
    const keys = booking.BOOKING_LABEL_KEYS;
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(key).toMatch(/^[a-z][a-zA-Z]*(\.[a-zA-Z0-9]+)+$/);
  });

  it('the demo packs define every key with a non-empty string, and nothing else', () => {
    for (const pack of [bookingLabelsNb, bookingLabelsEn]) {
      expect(Object.keys(pack).sort()).toEqual([...booking.BOOKING_LABEL_KEYS].sort());
      for (const key of booking.BOOKING_LABEL_KEYS) {
        expect(typeof pack[key], key).toBe('string');
      }
    }
  });

  it('placeholders in the demo packs are well-formed', () => {
    for (const pack of [bookingLabelsNb, bookingLabelsEn]) {
      for (const key of booking.BOOKING_LABEL_KEYS) {
        const text = pack[key].replace(/\{\w+\}/g, '');
        expect(text, key).not.toMatch(/[{}]/);
      }
    }
  });

  it('fillLabel fills known placeholders and leaves unknown ones', () => {
    expect(booking.fillLabel('{n} of {max} · {x}', { n: 2, max: 3 })).toBe('2 of 3 · {x}');
  });
});
