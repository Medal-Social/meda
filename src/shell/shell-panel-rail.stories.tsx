import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SHELL_PANELS } from '../__stories__/fixtures.js';
import { ShellPanelRail } from './shell-panel-rail.js';

const meta = {
  title: 'Shell/ShellPanelRail',
  component: ShellPanelRail,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: 480, display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShellPanelRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [active, setActive] = useState<string | null>('details');
    return (
      <ShellPanelRail
        {...args}
        activePanelView={active}
        onTogglePanelView={(id) => setActive((cur) => (cur === id ? null : id))}
      />
    );
  },
  args: {
    moduleViews: SHELL_PANELS,
    globalViews: [],
    activePanelView: 'details',
    onTogglePanelView: () => {},
  },
};
