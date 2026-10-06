import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DEMO_PHONE, demoFormatEn, demoFormatNb, demoServices } from './__stories__/fixtures.js';
import { detailsScreenLabelsEn, detailsScreenLabelsNb } from './__stories__/labels.details.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { DetailsScreen, type DetailsScreenProps } from './details-screen.js';
import type { WizardAction, WizardService, WizardState } from './types.js';

const kids: WizardService = demoServices[0] as WizardService;
const kidsWash: WizardService = demoServices[1] as WizardService;

/** Thursday 17 September 2026, 15:00 Oslo. */
const START = Date.UTC(2026, 8, 17, 13);

function demoState(items: WizardState['items']): WizardState {
  return {
    step: 'details',
    people: [],
    choices: [],
    items,
    resourceId: null,
    stylistAnswered: true,
    partyMode: 'sequential',
    startTs: START,
    resolvedResourceId: 'res-ada',
    partyResourceIds: null,
    contact: { phone: '', name: '', email: '' },
    notes: '',
    consentTerms: false,
    consentMarketing: false,
    pendingService: null,
    error: null,
  };
}

/** A story-only reducer for the actions the screen raises. */
function apply(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'setContact':
      return { ...state, contact: { ...state.contact, [action.field]: action.value } };
    case 'setNotes':
      return { ...state, notes: action.value };
    case 'setConsent':
      return action.which === 'terms'
        ? { ...state, consentTerms: action.accepted }
        : { ...state, consentMarketing: action.accepted };
    case 'setItemField': {
      const items = state.items.map((item, index) =>
        index === action.index ? { ...item, [action.field]: action.value ?? undefined } : item
      );
      return { ...state, items };
    }
    default:
      return state;
  }
}

const normalisePhone = (value: string) => value.replace(/[\s()-]/g, '').replace(/^\+47/, '');
const phoneLooksValid = (value: string) => /^\d{8}$/.test(normalisePhone(value));

type DemoProps = Omit<
  DetailsScreenProps,
  'state' | 'onChange' | 'onSubmit' | 'lines' | 'totalOre'
> & {
  initial: WizardState;
};

function Demo({ initial, ...props }: DemoProps) {
  const [state, setState] = useState(initial);
  const lines = state.items.map((_item, index) => ({
    startTs:
      START +
      state.items.slice(0, index).reduce((sum, prev) => sum + prev.service.durationMinutes, 0) *
        60_000,
    resourceId: 'res-ada',
  }));
  const totalOre = state.items.reduce((sum, item) => sum + item.service.priceOre, 0);
  return (
    <BookingColumn>
      <DetailsScreen
        {...props}
        state={state}
        onChange={(action) => setState((previous) => apply(previous, action))}
        onSubmit={() => undefined}
        lines={lines}
        totalOre={totalOre}
      />
    </BookingColumn>
  );
}

const meta = {
  title: 'Booking/DetailsScreen',
  component: Demo,
  parameters: bookingStoryParameters,
  args: {
    initial: demoState([{ service: kids }]),
    phoneLooksValid,
    normalisePhone,
    marketingConsent: true,
    termsHref: '#terms',
    phone: DEMO_PHONE,
    format: demoFormatNb,
    labels: detailsScreenLabelsNb,
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  args: {
    initial: {
      ...demoState([{ service: kids }, { service: kidsWash }]),
      error: 'slotTaken',
    },
    family: [
      { name: 'Mia', birthYear: 2018 },
      { name: 'Leo', birthYear: 2021 },
    ],
    format: demoFormatEn,
    labels: detailsScreenLabelsEn,
  },
};

/** Logged in: the e-mail is the one they signed in with, read-only. */
export const EmailReadOnly: Story = {
  args: {
    emailReadOnly: true,
    initial: {
      ...demoState([{ service: kids }]),
      contact: { phone: '40000000', name: '', email: 'kari@example.com' },
    },
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <Demo {...args} />
    </SecondBrand>
  ),
};
