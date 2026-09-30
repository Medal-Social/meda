import type { Meta, StoryObj } from '@storybook/react-vite';
import { bookingSkeletonLabelsEn, bookingSkeletonLabelsNb } from './__stories__/labels.time.js';
import { bookingStoryParameters, SecondBrand } from './__stories__/story-helpers.js';
import { BookingSkeleton } from './booking-skeleton.js';

const meta: Meta<typeof BookingSkeleton> = {
  title: 'Booking/BookingSkeleton',
  component: BookingSkeleton,
  parameters: bookingStoryParameters,
  args: { labels: bookingSkeletonLabelsNb },
  // The skeleton is `fixed` over the page; a transformed frame gives it a
  // containing block so the story shows it in place.
  render: (args) => (
    <div className="relative h-[560px] overflow-hidden" style={{ transform: 'translateZ(0)' }}>
      <BookingSkeleton {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof BookingSkeleton>;

export const Default: Story = {};

export const English: Story = { args: { labels: bookingSkeletonLabelsEn } };

export const SecondBrandTheme: Story = {
  name: 'Second brand',
  render: (args) => (
    <SecondBrand>
      <div className="relative h-[560px] overflow-hidden" style={{ transform: 'translateZ(0)' }}>
        <BookingSkeleton {...args} />
      </div>
    </SecondBrand>
  ),
};
