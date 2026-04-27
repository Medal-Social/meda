import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShellScrollableContent } from './shell-scrollable-content.js';

const meta = {
  title: 'Shell/ShellScrollableContent',
  component: ShellScrollableContent,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', height: 480, width: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShellScrollableContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const filler = (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    {Array.from({ length: 20 }).map((_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: deterministic story filler
      <div key={i} style={{ height: 60, background: 'var(--card, #222)', borderRadius: 8 }}>
        Row {i + 1}
      </div>
    ))}
  </div>
);

export const Workspace: Story = { args: { layout: 'workspace', children: filler } };
export const Centered: Story = { args: { layout: 'centered', children: filler } };
export const Fullbleed: Story = {
  args: { layout: 'fullbleed', children: filler, maxWidth: 1200 },
};
