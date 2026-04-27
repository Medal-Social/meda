import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ShellDesktopPanelDock } from './shell-desktop-panel-dock.js';

const meta = {
  title: 'Shell/ShellDesktopPanelDock',
  component: ShellDesktopPanelDock,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div
        style={{
          position: 'relative',
          height: 480,
          width: 720,
          background: 'var(--background, #111)',
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ShellDesktopPanelDock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  render: (args) => {
    const [width, setWidth] = useState(args.width);
    return <ShellDesktopPanelDock {...args} width={width} onWidthChange={setWidth} />;
  },
  args: {
    defaultView: 'details',
    panelOpen: true,
    width: 360,
    onWidthChange: () => {},
    renderPanel: ({ className }) => (
      <div className={className} style={{ height: '100%', padding: 16 }}>
        Panel content
      </div>
    ),
  },
};

export const Closed: Story = {
  ...Open,
  args: { ...Open.args, panelOpen: false },
};
