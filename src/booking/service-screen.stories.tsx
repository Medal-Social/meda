import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEMO_PHONE, demoFormatEn, demoFormatNb, demoServices } from './__stories__/fixtures.js';
import {
  demoCategoriesEn,
  demoCategoriesNb,
  serviceScreenLabelsEn,
  serviceScreenLabelsNb,
} from './__stories__/labels.steps.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { ServiceScreen, type ServiceScreenProps } from './service-screen.js';

const nb: ServiceScreenProps = {
  labels: serviceScreenLabelsNb,
  format: demoFormatNb,
  services: demoServices,
  categories: demoCategoriesNb,
  childCategory: 'kids',
  phone: DEMO_PHONE,
  onPick: () => undefined,
};

const meta: Meta<typeof ServiceScreen> = {
  title: 'Booking/ServiceScreen',
  component: ServiceScreen,
  parameters: bookingStoryParameters,
};
export default meta;

type Story = StoryObj<typeof ServiceScreen>;

/** One person, with «same as last time» and a service below the age divider. */
export const Default: Story = {
  render: () => (
    <BookingColumn>
      <ServiceScreen
        {...nb}
        suggestion={{ service: demoServices[0] as ServiceScreenProps['services'][number] }}
        chosenId="svc-kids"
        childName="Nora"
        serviceFits={(service) => service.ageMinYears === undefined || service.ageMinYears <= 7}
      />
    </BookingColumn>
  ),
};

/** A family of two, in English: each person answered on their own. */
export const Family: Story = {
  render: () => (
    <BookingColumn>
      <ServiceScreen
        {...nb}
        labels={serviceScreenLabelsEn}
        format={demoFormatEn}
        categories={demoCategoriesEn}
        party={{
          people: [
            { key: 'p:1', label: 'Nora · 7 years', name: 'Nora', adult: false },
            { key: 'self', label: 'Myself', adult: true },
          ],
          choices: [{ id: 'svc-kids' }, null],
          onPickFor: () => undefined,
          onRemove: () => undefined,
        }}
      />
    </BookingColumn>
  ),
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: () => (
    <SecondBrand>
      <ServiceScreen {...nb} />
    </SecondBrand>
  ),
};
