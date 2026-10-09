/**
 * Neutral nb / en label packs for the step screens (who, service, stylist and
 * the add-child sheet), written for the invented «Salong Demo». Story and test
 * fixtures only.
 */
import type { AddChildSheetLabels } from '../add-child-sheet.js';
import type { ServiceMultiLabels, ServiceScreenLabels } from '../service-screen.js';
import type { StylistScreenLabels } from '../stylist-screen.js';
import type { WhoScreenLabels } from '../who-screen.js';

export const addChildSheetLabelsNb: AddChildSheetLabels = {
  'addChild.trigger': 'Legg til barn',
  'addChild.title': 'Legg til barn',
  'addChild.description.saved': 'Barnet lagres på profilen din til neste gang.',
  'addChild.description.local': 'Gjelder bare denne bestillingen.',
  'addChild.name': 'Navn',
  'addChild.birthYear': 'Fødselsår',
  'addChild.birthYearPlaceholder': 'Velg år',
  'addChild.birthMonth': 'Fødselsmåned (valgfritt)',
  'addChild.birthMonthUnknown': 'Vet ikke',
  'addChild.notes': 'Notat til salongen (valgfritt)',
  'addChild.missing': 'Skriv inn navn og velg fødselsår.',
  'addChild.submit': 'Legg til',
  'addChild.close': 'Lukk',
};

export const addChildSheetLabelsEn: AddChildSheetLabels = {
  'addChild.trigger': 'Add a child',
  'addChild.title': 'Add a child',
  'addChild.description.saved': 'We keep the child on your profile for next time.',
  'addChild.description.local': 'Only for this booking.',
  'addChild.name': 'Name',
  'addChild.birthYear': 'Year of birth',
  'addChild.birthYearPlaceholder': 'Choose year',
  'addChild.birthMonth': 'Month of birth (optional)',
  'addChild.birthMonthUnknown': 'Not sure',
  'addChild.notes': 'Note for the salon (optional)',
  'addChild.missing': 'Enter a name and choose a year of birth.',
  'addChild.submit': 'Add',
  'addChild.close': 'Close',
};

export const whoScreenLabelsNb: WhoScreenLabels = {
  ...addChildSheetLabelsNb,
  'who.heading': 'Hvem gjelder timen?',
  'who.guest.groupLabel': 'Hvor mange gjelder timen?',
  'who.guest.children.one': '{count} barn',
  'who.guest.children.other': '{count} barn',
  'who.guest.adult': 'Voksen',
  'who.guest.addedList': 'Barn i denne bestillingen',
  'who.family.legend': 'Velg opptil {max}',
  'who.family.self': 'Meg selv (voksen)',
  'who.family.limit': 'En bestilling kan gjelde opptil {max} personer.',
  'who.party.children': 'Barn',
  'who.party.childrenNote': '0–12 år',
  'who.party.adult': 'Jeg skal også klippes',
  'who.party.adultNote': 'Samtidig, i stolen ved siden av',
  'who.party.fewer': 'Ett barn færre',
  'who.party.more': 'Ett barn til',
  'who.party.count': '{count} barn',
};

export const whoScreenLabelsEn: WhoScreenLabels = {
  ...addChildSheetLabelsEn,
  'who.heading': 'Who is the appointment for?',
  'who.guest.groupLabel': 'How many people?',
  'who.guest.children.one': '{count} child',
  'who.guest.children.other': '{count} children',
  'who.guest.adult': 'Adult',
  'who.guest.addedList': 'Children in this booking',
  'who.family.legend': 'Choose up to {max}',
  'who.family.self': 'Myself (adult)',
  'who.family.limit': 'One booking can include up to {max} people.',
  'who.party.children': 'Children',
  'who.party.childrenNote': 'Ages 0–12',
  'who.party.adult': 'I’m getting a cut too',
  'who.party.adultNote': 'At the same time, in the next chair',
  'who.party.fewer': 'One child fewer',
  'who.party.more': 'One more child',
  'who.party.count': '{count} children',
};

/** The multi-select step's labels (`ServiceSelection.labels`). */
export const serviceMultiLabelsNb: ServiceMultiLabels = {
  'service.multiHint': 'Velg én eller flere',
  'service.total': '{minutes} min · {price}',
  'service.chooseFirst': 'Velg minst én tjeneste',
  'service.continue': 'Neste',
  'service.party.nothingBookable': 'Ingen tjenester kan bestilles på nett for {label}.',
  'service.tabDone': 'ferdig',
};

export const serviceMultiLabelsEn: ServiceMultiLabels = {
  'service.multiHint': 'Choose one or more',
  'service.total': '{minutes} min · {price}',
  'service.chooseFirst': 'Choose at least one service',
  'service.continue': 'Next',
  'service.party.nothingBookable': 'Nothing can be booked online for {label}.',
  'service.tabDone': 'done',
};

