import { describe, expect, it } from 'vitest';
import { visitMinutes, visitName, visitServices } from '../../../src/booking/internal/visit.js';
import type { WizardService } from '../../../src/booking/types.js';

const CUT: WizardService = {
  id: 'svc-cut',
  name: 'Klipp',
  category: 'adults',
  durationMinutes: 30,
  bufferBeforeMinutes: 5,
  bufferAfterMinutes: 10,
  priceOre: 50_000,
  maxPerBooking: 2,
  weekendSurchargePct: 0,
};
const WASH: WizardService = { ...CUT, id: 'svc-wash', name: 'Vask', durationMinutes: 15 };

describe('visit helpers', () => {
  it('reads a one-service visit as that service', () => {
    expect(visitServices({ service: CUT })).toEqual([CUT]);
    expect(visitName({ service: CUT })).toBe('Klipp');
    expect(visitMinutes({ service: CUT })).toBe(30);
  });

  it('joins the names and sums the durations of a multi-service visit, buffers excluded', () => {
    const item = { service: CUT, extraServices: [WASH] };
    expect(visitServices(item)).toEqual([CUT, WASH]);
    expect(visitName(item)).toBe('Klipp + Vask');
    expect(visitMinutes(item)).toBe(45);
  });
});
