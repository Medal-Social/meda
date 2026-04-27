import type { Meta, StoryObj } from '@storybook/react-vite';
import { SHELL_RAIL_MAIN, SHELL_RAIL_UTIL } from '../__stories__/fixtures.js';
import { ShellAppRail } from './shell-app-rail.js';

const meta = {
  title: 'Shell/ShellAppRail',
  component: ShellAppRail,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 600, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShellAppRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mainItems: SHELL_RAIL_MAIN,
    utilityItems: SHELL_RAIL_UTIL,
    isItemActive: (item) => item.to === '/home',
    renderLink: ({ children, className, item }) => (
      <a key={item.to} href={item.to} className={className}>
        {children}
      </a>
    ),
  },
};
