import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEMO_NOW, demoFormatEn, demoFormatNb, demoResources } from './__stories__/fixtures.js';
import { stylistScreenLabelsEn, stylistScreenLabelsNb } from './__stories__/labels.steps.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { StylistScreen, type StylistScreenProps } from './stylist-screen.js';

const HOUR = 3_600_000;

const nb: StylistScreenProps = {
  labels: stylistScreenLabelsNb,
  format: demoFormatNb,
  now: DEMO_NOW,
  serviceIds: ['svc-cut'],
  resources: demoResources,
  selectedResourceId: 'res-ada',
  nextAvailableTs: { 'res-ada': DEMO_NOW + 2 * HOUR, 'res-bo': DEMO_NOW + 26 * HOUR },
  onPick: () => undefined,
};

const meta: Meta<typeof StylistScreen> = {
  title: 'Booking/StylistScreen',
  component: StylistScreen,
  parameters: bookingStoryParameters,
};
export default meta;

type Story = StoryObj<typeof StylistScreen>;

export const Default: Story = {
  render: () => (
    <BookingColumn>
      <StylistScreen {...nb} />
    </BookingColumn>
  ),
};

/** A family of two, in English, still loading the next openings. */
export const Family: Story = {
  render: () => (
    <BookingColumn>
      <StylistScreen
        {...nb}
        labels={stylistScreenLabelsEn}
        format={demoFormatEn}
        serviceIds={['svc-kids', 'svc-kids']}
        selectedResourceId={null}
        nextAvailableTs={{ 'res-ada': DEMO_NOW + 3 * HOUR }}
        nextAvailableLoading
        party={{
          mode: 'sequential',
          size: 2,
          minutes: { sequential: 60, parallel: 30 },
          onMode: () => undefined,
        }}
      />
    </BookingColumn>
  ),
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: () => (
    <SecondBrand>
      <StylistScreen {...nb} />
    </SecondBrand>
  ),
};
