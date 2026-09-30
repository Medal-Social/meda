/**
 * Neutral nb / en label packs for the login (panel, sheet, code field, Vipps
 * button) and the portal display screens, written for the invented «Salong
 * Demo». Stories and tests only.
 */
import type { LoginPanelLabels } from '../login-panel.js';
import type { LoginSheetLabels } from '../login-sheet.js';
import type { OtpSlotsLabels } from '../otp-slots.js';
import type { ChildCardsLabels } from '../portal/child-cards.js';
import type { PortalShellLabels } from '../portal/portal-shell.js';
import type { PortalUnreachableLabels } from '../portal/portal-unreachable.js';
import type { RebookCardsLabels } from '../portal/rebook-cards.js';
import type { UpcomingBookingsLabels } from '../portal/upcoming-bookings.js';
import type { VisitHistoryLabels } from '../portal/visit-history.js';
import type { VippsButtonLabels } from '../vipps-button.js';

export const otpSlotsLabelsNb: OtpSlotsLabels = { 'otp.label': 'Kode fra e-posten' };
export const otpSlotsLabelsEn: OtpSlotsLabels = { 'otp.label': 'One-time code' };

export const vippsButtonLabelsNb: VippsButtonLabels = {
  'vipps.button': 'Logg inn med Vipps',
  'vipps.unavailable': 'Innlogging med Vipps er nede akkurat nå. Bruk e-post i stedet.',
  'vipps.throttled': 'Vent litt, og prøv igjen.',
};
export const vippsButtonLabelsEn: VippsButtonLabels = {
  'vipps.button': 'Log in with Vipps',
  'vipps.unavailable': 'Vipps login is down right now. Use e-mail instead.',
  'vipps.throttled': 'Wait a moment and try again.',
};

export const loginPanelLabelsNb: LoginPanelLabels = {
  ...otpSlotsLabelsNb,
  ...vippsButtonLabelsNb,
  'login.heading': 'Logg inn',
  'login.codeHeading': 'Se etter koden i e-posten',
  'login.or': 'eller',
  'login.emailIntro': 'Bruk e-postadressen du bestilte med, så sender vi deg en kode.',
  'login.emailLabel': 'E-postadresse',
  'login.sendCode': 'Send meg en kode',
  'login.codeLabel': 'Kode',
  'login.submitCode': 'Logg inn',
  'login.codeHelp': 'Seks sifre, sendt til {email}. Koden varer i ti minutter.',
  'login.codeHelpVipps': 'Seks sifre. Riktig kode kobler Vipps til kontoen din.',
  'login.vippsSentTo': 'Koden er sendt til {to}.',
  'login.vippsSentToUnknown': 'Koden er sendt til e-postadressen vi har registrert på deg.',
  'login.cooldownWait': 'Du kan be om en ny kode om {seconds} sekunder.',
  'login.cooldownReady': 'Nå kan du be om en ny kode.',
  'login.resendIn': 'Ny kode om {time}',
  'login.resend': 'Send en ny kode',
  'login.switchEmail': 'Bytt e-postadresse',
  'login.useEmailInstead': 'Bruk e-post i stedet',
  'login.notice.sent':
    'Finnes adressen hos oss, er en kode på vei. Se i innboksen, og i søppelposten.',
  'login.notice.resent':
    'Finnes adressen hos oss, er en ny kode på vei. Se i innboksen, og i søppelposten.',
  'login.notice.unreachable': 'Vi når ikke timeboken akkurat nå. Prøv igjen straks.',
  'login.notice.badEmail': 'Den e-postadressen ser ikke riktig ut.',
  'login.notice.invalid': 'Koden er feil eller utløpt. Prøv igjen, eller be om en ny.',
  'login.notice.throttled': 'For mange forsøk på kort tid. Vent litt.',
  'login.notice.vippsInvalid': 'Koden er feil eller utløpt.',
  'login.notice.vippsConflict':
    'Denne Vipps-kontoen hører til en annen konto hos oss. Logg inn med e-post, eller ring oss.',
};

