import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  DEMO_ADDRESS,
  DEMO_NOW,
  demoFormatEn,
  demoFormatNb,
  demoServices,
} from './__stories__/fixtures.js';
import { confirmationLabelsEn, confirmationLabelsNb } from './__stories__/labels.details.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { Confirmation, type ConfirmationLine } from './confirmation.js';
import type { WizardService } from './types.js';

const kids: WizardService = demoServices[0] as WizardService;
const kidsWash: WizardService = demoServices[1] as WizardService;

/** Monday 14 September 2026, 15:00 Oslo — «today» against DEMO_NOW. */
const START = Date.UTC(2026, 8, 14, 13);

const single: ConfirmationLine[] = [
  {
    item: { service: kids, bookedForName: 'Mia' },
    bookingId: 'bk_demo_1',
    stylistName: 'Ada Demo',
    manageHref: '#manage-1',
    startTs: START,
    priceOre: kids.priceOre,
  },
];

const party: ConfirmationLine[] = [
  { ...(single[0] as ConfirmationLine) },
  {
    item: { service: kidsWash, bookedForName: 'Leo' },
    bookingId: 'bk_demo_2',
    stylistName: 'Bo Eksempel (Demo)',
    manageHref: '#manage-2',
    startTs: START + kids.durationMinutes * 60_000,
    priceOre: kidsWash.priceOre,
  },
];

const meta = {
  title: 'Booking/Confirmation',
  component: Confirmation,
  parameters: bookingStoryParameters,
  decorators: [
    (Story) => (
      <BookingColumn>
        <Story />
      </BookingColumn>
    ),
  ],
  args: {
    lines: single,
    startTs: START,
    totalOre: kids.priceOre,
    address: DEMO_ADDRESS,
    calendarHref: 'data:text/calendar;charset=utf-8,BEGIN%3AVCALENDAR%0D%0AEND%3AVCALENDAR',
    calendarFileName: 'salong-demo.ics',
    portalHref: '#account',
    onStartOver: () => undefined,
    now: DEMO_NOW,
    format: demoFormatNb,
    labels: confirmationLabelsNb,
  },
} satisfies Meta<typeof Confirmation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EnglishParty: Story = {
  name: 'English party',
  args: {
    lines: party,
    totalOre: kids.priceOre + kidsWash.priceOre,
    format: demoFormatEn,
    labels: confirmationLabelsEn,
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  args: { lines: party, totalOre: kids.priceOre + kidsWash.priceOre },
  render: (args) => (
    <SecondBrand>
      <Confirmation {...args} />
    </SecondBrand>
  ),
};
