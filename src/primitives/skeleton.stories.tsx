import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from './skeleton.js';

const meta = {
  title: 'Foundation/Primitives/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Text: Story = {
  render: () => (
    <section className="max-w-sm space-y-3 rounded-md border border-border p-4">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </section>
  ),
};

export const Media: Story = {
  render: () => (
    <section className="max-w-sm space-y-3 rounded-md border border-border p-4">
      <Skeleton className="aspect-video w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </section>
  ),
};

export const List: Story = {
  render: () => (
    <section className="max-w-sm space-y-2 rounded-md border border-border p-4">
      {['one', 'two', 'three'].map((item) => (
        <div key={item} className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </section>
  ),
};
