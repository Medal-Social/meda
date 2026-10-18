import type { Meta, StoryObj } from '@storybook/react-vite';
import { ToggleGroup } from './toggle-group.js';

const meta = {
  title: 'Foundations/Primitives/ToggleGroup',
  component: ToggleGroup,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const SLOTS = ['09:00', '10:30', '12:00', '13:30', '15:00'];

export const SingleSelect: Story = {
  render: () => (
    <ToggleGroup aria-label="Start time" defaultValue="12:00">
      {SLOTS.map((slot) => (
        <ToggleGroup.Item key={slot} value={slot} disabled={slot === '10:30'}>
          {slot}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  ),
};

export const MultiSelect: Story = {
  render: () => (
    <ToggleGroup type="multiple" aria-label="Age groups" defaultValue={['3-5']}>
      <ToggleGroup.Item value="0-2">0–2 years</ToggleGroup.Item>
      <ToggleGroup.Item value="3-5">3–5 years</ToggleGroup.Item>
      <ToggleGroup.Item value="6-9">6–9 years</ToggleGroup.Item>
      <ToggleGroup.Item value="10+">10+ years</ToggleGroup.Item>
    </ToggleGroup>
  ),
};

export const SmallVertical: Story = {
  render: () => (
    <ToggleGroup aria-label="Duration" size="sm" orientation="vertical" className="max-w-40">
      <ToggleGroup.Item value="30">30 min</ToggleGroup.Item>
      <ToggleGroup.Item value="60">60 min</ToggleGroup.Item>
      <ToggleGroup.Item value="90">90 min</ToggleGroup.Item>
    </ToggleGroup>
  ),
};
