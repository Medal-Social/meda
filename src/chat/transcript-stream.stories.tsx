import type { Meta, StoryObj } from '@storybook/react-vite';
import { SAMPLE_TURNS } from '../__stories__/fixtures.js';
import { TranscriptStream } from './transcript-stream.js';

const meta = {
  title: 'Chat/TranscriptStream',
  component: TranscriptStream,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 480, width: 720 }}>
        <Story />
      </div>
    ),
  ],
  args: { tz: 'UTC' },
} satisfies Meta<typeof TranscriptStream>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { turns: SAMPLE_TURNS } };
export const Empty: Story = { args: { turns: [] } };
export const SingleTurn: Story = { args: { turns: SAMPLE_TURNS.slice(0, 1) } };