export const loginPanelLabelsEn: LoginPanelLabels = {
  ...otpSlotsLabelsEn,
  ...vippsButtonLabelsEn,
  'login.heading': 'Log in',
  'login.codeHeading': 'Check your e-mail for the code',
  'login.or': 'or',
  'login.emailIntro': 'Use the e-mail address you booked with and we will send you a code.',
  'login.emailLabel': 'E-mail address',
  'login.sendCode': 'Send me a code',
  'login.codeLabel': 'Code',
  'login.submitCode': 'Log in',
  'login.codeHelp': 'Six digits, sent to {email}. The code lasts ten minutes.',
  'login.codeHelpVipps': 'Six digits. The right code links Vipps to your account.',
  'login.vippsSentTo': 'The code went to {to}.',
  'login.vippsSentToUnknown': 'The code went to the e-mail address we have on file for you.',
  'login.cooldownWait': 'You can ask for a new code in {seconds} seconds.',
  'login.cooldownReady': 'You can ask for a new code now.',
  'login.resendIn': 'New code in {time}',
  'login.resend': 'Send a new code',
  'login.switchEmail': 'Use a different address',
  'login.useEmailInstead': 'Use e-mail instead',
  'login.notice.sent':
    'If we know that address, a code is on its way. Check your inbox, and your spam folder.',
  'login.notice.resent':
    'If we know that address, a new code is on its way. Check your inbox, and your spam folder.',
  'login.notice.unreachable': 'We cannot reach the booking system right now. Try again shortly.',
  'login.notice.badEmail': 'That e-mail address does not look right.',
  'login.notice.invalid': 'That code is wrong or expired. Try again, or ask for a new one.',
  'login.notice.throttled': 'Too many tries in a short time. Wait a little.',
  'login.notice.vippsInvalid': 'That code is wrong or expired.',
  'login.notice.vippsConflict':
    'This Vipps account belongs to another account with us. Log in with e-mail, or call us.',
};

export const loginSheetLabelsNb: LoginSheetLabels = {
  ...loginPanelLabelsNb,
  'loginSheet.prompt': 'Kunde fra før? {trigger}, så fyller vi ut det vi vet.',
  'loginSheet.trigger': 'Logg inn',
  'loginSheet.intro': 'Vi fyller ut navn og nummer, og timen dukker opp på kontoen din.',
  'loginSheet.vipps': 'Fortsett med Vipps',
  'loginSheet.close': 'Lukk',
};

export const loginSheetLabelsEn: LoginSheetLabels = {
  ...loginPanelLabelsEn,
  'loginSheet.prompt': 'Been here before? {trigger} and we fill in what we know.',
  'loginSheet.trigger': 'Log in',
  'loginSheet.intro': 'We fill in your name and number, and the booking shows up in your account.',
  'loginSheet.vipps': 'Continue with Vipps',
  'loginSheet.close': 'Close',
};

export const portalShellLabelsNb: PortalShellLabels = {
  'portalShell.nav': 'Kontoen din',
  'portalShell.navBar': 'Kontomeny',
};
export const portalShellLabelsEn: PortalShellLabels = {
  'portalShell.nav': 'Your account',
  'portalShell.navBar': 'Account menu',
};

export const portalUnreachableLabelsNb: PortalUnreachableLabels = {
  'portalUnreachable.heading': 'Kontoen din er utilgjengelig akkurat nå',
  'portalUnreachable.body':
    'Timene dine ligger trygt – det er bare vi som ikke når timeboken. Prøv igjen straks, eller ring oss.',
  'portalUnreachable.retry': 'Last inn på nytt',
  'portalUnreachable.call': 'Ring {phone}',
};
export const portalUnreachableLabelsEn: PortalUnreachableLabels = {
  'portalUnreachable.heading': 'Your account is unavailable right now',
  'portalUnreachable.body':
    'Your bookings are safe – we just cannot reach the booking system. Try again shortly, or call us.',
  'portalUnreachable.retry': 'Reload',
  'portalUnreachable.call': 'Call {phone}',
};

