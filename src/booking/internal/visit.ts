import type { WizardService } from '../types.js';

/**
 * One person's visit: their first service and, when they booked more, the
 * ones after it — done back to back, with one stylist.
 */
export interface VisitLike {
  service: WizardService;
  extraServices?: ReadonlyArray<WizardService>;
}

/** Every service in the visit, in the order they are done. */
export function visitServices(item: VisitLike): WizardService[] {
  return [item.service, ...(item.extraServices ?? [])];
}

/** The visit's services by name: «Klipp + Vask». */
export function visitName(item: VisitLike): string {
  return visitServices(item)
    .map((service) => service.name)
    .join(' + ');
}

/** The visit's treatment time: the services' durations summed (buffers excluded). */
export function visitMinutes(item: VisitLike): number {
  return visitServices(item).reduce((sum, service) => sum + service.durationMinutes, 0);
}
