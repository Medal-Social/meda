/**
 * Neutral nb / en label packs for the details step, the summary bar and the
 * confirmation, written for the invented «Salong Demo». Stories and tests only.
 */
import type { ConfirmationLabels } from '../confirmation.js';
import type { DetailsScreenLabels } from '../details-screen.js';
import type { SummaryBarLabels } from '../summary-bar.js';

export const detailsScreenLabelsNb: DetailsScreenLabels = {
  'details.heading': 'Snart ferdig',
  'details.phone.label': 'Mobil',
  'details.phone.prefix': '+47',
  'details.phone.error': 'Mobilnummeret ser ikke komplett ut. Sjekk sifrene.',
  'details.name.label': 'Navnet ditt',
  'details.known.label': 'Timene gjelder',
  'details.known.for': 'til {who}',
  'details.known.self': 'deg',
  'details.known.adult': 'en voksen',
  'details.known.child': 'barnet',
  'details.child.name': 'Navn på den som kommer',
  'details.child.year': 'Født år',
  'details.child.yearPlaceholder': '2018',
  'details.email.label': 'E-postadresse',
  'details.email.help': 'Vi sender bekreftelsen og en kalenderfil hit.',
  'details.email.error': 'E-postadressen ser ikke riktig ut.',
  'details.notes.label': 'Beskjed til salongen',
  'details.notes.placeholder': 'For eksempel ønsker eller hensyn vi bør kjenne til',
  'details.terms.text': 'Jeg vet at timen kan flyttes eller avlyses gratis innen salongens frist.',
  'details.terms.link': 'Les vilkårene',
  'details.marketing.text': 'Send meg påminnelser og tilbud fra Salong Demo.',
  'details.error.maxParty': 'Du kan bestille for opptil tre personer om gangen.',
  'details.error.slotTaken': 'Noen andre rakk å ta tiden. Velg en ny tid.',
  'details.error.conflict': 'Timen kunne ikke settes opp. Prøv igjen.',
  'details.error.invalidInput': 'Noen felt er ikke riktig fylt ut. Se over og prøv igjen.',
  'details.error.unconfigured': 'Timeboken er ikke tilgjengelig akkurat nå.',
  'details.error.upstreamError':
    'Vi fikk ikke svar fra timeboken, så vi vet ikke om timen ble registrert. Trykk på knappen igjen – du blir ikke booket to ganger.',
  'details.error.inProgress':
    'Bestillingen er allerede mottatt. Se etter bekreftelsen på e-post, eller ring oss.',
  'details.call.link': 'Ring {phone}',
  'details.call.none': 'Ring salongen, så hjelper vi deg.',
  'details.submit': 'Bestill – {price} betales i salongen',
};

export const detailsScreenLabelsEn: DetailsScreenLabels = {
  'details.heading': 'Almost done',
  'details.phone.label': 'Mobile',
  'details.phone.prefix': '+44',
  'details.phone.error': 'That number looks incomplete. Please check the digits.',
  'details.name.label': 'Your name',
  'details.known.label': 'These appointments are for',
  'details.known.for': 'for {who}',
  'details.known.self': 'you',
  'details.known.adult': 'an adult',
  'details.known.child': 'your child',
  'details.child.name': 'Name of the person coming',
  'details.child.year': 'Year of birth',
  'details.child.yearPlaceholder': '2018',
  'details.email.label': 'Email address',
  'details.email.help': 'We send the confirmation and a calendar file here.',
  'details.email.error': 'That email address does not look right.',
  'details.notes.label': 'Message for the salon',
  'details.notes.placeholder': 'Anything we should know in advance',
  'details.terms.text':
    'I understand the appointment can be moved or cancelled free of charge before the salon’s deadline.',
  'details.terms.link': 'Read the terms',
  'details.marketing.text': 'Send me reminders and offers from Salong Demo.',
  'details.error.maxParty': 'You can book for up to three people at a time.',
  'details.error.slotTaken': 'Someone else took that time. Please pick another.',
  'details.error.conflict': 'We could not set up the appointment. Please try again.',
  'details.error.invalidInput': 'Some fields are not filled in correctly. Please check them.',
  'details.error.unconfigured': 'Online booking is unavailable right now.',
  'details.error.upstreamError':
    'The booking system did not answer, so we do not know if the appointment was made. Press the button again – you will not be booked twice.',
  'details.error.inProgress':
    'We already have this booking. Look for the confirmation email, or give us a call.',
  'details.call.link': 'Call {phone}',
  'details.call.none': 'Call the salon and we will help.',
  'details.submit': 'Book – {price} paid at the salon',
};

export const summaryBarLabelsNb: SummaryBarLabels = {
  'summary.placeholder.who': 'Velg hvem timen gjelder',
  'summary.placeholder.service': 'Velg en behandling',
  'summary.next': 'Videre',
};

export const summaryBarLabelsEn: SummaryBarLabels = {
  'summary.placeholder.who': 'Choose who the booking is for',
  'summary.placeholder.service': 'Choose a service',
  'summary.next': 'Continue',
};

export const confirmationLabelsNb: ConfirmationLabels = {
  'confirmation.heading': 'Timen er bestilt',
  'confirmation.serviceFor': '{service} for {name}',
  'confirmation.when': '{day} kl. {time}',
  'confirmation.party.heading': 'Felles besøk · {day}',
  'confirmation.party.line': '{time} {name} – {service} {stylist} – {price}',
  'confirmation.party.stylist': 'hos {name}',
  'confirmation.party.total': 'Til sammen {total} · betales i salongen',
  'confirmation.calendar': 'Legg i kalenderen',
  'confirmation.manage': 'Flytt eller avbestill',
  'confirmation.manageFor': 'Flytt eller avbestill {who} kl. {time}',
  'confirmation.portal': 'Se alle timene dine',
  'confirmation.startOver': 'Bestill en ny time',
};

export const confirmationLabelsEn: ConfirmationLabels = {
  'confirmation.heading': 'You are booked in',
  'confirmation.serviceFor': '{service} for {name}',
  'confirmation.when': '{day} at {time}',
  'confirmation.party.heading': 'Group visit · {day}',
  'confirmation.party.line': '{time} {name} – {service} {stylist} – {price}',
  'confirmation.party.stylist': 'with {name}',
  'confirmation.party.total': 'Total {total} · paid at the salon',
  'confirmation.calendar': 'Add to calendar',
  'confirmation.manage': 'Change or cancel',
  'confirmation.manageFor': 'Change or cancel {who} at {time}',
  'confirmation.portal': 'See all your bookings',
  'confirmation.startOver': 'Book another appointment',
};
