// @medalsocial/meda/booking — unbranded, presentational booking screens.
//
// Props in, callbacks out: nothing here fetches, routes, or touches storage.
// Copy arrives through `labels`, dates/prices through `format`, look through
// the shadcn variables the theme bridge maps. Override ladder, cheapest first:
// CSS variables → labels → classNames (per slot) → components (card renderers).
// Styles: import `@medalsocial/meda/booking/styles.css` and
// `@medalsocial/meda/primitives/styles.css` after the bridge.

export * from './add-child-sheet.js';
export * from './booking-skeleton.js';
export * from './confirmation.js';
export * from './details-screen.js';
export type { BookingClock, BookingDaypart, BookingFormat } from './format.js';
export {
  type JoinLabelPartsOptions,
  joinLabelParts,
  labelParts,
  renderLabel,
} from './internal/label-parts.js';
export * from './internal/ui.js';
export * from './label-keys.js';
export { type BookingLabel, fillLabel, fillLabelPieces, labelText } from './labels.js';
export * from './live-status.js';
export * from './login-panel.js';
export * from './login-sheet.js';
export * from './manage-screen.js';
export * from './otp-slots.js';
export * from './portal/account-card.js';
export * from './portal/action-result.js';
export * from './portal/age-confirm-card.js';
export * from './portal/child-cards.js';
export * from './portal/data-controls.js';
export * from './portal/family-editor.js';
export * from './portal/logout-button.js';
export * from './portal/portal-shell.js';
export * from './portal/portal-unreachable.js';
export * from './portal/profile-form.js';
export * from './portal/rebook-cards.js';
export * from './portal/upcoming-bookings.js';
export * from './portal/vipps-link-row.js';
export * from './portal/visit-history.js';
export * from './service-screen.js';
export type { ScreenComponents, SlotClassNames } from './slots.js';
export * from './stylist-screen.js';
export * from './summary-bar.js';
export * from './time-screen.js';
export type * from './types.js';
export * from './vipps-button.js';
export * from './who-screen.js';
