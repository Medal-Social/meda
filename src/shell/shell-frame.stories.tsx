import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellFrame } from './shell-frame.js';

const meta = {
  title: 'Shell/ShellFrame',
  component: ShellFrame,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShellFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

const Block = ({ label, color, height }: { label: string; color: string; height?: number }) => (
  <div style={{ padding: 12, background: color, height }}>{label}</div>
);

export const Default: Story = {
  args: {
    header: <Block label="Header" color="var(--header, #1f1f1f)" />,
    navigation: <Block label="Nav" color="var(--app-rail, #181818)" />,
    content: <Block label="Content" color="var(--background, #0e0e0e)" height={600} />,
  },
};
