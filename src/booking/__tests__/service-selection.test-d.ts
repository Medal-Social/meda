/**
 * Type tests for `ServiceSelection.labels`, checked by `pnpm typecheck` (this
 * folder is in `tsconfig.json` and left out of the build). Each
 * `@ts-expect-error` is a compile that must FAIL: if one starts compiling, tsc
 * reports the unused directive and the check goes red.
 */
import type { BookingLabels } from '../label-keys.js';
import type {
  ServiceMultiLabels,
  ServiceScreenLabels,
  ServiceSelection,
} from '../service-screen.js';

type Expect<T extends true> = T;
type Assignable<From, To> = [From] extends [To] ? true : false;

/** A complete multi-select pack is what `selection.labels` takes. */
export type CompletePackFits = Expect<Assignable<ServiceMultiLabels, ServiceSelection['labels']>>;

type WithoutLabels = Omit<ServiceSelection, 'labels'>;
type MissingOne = Omit<ServiceMultiLabels, 'service.party.nothingBookable'>;

// A selection without its labels does not compile: no unnamed «Next».
// @ts-expect-error — `labels` is required on a selection
export type SelectionNeedsLabels = Expect<Assignable<WithoutLabels, ServiceSelection>>;

// A screen pack written before multi-select (the keys optional) cannot stand in.
// @ts-expect-error — the multi-select keys may be absent from a `ServiceScreenLabels`
export type OlderScreenPackRefused = Expect<Assignable<ServiceScreenLabels, ServiceMultiLabels>>;

// @ts-expect-error — nor from a `BookingLabels` pack, where they are optional too
export type OlderBookingPackRefused = Expect<Assignable<BookingLabels, ServiceMultiLabels>>;

// Every key is required: dropping one does not compile.
// @ts-expect-error — `service.party.nothingBookable` is required
export type EveryKeyRequired = Expect<Assignable<MissingOne, ServiceMultiLabels>>;
