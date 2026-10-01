import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  DEMO_ADDRESS,
  DEMO_NOW,
  DEMO_PHONE,
  demoDaypartsEn,
  demoDaypartsNb,
  demoFormatEn,
  demoFormatNb,
  demoSlots,
} from './__stories__/fixtures.js';
import { manageLabelsEn, manageLabelsNb } from './__stories__/labels.time.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { labelText } from './labels.js';
import { type ManageResult, ManageScreen } from './manage-screen.js';
import type { BookingManageDto } from './types.js';

const HOUR = 3_600_000;
const START = DEMO_NOW + (72 + 7) * HOUR; // Thursday 15:00

const booking: BookingManageDto = {
  bookingId: 'bk_demo',
  status: 'confirmed',
  rescheduledFromId: null,
  startTs: START,
  endTs: START + 30 * 60_000,
  serviceId: 'svc-kids',
  serviceName: 'Barneklipp',
  resourceId: 'res-ada',
  resourceName: 'Ada Demo',
  bookedForName: 'Mia',
  partySequenceId: null,
  amountOre: 39_000,
  cancelWindowHours: 24,
  rescheduleWindowHours: 24,
  canCancel: true,
  canReschedule: true,
};

const done = async (): Promise<ManageResult> => ({ ok: true, manageHref: '#moved' });

const meta: Meta<typeof ManageScreen> = {
  title: 'Booking/ManageScreen',
  component: ManageScreen,
  parameters: bookingStoryParameters,
  args: {
    labels: manageLabelsNb,
    format: demoFormatNb,
    dayparts: demoDaypartsNb,
    booking,
    phone: DEMO_PHONE,
    address: DEMO_ADDRESS,
    bookingHref: '#book',
    portalHref: '#account',
    icsHref: 'data:text/calendar;charset=utf-8,BEGIN%3AVCALENDAR',
    icsFileName: 'appointment.ics',
    reschedule: { slots: demoSlots() },
    now: DEMO_NOW,
    onRequestSlots: () => undefined,
    onCancel: done,
    onReschedule: done,
  },
  render: (args) => (
    <BookingColumn>
      <ManageScreen {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof ManageScreen>;

export const Default: Story = {};

/** English, in the reschedule step: the current hour is marked among the openings. */
export const English: Story = {
  args: {
    labels: manageLabelsEn,
    format: demoFormatEn,
    dayparts: demoDaypartsEn,
    reschedule: { slots: demoSlots(demoFormatEn.clock) },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: labelText(manageLabelsEn['manage.change']) })
    );
    await expect(
      canvas.getByRole('heading', { name: labelText(manageLabelsEn['time.heading']) })
    ).toBeVisible();
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <ManageScreen {...args} />
    </SecondBrand>
  ),
};