export const upcomingBookingsLabelsNb: UpcomingBookingsLabels = {
  'upcoming.heading': 'Neste timer',
  'upcoming.empty': 'Du har ingen timer framover.',
  'upcoming.book': 'Bestill en time',
  'upcoming.next': 'Neste time – {when}',
  'upcoming.today': 'i dag',
  'upcoming.tomorrow': 'i morgen',
  'upcoming.inDays': 'om {count} dager',
  'upcoming.when': '{day} kl. {time}',
  'upcoming.serviceFallback': 'Time',
  'upcoming.anyStylist': 'Hvem som helst',
  'upcoming.manage': 'Flytt eller avlys',
  'upcoming.noManage': 'Kontakt oss for å gjøre endringer.',
  'upcoming.noManageWithPhone': 'Kontakt oss for å gjøre endringer – {call}.',
  'upcoming.call': 'ring {phone}',
};
export const upcomingBookingsLabelsEn: UpcomingBookingsLabels = {
  'upcoming.heading': 'Coming up',
  'upcoming.empty': 'You have no appointments coming up.',
  'upcoming.book': 'Book an appointment',
  'upcoming.next': 'Next appointment – {when}',
  'upcoming.today': 'today',
  'upcoming.tomorrow': 'tomorrow',
  'upcoming.inDays': 'in {count} days',
  'upcoming.when': '{day} at {time}',
  'upcoming.serviceFallback': 'Appointment',
  'upcoming.anyStylist': 'Anyone available',
  'upcoming.manage': 'Move or cancel',
  'upcoming.noManage': 'Contact us to make changes.',
  'upcoming.noManageWithPhone': 'Contact us to make changes – {call}.',
  'upcoming.call': 'call {phone}',
};

export const visitHistoryLabelsNb: VisitHistoryLabels = {
  'history.heading': 'Tidligere besøk',
  'history.empty': 'Ingen besøk ennå. Her dukker de opp etter første time.',
  'history.serviceFallback': 'Besøk',
  'history.count.one': '{count} besøk i {year}',
  'history.count.other': '{count} besøk i {year}',
  'history.unknownAmount': '—',
};
export const visitHistoryLabelsEn: VisitHistoryLabels = {
  'history.heading': 'Past visits',
  'history.empty': 'No visits yet. They show up here after the first appointment.',
  'history.serviceFallback': 'Visit',
  'history.count.one': '{count} visit in {year}',
  'history.count.other': '{count} visits in {year}',
  'history.unknownAmount': '—',
};

export const rebookCardsLabelsNb: RebookCardsLabels = {
  'rebook.heading': 'Bestill på nytt',
  'rebook.empty': 'Etter første besøk kan du bestille det samme igjen herfra.',
  'rebook.serviceFallback': 'Time',
  'rebook.anyStylist': 'Hvem som helst',
  'rebook.cta': 'Bestill det samme',
};
export const rebookCardsLabelsEn: RebookCardsLabels = {
  'rebook.heading': 'Book again',
  'rebook.empty': 'After your first visit you can book the same again from here.',
  'rebook.serviceFallback': 'Appointment',
  'rebook.anyStylist': 'Anyone available',
  'rebook.cta': 'Book the same',
};

export const childCardsLabelsNb: ChildCardsLabels = {
  'childCards.empty': 'Ingen barn registrert ennå.',
  'childCards.neverVisited': '{age} · ikke vært hos oss ennå',
  'childCards.lastVisit': '{age} · sist: {service}, {date}',
  'childCards.lastVisitNoService': '{age} · sist: {date}',
  'childCards.book': 'Bestill til {name}',
  'childCards.stylist': 'Fast stylist',
  'childCards.next': 'Neste time',
  'childCards.none': '–',
};
export const childCardsLabelsEn: ChildCardsLabels = {
  'childCards.empty': 'No children added yet.',
  'childCards.neverVisited': '{age} · not been in yet',
  'childCards.lastVisit': '{age} · last: {service}, {date}',
  'childCards.lastVisitNoService': '{age} · last: {date}',
  'childCards.book': 'Book for {name}',
  'childCards.stylist': 'Usual stylist',
  'childCards.next': 'Next appointment',
  'childCards.none': '–',
};

/** Every label this group defines, in one pack. */
export const portalLabelsNb = {
  ...loginSheetLabelsNb,
  ...portalShellLabelsNb,
  ...portalUnreachableLabelsNb,
  ...upcomingBookingsLabelsNb,
  ...visitHistoryLabelsNb,
  ...rebookCardsLabelsNb,
  ...childCardsLabelsNb,
};
export const portalLabelsEn: typeof portalLabelsNb = {
  ...loginSheetLabelsEn,
  ...portalShellLabelsEn,
  ...portalUnreachableLabelsEn,
  ...upcomingBookingsLabelsEn,
  ...visitHistoryLabelsEn,
  ...rebookCardsLabelsEn,
  ...childCardsLabelsEn,
};
