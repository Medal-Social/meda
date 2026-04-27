import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationArea } from './navigation-area.js';

const meta = {
  title: 'Shell/NavigationArea',
  component: NavigationArea,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof NavigationArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ width: 240, padding: 16, background: 'var(--app-rail, #111)' }}>
        Navigation slot
      </div>
    ),
  },
};
