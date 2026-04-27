import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SHELL_TABS } from '../__stories__/fixtures.js';
import { ShellTabBar } from './shell-tab-bar.js';

const meta = {
  title: 'Shell/ShellTabBar',
  component: ShellTabBar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ width: 720 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShellTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { tabs: SHELL_TABS, activeTab: 'all' } };
export const Empty: Story = { args: { tabs: [] } };
export const Interactive: Story = {
  render: (args) => {
    const [active, setActive] = useState(args.activeTab ?? args.tabs[0]?.id);
    return <ShellTabBar {...args} activeTab={active} onTabChange={setActive} />;
  },
  args: { tabs: SHELL_TABS, activeTab: 'all' },
};