export const serviceScreenLabelsNb: ServiceScreenLabels = {
  'service.heading': 'Hva vil du bestille?',
  'service.categoriesLegend': 'Kategorier',
  'service.sameAsLast': 'Samme som sist',
  'service.chooseOther': 'Velg noe annet',
  'service.duration': '{minutes} min',
  'service.phoneOnly': 'Bestilles på telefon',
  'service.phoneOnlyLinkLabel': 'Bestilles på telefon – ring {phone}',
  'service.ageDivider.named': 'Passer vanligvis ikke for alderen til {name}',
  'service.ageDivider.unnamed': 'Passer vanligvis ikke for alderen',
  'service.party.listLabel': 'Tjenester for {label}',
  'service.party.adultAlone': '{label} må bestilles som en egen time.',
  'service.party.nothingFits': 'Ingen tjenester kan bestilles for {label} i en så stor gruppe.',
  'service.party.remove': 'Fjern {label} fra denne timen',
  ...serviceMultiLabelsNb,
};

export const serviceScreenLabelsEn: ServiceScreenLabels = {
  'service.heading': 'What would you like to book?',
  'service.categoriesLegend': 'Categories',
  'service.sameAsLast': 'Same as last time',
  'service.chooseOther': 'Choose something else',
  'service.duration': '{minutes} min',
  'service.phoneOnly': 'Book by phone',
  'service.phoneOnlyLinkLabel': 'Book by phone – call {phone}',
  'service.ageDivider.named': 'Usually not suited to {nameGenitive} age',
  'service.ageDivider.unnamed': 'Usually not suited to this age',
  'service.party.listLabel': 'Services for {label}',
  'service.party.adultAlone': '{label} needs a separate appointment.',
  'service.party.nothingFits': 'Nothing can be booked for {label} in a group this size.',
  'service.party.remove': 'Remove {label} from this appointment',
  ...serviceMultiLabelsEn,
};

export const stylistScreenLabelsNb: StylistScreenLabels = {
  'stylist.heading': 'Hvem vil du bestille hos?',
  'stylist.firstAvailable': 'Første ledige',
  'stylist.firstAvailableSubtitle': 'Første stol som er ledig',
  'stylist.firstAvailableBadge': '★',
  'stylist.pendingName': 'Valgt behandler',
  'stylist.nextAvailable': 'Neste ledige:',
  'stylist.loading': 'Henter behandlere …',
  'stylist.party.legend': 'Hvordan vil dere ha timene?',
  'stylist.party.sequential': 'Samme behandler, etter hverandre',
  'stylist.party.sequentialMinutes': 'Til sammen {minutes} min',
  'stylist.party.parallel.two': 'To behandlere samtidig',
  'stylist.party.parallel.three': 'Tre behandlere samtidig',
  'stylist.party.parallel.other': 'Flere behandlere samtidig',
  'stylist.party.parallelMinutes': 'Ferdig på {minutes} min',
  'stylist.party.parallelNote.two': 'Vi finner to behandlere som er ledige samtidig.',
  'stylist.party.parallelNote.three': 'Vi finner tre behandlere som er ledige samtidig.',
  'stylist.party.parallelNote.other': 'Vi finner {count} behandlere som er ledige samtidig.',
};

export const stylistScreenLabelsEn: StylistScreenLabels = {
  'stylist.heading': 'Who would you like to see?',
  'stylist.firstAvailable': 'First available',
  'stylist.firstAvailableSubtitle': 'We find the first free time',
  'stylist.firstAvailableBadge': '★',
  'stylist.pendingName': 'Chosen stylist',
  'stylist.nextAvailable': 'Next free:',
  'stylist.loading': 'Loading stylists …',
  'stylist.party.legend': 'How would you like the appointments?',
  'stylist.party.sequential': 'Same stylist, one after the other',
  'stylist.party.sequentialMinutes': '{minutes} min in total',
  'stylist.party.parallel.two': 'Two stylists at once',
  'stylist.party.parallel.three': 'Three stylists at once',
  'stylist.party.parallel.other': 'Several stylists at once',
  'stylist.party.parallelMinutes': 'Done in {minutes} min',
  'stylist.party.parallelNote.two': 'We find two stylists who are free at the same time.',
  'stylist.party.parallelNote.three': 'We find three stylists who are free at the same time.',
  'stylist.party.parallelNote.other': 'We find {count} stylists who are free at the same time.',
};

/** The demo categories, in display order. */
export const demoCategoriesNb = [
  { key: 'kids', label: 'Barn' },
  { key: 'adults', label: 'Voksne' },
  { key: 'colour', label: 'Farge' },
  { key: 'other', label: 'Annet' },
];

export const demoCategoriesEn = [
  { key: 'kids', label: 'Children' },
  { key: 'adults', label: 'Adults' },
  { key: 'colour', label: 'Colour' },
  { key: 'other', label: 'Other' },
];
