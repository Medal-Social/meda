import type { Meta, StoryObj } from '@storybook/react-vite';
import { FilterRail } from './filter-rail.js';

const meta = {
  title: 'Foundations/Primitives/FilterRail',
  component: FilterRail,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof FilterRail>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
