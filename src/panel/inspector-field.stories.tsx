import type { Meta, StoryObj } from '@storybook/react-vite';
import { InspectorField } from './inspector-field.js';

const meta = {
  title: 'Panel/InspectorField',
  component: InspectorField,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof InspectorField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: 'Voice', value: 'Rachel', hint: 'ElevenLabs' },
};

export const NoHint: Story = {
  args: { label: 'Model', value: 'claude-opus-4-7' },
};

export const RichValue: Story = {
  args: {
    label: 'Latency',
    value: <strong style={{ color: 'var(--primary)' }}>1.4s</strong>,
    hint: 'p95 over last hour',
  },
};
