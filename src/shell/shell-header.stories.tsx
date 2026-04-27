import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ShellHeaderFrame, ShellPanelToggle } from './shell-header.js';

const meta = {
  title: 'Shell/ShellHeader',
  component: ShellHeaderFrame,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShellHeaderFrame>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    left: <strong style={{ paddingLeft: 12 }}>Meda</strong>,
    center: <span style={{ opacity: 0.7 }}>Inbox</span>,
    right: <button type="button">Action</button>,
  },
};

export const PanelToggle: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <ShellHeaderFrame
        left={<strong style={{ paddingLeft: 12 }}>Meda</strong>}
        right={<ShellPanelToggle panelOpen={open} onToggle={() => setOpen((o) => !o)} />}
      />
    );
  },
};
