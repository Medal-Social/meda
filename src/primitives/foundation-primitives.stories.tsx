import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangle, Inbox } from 'lucide-react';
import { EmptyState } from './empty-state.js';
import { FilterRail } from './filter-rail.js';
import { Skeleton } from './skeleton.js';

const meta = {
  title: 'Foundation/Primitives',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SkeletonStates: Story = {
  name: 'Skeleton',
  render: () => (
    <div className="grid max-w-4xl gap-6 md:grid-cols-3">
      <section className="space-y-3 rounded-md border border-border p-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </section>
      <section className="space-y-3 rounded-md border border-border p-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </section>
      <section className="space-y-2 rounded-md border border-border p-4">
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
    </div>
  ),
};

export const EmptyStates: Story = {
  name: 'EmptyState',
  render: () => (
    <div className="grid max-w-5xl gap-6 md:grid-cols-3">
      <div className="rounded-md border border-border">
        <EmptyState
          icon={Inbox}
          title="No messages"
          description="New conversations will appear here."
          action={
            <button
              type="button"
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Compose
            </button>
          }
        />
      </div>
      <div className="rounded-md border border-border">
        <EmptyState
          variant="panel"
          icon={AlertTriangle}
          title="Could not load"
          description="Refresh the panel and try again."
          action={
            <button type="button" className="rounded-md border border-border px-3 py-2 text-sm">
              Retry
            </button>
          }
        />
      </div>
      <div className="rounded-md border border-border">
        <EmptyState
          variant="inline"
          title="No filters selected"
          description="Choose filters to narrow the list."
        />
      </div>
    </div>
  ),
};

export const FilterRailStates: Story = {
  name: 'FilterRail',
  render: () => (
    <div className="h-[520px] max-w-80 overflow-hidden rounded-md border border-border">
      <FilterRail
        title="Filters"
        description="Refine the queue"
        search={
          <input
            type="search"
            aria-label="Search filters"
            placeholder="Search filters"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        }
        actions={
          <button type="button" className="text-xs font-medium text-muted-foreground">
            Reset
          </button>
        }
        footer={
          <button
            type="button"
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            Apply filters
          </button>
        }
      >
        <FilterRail.Group title="Status" description="Conversation state">
          {['Open', 'Waiting', 'Resolved'].map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" /> {label}
            </label>
          ))}
        </FilterRail.Group>
        <FilterRail.Group title="Priority">
          {['High', 'Medium', 'Low'].map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" /> {label}
            </label>
          ))}
        </FilterRail.Group>
      </FilterRail>
    </div>
  ),
};
