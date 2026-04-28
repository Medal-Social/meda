import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inspector } from './inspector.js';
import { InspectorField } from './inspector-field.js';
import { InspectorJSON } from './inspector-json.js';

const meta = {
  title: 'Studios/Inspector',
  component: Inspector,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 480, width: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Inspector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: [
      {
        id: 'overview',
        label: 'Overview',
        content: (
          <>
            <InspectorField label="Voice" value="Rachel" hint="ElevenLabs" />
            <InspectorField label="Model" value="claude-opus-4-7" />
            <InspectorField label="Latency p95" value="1.4s" />
          </>
        ),
      },
      {
        id: 'json',
        label: 'JSON',
        content: <InspectorJSON data={{ voice: 'Rachel', model: 'claude-opus-4-7' }} />,
      },
    ],
  },
};
