/**
 * The complete demo label packs (nb, en): every screen's story pack merged.
 * Neutral wording for the invented «Salong Demo»; not shipped.
 */
import type { BookingLabels } from '../label-keys.js';
import {
  confirmationLabelsEn,
  confirmationLabelsNb,
  detailsScreenLabelsEn,
  detailsScreenLabelsNb,
  summaryBarLabelsEn,
  summaryBarLabelsNb,
} from './labels.details.js';
import { portalLabelsEn, portalLabelsNb } from './labels.portal.js';
import {
  dataControlsLabelsEn,
  dataControlsLabelsNb,
  familyEditorLabelsEn,
  familyEditorLabelsNb,
  logoutLabelsEn,
  logoutLabelsNb,
  profileFormLabelsEn,
  profileFormLabelsNb,
  vippsLinkLabelsEn,
  vippsLinkLabelsNb,
} from './labels.portal-forms.js';
import {
  serviceScreenLabelsEn,
  serviceScreenLabelsNb,
  stylistScreenLabelsEn,
  stylistScreenLabelsNb,
  whoScreenLabelsEn,
  whoScreenLabelsNb,
} from './labels.steps.js';
import {
  bookingSkeletonLabelsEn,
  bookingSkeletonLabelsNb,
  manageLabelsEn,
  manageLabelsNb,
} from './labels.time.js';

export const bookingLabelsNb: BookingLabels = {
  ...whoScreenLabelsNb,
  ...serviceScreenLabelsNb,
  ...stylistScreenLabelsNb,
  ...manageLabelsNb,
  ...bookingSkeletonLabelsNb,
  ...detailsScreenLabelsNb,
  ...summaryBarLabelsNb,
  ...confirmationLabelsNb,
  ...portalLabelsNb,
  ...familyEditorLabelsNb,
  ...profileFormLabelsNb,
  ...dataControlsLabelsNb,
  ...logoutLabelsNb,
  ...vippsLinkLabelsNb,
};

export const bookingLabelsEn: BookingLabels = {
  ...whoScreenLabelsEn,
  ...serviceScreenLabelsEn,
  ...stylistScreenLabelsEn,
  ...manageLabelsEn,
  ...bookingSkeletonLabelsEn,
  ...detailsScreenLabelsEn,
  ...summaryBarLabelsEn,
  ...confirmationLabelsEn,
  ...portalLabelsEn,
  ...familyEditorLabelsEn,
  ...profileFormLabelsEn,
  ...dataControlsLabelsEn,
  ...logoutLabelsEn,
  ...vippsLinkLabelsEn,
};
