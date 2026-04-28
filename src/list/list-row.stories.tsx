import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListCell, ListRow } from './list-row.js';

const meta: Meta<typeof ListRow> = {
  title: 'List/ListRow',
  component: ListRow,
  parameters: { layout: 'padded' },
};
export default meta;

export const Default: StoryObj<typeof ListRow> = {
  render: () => (
    <div className="w-full">
      <ListRow>
        <ListCell className="w-8" />
        <ListCell>Wire Hub WS</ListCell>
        <ListCell className="text-muted-foreground">In review</ListCell>
        <ListCell className="text-muted-foreground">2 min ago</ListCell>
      </ListRow>
      <ListRow selected>
        <ListCell className="w-8" />
        <ListCell>Add adapters</ListCell>
        <ListCell className="text-muted-foreground">In progress</ListCell>
        <ListCell className="text-muted-foreground">just now</ListCell>
      </ListRow>
    </div>
  ),
};

export const Focused: StoryObj<typeof ListRow> = {
  render: () => (
    <div className="w-full">
      <ListRow focused>
        <ListCell>Keyboard-focused row</ListCell>
        <ListCell className="text-muted-foreground">Active</ListCell>
      </ListRow>
    </div>
  ),
};
