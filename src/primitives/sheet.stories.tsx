import type { Meta, StoryObj } from '@storybook/react-vite';
import { X } from 'lucide-react';
import { Button } from './button.js';
import { Field } from './field.js';
import { Input } from './input.js';
import { Sheet } from './sheet.js';

const meta = {
  title: 'Foundations/Primitives/Sheet',
  component: Sheet,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

function AddPersonSheet({ defaultOpen = false }: { defaultOpen?: boolean }) {
  return (
    <Sheet defaultOpen={defaultOpen}>
      <Sheet.Trigger render={<Button variant="outline" />}>Add a person</Sheet.Trigger>
      <Sheet.Content>
        <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
          <Sheet.Title className="pe-10 text-2xl font-bold">Add a person</Sheet.Title>
          <Sheet.Description>Only for this booking.</Sheet.Description>
          <Field>
            <Field.Label htmlFor="story-sheet-name">Name</Field.Label>
            <Input id="story-sheet-name" autoComplete="off" />
          </Field>
          <Button type="submit" size="lg" className="w-full">
            Add
          </Button>
        </form>
        <Sheet.Close
          render={<Button variant="ghost" size="sm" className="absolute top-4 right-4" />}
        >
          <X aria-hidden="true" />
          <span className="sr-only">Close</span>
        </Sheet.Close>
      </Sheet.Content>
    </Sheet>
  );
}

export const Default: Story = {
  render: () => <AddPersonSheet />,
};

export const Open: Story = {
  render: () => <AddPersonSheet defaultOpen />,
};
