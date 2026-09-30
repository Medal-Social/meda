import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEMO_NOW, demoFormatEn, demoFormatNb, demoResources } from '../__stories__/fixtures.js';
import { familyEditorLabelsEn, familyEditorLabelsNb } from '../__stories__/labels.portal-forms.js';
import {
  BookingColumn,
  bookingStoryParameters,
  SecondBrand,
} from '../__stories__/story-helpers.js';
import type { PortalFamilyMemberDto } from '../types.js';
import { FamilyEditor, type PersonSaveResult } from './family-editor.js';

const family: PortalFamilyMemberDto[] = [
  {
    personId: 'p-ola',
    name: 'Ola',
    birthYear: 2018,
    birthMonth: 4,
    notes: 'Liker å se på film',
    preferredResourceId: 'res-ada',
  },
  {
    personId: 'p-nora',
    name: 'Nora',
    birthYear: 2021,
    birthMonth: null,
    notes: null,
    preferredResourceId: null,
  },
];

const stylists = demoResources.map((resource) => ({
  id: resource.id,
  name: demoFormatNb.stylistName(resource.name),
}));

const saved = async (): Promise<PersonSaveResult> => ({
  ok: true,
  family,
  personId: null,
  fallback: false,
});

const meta = {
  title: 'Booking/FamilyEditor',
  component: FamilyEditor,
  parameters: bookingStoryParameters,
  decorators: [
    (Story) => (
      <BookingColumn>
        <Story />
      </BookingColumn>
    ),
  ],
  args: {
    labels: familyEditorLabelsNb,
    format: demoFormatNb,
    family,
    now: DEMO_NOW,
    personDetails: true,
    stylists,
    agePrompt: { dismissed: [] },
    onSavePerson: saved,
    onRemovePerson: saved,
  },
} satisfies Meta<typeof FamilyEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  args: {
    labels: familyEditorLabelsEn,
    format: demoFormatEn,
    agePrompt: undefined,
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <FamilyEditor {...args} />
    </SecondBrand>
  ),
};
