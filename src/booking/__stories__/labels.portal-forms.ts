/**
 * Story + test label packs for the portal forms (family editor + age card,
 * profile form, data controls, log out, Vipps link row), written for the
 * invented «Salong Demo». Not shipped.
 */
import type { AgeConfirmCardLabels } from '../portal/age-confirm-card.js';
import type { DataControlsLabels } from '../portal/data-controls.js';
import type { FamilyEditorLabels } from '../portal/family-editor.js';
import type { LogoutButtonLabels } from '../portal/logout-button.js';
import type { ProfileFormLabels } from '../portal/profile-form.js';
import type { VippsLinkRowLabels } from '../portal/vipps-link-row.js';

const UNREACHABLE_NB = 'Vi nådde ikke bookingsystemet. Prøv igjen straks.';
const UNREACHABLE_EN = 'We could not reach the booking system. Please try again shortly.';

export const ageConfirmLabelsNb: AgeConfirmCardLabels = {
  'ageConfirm.heading': 'Stemmer alderen til {name}?',
  'ageConfirm.lead': 'Legg gjerne inn fødselsmåned, så blir alderen helt riktig.',
  'ageConfirm.legend': 'Alder for {name}',
  'ageConfirm.birthYear': 'Fødselsår',
  'ageConfirm.birthMonth': 'Fødselsmåned (frivillig)',
  'ageConfirm.birthMonthUnknown': 'Vet ikke',
  'ageConfirm.confirm': 'Bekreft',
  'ageConfirm.dismiss': 'Senere',
};

export const ageConfirmLabelsEn: AgeConfirmCardLabels = {
  'ageConfirm.heading': 'Is {name}’s age right?',
  'ageConfirm.lead': 'Add a birth month and we will get the age exactly right.',
  'ageConfirm.legend': 'Age for {name}',
  'ageConfirm.birthYear': 'Year of birth',
  'ageConfirm.birthMonth': 'Month of birth (optional)',
  'ageConfirm.birthMonthUnknown': 'Not sure',
  'ageConfirm.confirm': 'Confirm',
  'ageConfirm.dismiss': 'Later',
};

export const familyEditorLabelsNb: FamilyEditorLabels = {
  ...ageConfirmLabelsNb,
  'familyEditor.heading': 'Familien',
  'familyEditor.lead': 'Med alderen kan vi foreslå riktig behandling og pris for hver enkelt.',
  'familyEditor.empty': 'Ingen er lagt inn ennå.',
  'familyEditor.legend': 'Familiemedlemmer',
  'familyEditor.add': 'Legg til person',
  'familyEditor.name': 'Navn',
  'familyEditor.birthYear': 'Fødselsår',
  'familyEditor.birthYearPlaceholder': 'Velg år',
  'familyEditor.birthMonth': 'Fødselsmåned (frivillig)',
  'familyEditor.birthMonthUnknown': 'Vet ikke',
  'familyEditor.stylist': 'Foretrukket stylist',
  'familyEditor.stylistNone': 'Ingen bestemt',
  'familyEditor.stylistFormer': 'Tidligere stylist',
  'familyEditor.notes': 'Beskjed til stylisten',
  'familyEditor.notesPlaceholder': 'For eksempel: blir urolig av lyden fra maskinen',
  'familyEditor.newRow': 'Ny person',
  'familyEditor.save': 'Lagre',
  'familyEditor.remove': 'Fjern',
  'familyEditor.removeNamed': 'Fjern {name}',
  'familyEditor.removeRow': 'Fjern raden',
  'familyEditor.saved': 'Lagret',
  'familyEditor.savedNoDetails':
    'Lagret. Måned, stylist og beskjed kunne ikke lagres nå – prøv igjen senere.',
  'familyEditor.partial': 'Fyll inn både navn og fødselsår.',
  'familyEditor.removed': 'Fjernet',
  'familyEditor.unreachable': UNREACHABLE_NB,
  'familyEditor.ageConfirmed': 'Takk, alderen til {name} er bekreftet.',
  'familyEditor.ageSaved': 'Takk, alderen til {name} er lagret.',
};

export const familyEditorLabelsEn: FamilyEditorLabels = {
  ...ageConfirmLabelsEn,
  'familyEditor.heading': 'Your family',
  'familyEditor.lead': 'Knowing ages lets us suggest the right treatment and price for everyone.',
  'familyEditor.empty': 'Nobody added yet.',
  'familyEditor.legend': 'Family members',
  'familyEditor.add': 'Add a person',
  'familyEditor.name': 'Name',
  'familyEditor.birthYear': 'Year of birth',
  'familyEditor.birthYearPlaceholder': 'Pick a year',
  'familyEditor.birthMonth': 'Month of birth (optional)',
  'familyEditor.birthMonthUnknown': 'Not sure',
  'familyEditor.stylist': 'Preferred stylist',
  'familyEditor.stylistNone': 'No preference',
  'familyEditor.stylistFormer': 'Former stylist',
  'familyEditor.notes': 'Note for the stylist',
  'familyEditor.notesPlaceholder': 'For example: does not like the clipper noise',
  'familyEditor.newRow': 'New person',
  'familyEditor.save': 'Save',
  'familyEditor.remove': 'Remove',
  'familyEditor.removeNamed': 'Remove {name}',
  'familyEditor.removeRow': 'Remove this row',
  'familyEditor.saved': 'Saved',
  'familyEditor.savedNoDetails':
    'Saved. Month, stylist and note could not be stored right now – please try again later.',
  'familyEditor.partial': 'Please fill in both a name and a year of birth.',
  'familyEditor.removed': 'Removed',
  'familyEditor.unreachable': UNREACHABLE_EN,
  'familyEditor.ageConfirmed': 'Thanks, {name}’s age is confirmed.',
  'familyEditor.ageSaved': 'Thanks, {name}’s age is saved.',
};

