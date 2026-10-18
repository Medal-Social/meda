import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEMO_NOW, demoFormatNb } from './__stories__/fixtures.js';
import { bookingPanelLabelsNb } from './__stories__/labels.details.js';
import { bookingStoryParameters } from './__stories__/story-helpers.js';
import { BookingPanel } from './booking-panel.js';

const meta: Meta<typeof BookingPanel> = {
  title: 'Booking/BookingPanel',
  component: BookingPanel,
  parameters: bookingStoryParameters,
  args: {
    labels: bookingPanelLabelsNb,
    format: demoFormatNb,
    who: '1 barn',
    services: 'Barneklipp · 30 min',
    startTs: DEMO_NOW + 2 * 24 * 60 * 60_000,
    stylist: { name: 'Ada Demo', firstAvailable: true },
    alternatives: [{ resourceId: 'res-bo', name: 'Bo Demo' }],
    onSwap: () => undefined,
    totalOre: 39_000,
    onContinue: () => undefined,
    canContinue: true,
    notes: [
      { kind: 'change', text: 'Gratis å endre til 24 timer før' },
      { kind: 'payment', text: 'Vipps, kort eller kontant' },
      { kind: 'place', text: 'Demogata 1, Oslo' },
    ],
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <BookingPanel {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof BookingPanel>;

/** A time picked with «first available», someone else free at the same minute. */
export const Default: Story = {};

/** Before anything is chosen: every row says so, and there is no total. */
export const Empty: Story = {
  args: {
    who: null,
    services: null,
    startTs: null,
    stylist: null,
    totalOre: null,
    canContinue: false,
  },
};
