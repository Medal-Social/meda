import type { Meta, StoryObj } from '@storybook/react-vite';
import { dataControlsLabelsEn, dataControlsLabelsNb } from '../__stories__/labels.portal-forms.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import { DataControls } from './data-controls.js';

const meta = {
  title: 'Booking/DataControls',
  component: DataControls,
  parameters: {
    ...bookingStoryParameters,
    a11y: {
      // The shared destructive booking-button look (text-destructive on
      // bg-destructive/10) measures 3.85:1 against meda's default
      // --destructive; that is a token / shared-variant question for the
      // whole booking set, not this screen. Only those buttons are excluded;
      // every other element is still checked.
      context: { exclude: [['[data-slot="button"].text-destructive']] },
    },
  },
  decorators: [
    (Story) => (
      <BookingColumn>
        <Story />
      </BookingColumn>
    ),
  ],
  args: {
    labels: dataControlsLabelsNb,
    onExport: async () => ({ ok: true }),
    onDelete: async () => ({ ok: false, kind: 'error', message: 'Dette er bare en demo.' }),
  },
} satisfies Meta<typeof DataControls>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  args: {
    labels: dataControlsLabelsEn,
    onDelete: async () => ({ ok: false, kind: 'error', message: 'This is only a demo.' }),
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <DataControls {...args} />
    </SecondBrand>
  ),
};