export const profileFormLabelsNb: ProfileFormLabels = {
  'profileForm.heading': 'Dine opplysninger',
  'profileForm.firstName': 'Fornavn',
  'profileForm.lastName': 'Etternavn',
  'profileForm.phone': 'Mobil',
  'profileForm.email': 'E-postadresse',
  'profileForm.emailHelp': 'Vil du bytte e-postadresse, må du kontakte oss.',
  'profileForm.save': 'Lagre',
  'profileForm.saved': 'Lagret',
  'profileForm.restored': 'Navnet kan ikke stå tomt, så vi beholdt det du hadde.',
  'profileForm.marketing': 'Ja takk, send meg nyheter og tilbud fra Salong Demo på e-post',
  'profileForm.unreachable': UNREACHABLE_NB,
};

export const profileFormLabelsEn: ProfileFormLabels = {
  'profileForm.heading': 'Your details',
  'profileForm.firstName': 'First name',
  'profileForm.lastName': 'Last name',
  'profileForm.phone': 'Mobile',
  'profileForm.email': 'E-mail address',
  'profileForm.emailHelp': 'To change your e-mail address, please get in touch with us.',
  'profileForm.save': 'Save',
  'profileForm.saved': 'Saved',
  'profileForm.restored': 'A name cannot be empty, so we kept the one you had.',
  'profileForm.marketing': 'Yes, e-mail me news and offers from Salong Demo',
  'profileForm.unreachable': UNREACHABLE_EN,
};

export const dataControlsLabelsNb: DataControlsLabels = {
  'dataControls.heading': 'Dataene dine',
  'dataControls.export': 'Last ned en kopi',
  'dataControls.delete': 'Slett kontoen',
  'dataControls.confirmHeading': 'Vil du virkelig slette kontoen?',
  'dataControls.consequences':
    'Timer du har bestilt, blir avbestilt, historikken blir anonymisert, og du kan ikke logge inn igjen.',
  'dataControls.confirmLabel': 'Skriv {word} for å bekrefte',
  'dataControls.confirmHelp': 'Dette kan ikke gjøres om.',
  'dataControls.wrongWord': 'Skriv {word} nøyaktig slik, med store bokstaver.',
  'dataControls.deleteForever': 'Slett kontoen for godt',
  'dataControls.cancel': 'Avbryt',
  'dataControls.unreachable': UNREACHABLE_NB,
  'dataControls.confirmWord': 'SLETT',
};

export const dataControlsLabelsEn: DataControlsLabels = {
  'dataControls.heading': 'Your data',
  'dataControls.export': 'Download a copy',
  'dataControls.delete': 'Delete my account',
  'dataControls.confirmHeading': 'Really delete your account?',
  'dataControls.consequences':
    'Upcoming appointments are cancelled, your history is anonymised, and you will not be able to log in again.',
  'dataControls.confirmLabel': 'Type {word} to confirm',
  'dataControls.confirmHelp': 'This cannot be undone.',
  'dataControls.wrongWord': 'Type {word} exactly, in capital letters.',
  'dataControls.deleteForever': 'Delete my account for good',
  'dataControls.cancel': 'Cancel',
  'dataControls.unreachable': UNREACHABLE_EN,
  'dataControls.confirmWord': 'DELETE',
};

export const logoutLabelsNb: LogoutButtonLabels = {
  'logout.button': 'Logg ut',
  'logout.unreachable': UNREACHABLE_NB,
};

export const logoutLabelsEn: LogoutButtonLabels = {
  'logout.button': 'Log out',
  'logout.unreachable': UNREACHABLE_EN,
};

export const vippsLinkLabelsNb: VippsLinkRowLabels = {
  'vippsLink.heading': 'Vipps',
  'vippsLink.linked': 'Kontoen er koblet til Vipps',
  'vippsLink.pitch': 'Koble til Vipps, så logger du inn med ett trykk.',
  'vippsLink.button': 'Koble til Vipps',
  'vippsLink.success': 'Vipps er nå koblet til',
  'vippsLink.conflict':
    'Denne Vipps-kontoen hører allerede til en annen profil. Kontakt oss om du trenger hjelp.',
  'vippsLink.failed': 'Vi fikk ikke til å koble til Vipps. Prøv en gang til.',
  'vippsLink.unavailable': 'Vipps er utilgjengelig akkurat nå. Prøv igjen litt senere.',
  'vippsLink.throttled': 'Vent litt, og prøv igjen.',
};

export const vippsLinkLabelsEn: VippsLinkRowLabels = {
  'vippsLink.heading': 'Vipps',
  'vippsLink.linked': 'Your account is linked to Vipps',
  'vippsLink.pitch': 'Link Vipps and log in with a single tap next time.',
  'vippsLink.button': 'Link Vipps',
  'vippsLink.success': 'Vipps is now linked',
  'vippsLink.conflict':
    'This Vipps account already belongs to another profile. Get in touch if you need help.',
  'vippsLink.failed': 'We could not link Vipps. Please try once more.',
  'vippsLink.unavailable': 'Vipps is unavailable right now. Please try again a little later.',
  'vippsLink.throttled': 'Please wait a moment and try again.',
};
