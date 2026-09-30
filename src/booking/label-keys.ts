import { ADD_CHILD_SHEET_LABEL_KEYS } from './add-child-sheet.js';
import { BOOKING_SKELETON_LABEL_KEYS } from './booking-skeleton.js';
import { CONFIRMATION_LABEL_KEYS } from './confirmation.js';
import { DETAILS_SCREEN_LABEL_KEYS } from './details-screen.js';
import { LOGIN_SHEET_LABEL_KEYS } from './login-sheet.js';
import { MANAGE_SCREEN_LABEL_KEYS } from './manage-screen.js';
import { CHILD_CARDS_LABEL_KEYS } from './portal/child-cards.js';
import { DATA_CONTROLS_LABEL_KEYS } from './portal/data-controls.js';
import { FAMILY_EDITOR_LABEL_KEYS } from './portal/family-editor.js';
import { LOGOUT_BUTTON_LABEL_KEYS } from './portal/logout-button.js';
import { PORTAL_SHELL_LABEL_KEYS } from './portal/portal-shell.js';
import { PORTAL_UNREACHABLE_LABEL_KEYS } from './portal/portal-unreachable.js';
import { PROFILE_FORM_LABEL_KEYS } from './portal/profile-form.js';
import { REBOOK_CARDS_LABEL_KEYS } from './portal/rebook-cards.js';
import { UPCOMING_BOOKINGS_LABEL_KEYS } from './portal/upcoming-bookings.js';
import { VIPPS_LINK_ROW_LABEL_KEYS } from './portal/vipps-link-row.js';
import { VISIT_HISTORY_LABEL_KEYS } from './portal/visit-history.js';
import { SERVICE_SCREEN_LABEL_KEYS } from './service-screen.js';
import { STYLIST_SCREEN_LABEL_KEYS } from './stylist-screen.js';
import { SUMMARY_BAR_LABEL_KEYS } from './summary-bar.js';
import { TIME_SCREEN_LABEL_KEYS } from './time-screen.js';
import { WHO_SCREEN_LABEL_KEYS } from './who-screen.js';

/**
 * Every label key any booking screen reads, once. A complete pack for a
 * locale is a `BookingLabels`; each screen's `labels` prop is a subset of it,
 * so the same merged pack can be handed to every screen.
 *
 * (Screens that embed another screen already include its keys, e.g. the
 * login sheet carries the login panel's, OTP slots' and Vipps button's.)
 */
export const BOOKING_LABEL_KEYS = [
  ...new Set([
    ...WHO_SCREEN_LABEL_KEYS,
    ...ADD_CHILD_SHEET_LABEL_KEYS,
    ...SERVICE_SCREEN_LABEL_KEYS,
    ...STYLIST_SCREEN_LABEL_KEYS,
    ...TIME_SCREEN_LABEL_KEYS,
    ...MANAGE_SCREEN_LABEL_KEYS,
    ...DETAILS_SCREEN_LABEL_KEYS,
    ...SUMMARY_BAR_LABEL_KEYS,
    ...CONFIRMATION_LABEL_KEYS,
    ...BOOKING_SKELETON_LABEL_KEYS,
    ...LOGIN_SHEET_LABEL_KEYS,
    ...PORTAL_SHELL_LABEL_KEYS,
    ...PORTAL_UNREACHABLE_LABEL_KEYS,
    ...UPCOMING_BOOKINGS_LABEL_KEYS,
    ...VISIT_HISTORY_LABEL_KEYS,
    ...REBOOK_CARDS_LABEL_KEYS,
    ...CHILD_CARDS_LABEL_KEYS,
    ...FAMILY_EDITOR_LABEL_KEYS,
    ...PROFILE_FORM_LABEL_KEYS,
    ...DATA_CONTROLS_LABEL_KEYS,
    ...LOGOUT_BUTTON_LABEL_KEYS,
    ...VIPPS_LINK_ROW_LABEL_KEYS,
  ]),
] as const;

export type BookingLabelKey =
  | (typeof WHO_SCREEN_LABEL_KEYS)[number]
  | (typeof ADD_CHILD_SHEET_LABEL_KEYS)[number]
  | (typeof SERVICE_SCREEN_LABEL_KEYS)[number]
  | (typeof STYLIST_SCREEN_LABEL_KEYS)[number]
  | (typeof TIME_SCREEN_LABEL_KEYS)[number]
  | (typeof MANAGE_SCREEN_LABEL_KEYS)[number]
  | (typeof DETAILS_SCREEN_LABEL_KEYS)[number]
  | (typeof SUMMARY_BAR_LABEL_KEYS)[number]
  | (typeof CONFIRMATION_LABEL_KEYS)[number]
  | (typeof BOOKING_SKELETON_LABEL_KEYS)[number]
  | (typeof LOGIN_SHEET_LABEL_KEYS)[number]
  | (typeof PORTAL_SHELL_LABEL_KEYS)[number]
  | (typeof PORTAL_UNREACHABLE_LABEL_KEYS)[number]
  | (typeof UPCOMING_BOOKINGS_LABEL_KEYS)[number]
  | (typeof VISIT_HISTORY_LABEL_KEYS)[number]
  | (typeof REBOOK_CARDS_LABEL_KEYS)[number]
  | (typeof CHILD_CARDS_LABEL_KEYS)[number]
  | (typeof FAMILY_EDITOR_LABEL_KEYS)[number]
  | (typeof PROFILE_FORM_LABEL_KEYS)[number]
  | (typeof DATA_CONTROLS_LABEL_KEYS)[number]
  | (typeof LOGOUT_BUTTON_LABEL_KEYS)[number]
  | (typeof VIPPS_LINK_ROW_LABEL_KEYS)[number];

/** A complete label pack for one locale. */
export type BookingLabels = Record<BookingLabelKey, string>;
