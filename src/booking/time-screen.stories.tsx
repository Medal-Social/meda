import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import {
  DEMO_NOW,
  DEMO_PHONE,
  demoDaypartsEn,
  demoDaypartsNb,
  demoDays,
  demoFormatEn,
  demoFormatNb,
  demoOpenDays,
  demoSlots,
} from './__stories__/fixtures.js';
import { timeLabelsEn, timeLabelsNb } from './__stories__/labels.time.js';
import { BookingColumn, bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { TimeScreen } from './time-screen.js';

/** «Barneklipp»: 390 kr, +10 % at the weekend. */
const weekendNote = (isWeekend: (ts: number) => boolean) => (dayTs: number) => ({
  pct: 10,
  priceOre: isWeekend(dayTs) ? 42_900 : 39_000,
});

const meta: Meta<typeof TimeScreen> = {
  title: 'Booking/TimeScreen',
  component: TimeScreen,
  parameters: bookingStoryParameters,
  args: {
    labels: timeLabelsNb,
    format: demoFormatNb,
    dayparts: demoDaypartsNb,
    slots: demoSlots(),
    days: demoDays(),
    openDays: demoOpenDays(),
    phone: DEMO_PHONE,
    monthView: true,
    now: DEMO_NOW,
    weekendNote: weekendNote(demoFormatNb.clock.isWeekend),
    onPick: () => undefined,
  },
  render: (args) => (
    <BookingColumn>
      <TimeScreen {...args} />
    </BookingColumn>
  ),
};
export default meta;

type Story = StoryObj<typeof TimeScreen>;

/**
 * The day strip and the time grid are native buttons: Tab reaches each chip
 * in order and Enter chooses it.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: timeLabelsNb['time.dayStrip.legend'] });
    const [first, second] = within(group).getAllByRole('button');
    first?.focus();
    await userEvent.tab();
    await expect(second).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await expect(second).toHaveFocus();
  },
};

/** English, with a slot just taken: the two nearest are ringed. */
export const English: Story = {
  args: {
    labels: timeLabelsEn,
    format: demoFormatEn,
    dayparts: demoDaypartsEn,
    slots: demoSlots(demoFormatEn.clock),
    days: demoDays(demoFormatEn.clock),
    openDays: demoOpenDays(demoFormatEn.clock),
    weekendNote: weekendNote(demoFormatEn.clock.isWeekend),
    takenSlotTs: (demoSlots(demoFormatEn.clock)[2]?.startTs ?? DEMO_NOW) + 15 * 60_000,
  },
};

/**
 * A second brand. Its mid-tone primary on the selected chip's 10 % primary
 * tint falls just under 4.5:1, so the story also shows the `classNames` rung:
 * the selected day chip's text is set to the foreground colour.
 */
export const SecondBrandTheme: Story = {
  name: 'Second brand',
  args: { classNames: { dayChipSelected: 'text-foreground' } },
  render: (args) => (
    <SecondBrand>
      <TimeScreen {...args} />
    </SecondBrand>
  ),
};
