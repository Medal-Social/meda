import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { demoFormatEn, demoFormatNb } from './__stories__/fixtures.js';
import { addChildSheetLabelsEn, addChildSheetLabelsNb } from './__stories__/labels.steps.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { AddChildSheet } from './add-child-sheet.js';
import type { SaveResult } from './types.js';

const save = async (): Promise<SaveResult> => ({ ok: true });

const meta: Meta<typeof AddChildSheet> = {
  title: 'Booking/AddChildSheet',
  component: AddChildSheet,
  parameters: bookingStoryParameters,
  args: {
    labels: addChildSheetLabelsNb,
    format: demoFormatNb,
    saveNotes: true,
    disabled: false,
    currentYear: 2026,
    onSave: save,
  },
  render: (args) => (
    <BookingColumn>
      <AddChildSheet {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof AddChildSheet>;

export const Default: Story = {};

/** Open, in English, for a guest (no note field). */
export const English: Story = {
  args: { labels: addChildSheetLabelsEn, format: demoFormatEn, saveNotes: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: addChildSheetLabelsEn['addChild.trigger'] })
    );
    const dialog = within(canvasElement.ownerDocument.body).getByRole('dialog');
    await expect(dialog).toHaveAttribute('open');
  },
};

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <AddChildSheet {...args} />
    </SecondBrand>
  ),
};
