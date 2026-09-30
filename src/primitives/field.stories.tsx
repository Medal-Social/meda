import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from './checkbox.js';
import { Field } from './field.js';
import { Input } from './input.js';
import { Textarea } from './textarea.js';

const meta = {
  title: 'Foundations/Primitives/Field',
  component: Field,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ContactDetails: Story = {
  render: () => (
    <form className="grid max-w-sm gap-4" onSubmit={(event) => event.preventDefault()}>
      <Field>
        <Field.Label htmlFor="story-field-name">Your name</Field.Label>
        <Input id="story-field-name" autoComplete="name" defaultValue="Kari Nordmann" />
      </Field>
      <Field>
        <Field.Label htmlFor="story-field-email">E-mail</Field.Label>
        <Input
          id="story-field-email"
          type="email"
          defaultValue="kari@"
          invalid
          aria-describedby="story-field-email-hint story-field-email-error"
        />
        <Field.Description id="story-field-email-hint">
          We send the confirmation here.
        </Field.Description>
        <Field.Error id="story-field-email-error">Enter a valid e-mail address.</Field.Error>
      </Field>
      <Field>
        <Field.Label htmlFor="story-field-note">Note (optional)</Field.Label>
        <Textarea id="story-field-note" rows={2} />
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="story-field-terms" />
        <Field.Label htmlFor="story-field-terms" className="cursor-pointer font-normal">
          I accept the booking terms
        </Field.Label>
      </Field>
    </form>
  ),
};

export const Fieldset: Story = {
  render: () => (
    <Field.Set className="max-w-sm">
      <Field.Legend>Who is the booking for?</Field.Legend>
      <Field orientation="horizontal">
        <Checkbox id="story-set-a" defaultChecked />
        <Field.Label htmlFor="story-set-a">Me</Field.Label>
      </Field>
      <Field orientation="horizontal">
        <Checkbox id="story-set-b" />
        <Field.Label htmlFor="story-set-b">A child</Field.Label>
      </Field>
    </Field.Set>
  ),
};
