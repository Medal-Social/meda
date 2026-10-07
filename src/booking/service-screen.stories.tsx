import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { DEMO_PHONE, demoFormatEn, demoFormatNb, demoServices } from './__stories__/fixtures.js';
import {
  demoCategoriesEn,
  demoCategoriesNb,
  serviceScreenLabelsEn,
  serviceScreenLabelsNb,
} from './__stories__/labels.steps.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { ServiceScreen, type ServiceScreenProps } from './service-screen.js';
import type { BookingServiceDto } from './types.js';

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

/**
 * The multi-select step's state, as a caller's machine would keep it: one
 * list per person, a tap toggles, the total sums every ticked service.
 */
function WithSelection({
  initial,
  ...props
}: Omit<ServiceScreenProps, 'selection'> & { initial: string[][] }) {
  const [lists, setLists] = useState(initial);
  const byId = new Map(props.services.map((service) => [service.id, service]));
  const ticked = lists.flat().flatMap((id) => byId.get(id) ?? []);
  function onToggle(personIndex: number, service: BookingServiceDto) {
    setLists((current) =>
      current.map((list, index) => {
        if (index !== personIndex) return list;
        return list.includes(service.id)
          ? list.filter((id) => id !== service.id)
          : [...list, service.id];
      })
    );
  }
  return (
    <ServiceScreen
      {...props}
      selection={{
        lists: lists.map((list) => list.map((id) => ({ id }))),
        onToggle,
        onContinue: () => undefined,
        total:
          ticked.length === 0
            ? null
            : {
                minutes: ticked.reduce((sum, service) => sum + service.durationMinutes, 0),
                priceOre: ticked.reduce((sum, service) => sum + service.priceOre, 0),
              },
        canContinue: lists.every((list) => list.length > 0),
      }}
    />
  );
}

/** One person with two services ticked as one visit: «Klipp» and «Farge og klipp». */
export const MultiSelect: Story = {
  name: 'Multi-select',
  render: () => (
    <BookingColumn>
      <WithSelection {...nb} initial={[['svc-cut', 'svc-colour']]} />
    </BookingColumn>
  ),
};

/** A family on the multi-select step: one tab per person, a tick on whoever is done. */
export const FamilyMultiSelect: Story = {
  name: 'Family multi-select',
  render: () => (
    <BookingColumn>
      <WithSelection
        {...nb}
        initial={[['svc-kids', 'svc-kids-wash'], [], []]}
        party={{
          people: [
            { key: 'p:theo', label: 'Theo · 7 år', name: 'Theo', adult: false },
            { key: 'p:emma', label: 'Emma · 5 år', name: 'Emma', adult: false },
            { key: 'self', label: 'Meg selv', adult: true },
          ],
          choices: [null, null, null],
          onPickFor: () => undefined,
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
