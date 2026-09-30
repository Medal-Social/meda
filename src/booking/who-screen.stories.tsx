import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { demoFormatEn, demoFormatNb } from './__stories__/fixtures.js';
import { whoScreenLabelsEn, whoScreenLabelsNb } from './__stories__/labels.steps.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import type { SaveResult, WizardPerson } from './types.js';
import { WhoScreen, type WhoScreenProps } from './who-screen.js';

const guest = (n: number): WizardPerson => ({ key: `guest:${n}` });
const GUEST_CHOICES: WhoScreenProps['guestChoices'] = [
  { key: 'one', people: [guest(1)] },
  { key: 'two', people: [guest(1), guest(2)] },
  { key: 'three', people: [guest(1), guest(2), guest(3)] },
  { key: 'adult', people: [{ key: 'adult', adult: true }] },
];

const FAMILY_NB: WhoScreenProps['family'] = [
  {
    person: { key: 'p:1', personId: '1', name: 'Nora', birthYear: 2019 },
    line: '6–7 år · Sist: Barneklipp, 12. aug.',
  },
  {
    person: { key: 'p:2', personId: '2', name: 'Oskar', birthYear: 2022, birthMonth: 4 },
    line: '4 år',
  },
];
const FAMILY_EN: WhoScreenProps['family'] = [
  {
    person: { key: 'p:1', personId: '1', name: 'Nora', birthYear: 2019 },
    line: '6–7 years · Last: Kids’ cut, 12 Aug',
  },
  {
    person: { key: 'p:2', personId: '2', name: 'Oscar', birthYear: 2022, birthMonth: 4 },
    line: '4 years',
  },
];

const isGuestSeat = (person: WizardPerson) =>
  person.key.startsWith('guest:') || person.key.startsWith('new:') || person.key === 'adult';

function Stateful(
  props: Omit<WhoScreenProps, 'people' | 'onChoose' | 'onAddChild'> & { initial?: WizardPerson[] }
) {
  const { initial = [], ...rest } = props;
  const [people, setPeople] = useState<WizardPerson[]>(initial);
  return (
    <WhoScreen
      {...rest}
      people={people}
      onChoose={(next) => setPeople(next)}
      onAddChild={async (): Promise<SaveResult> => ({ ok: true })}
    />
  );
}

const base = {
  labels: whoScreenLabelsNb,
  format: demoFormatNb,
  guestChoices: GUEST_CHOICES,
  maxPeople: 3,
  selfKey: 'self',
  isGuestSeat,
  currentYear: 2026,
} as const;

const meta: Meta<typeof WhoScreen> = {
  title: 'Booking/WhoScreen',
  component: WhoScreen,
  parameters: bookingStoryParameters,
};
export default meta;

type Story = StoryObj<typeof WhoScreen>;

/** A guest: one chip is the whole answer. */
export const Default: Story = {
  render: () => (
    <BookingColumn>
      <Stateful {...base} family={null} initial={[guest(1), guest(2)]} />
    </BookingColumn>
  ),
};

/** A logged-in parent, in English: tick up to three. */
export const LoggedIn: Story = {
  render: () => (
    <BookingColumn>
      <Stateful
        {...base}
        labels={whoScreenLabelsEn}
        format={demoFormatEn}
        family={FAMILY_EN}
        initial={[FAMILY_EN?.[0]?.person as WizardPerson]}
      />
    </BookingColumn>
  ),
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: () => (
    <SecondBrand>
      <Stateful {...base} family={FAMILY_NB} initial={[FAMILY_NB?.[1]?.person as WizardPerson]} />
    </SecondBrand>
  ),
};
