import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResizableHandle, ResizableShell, ResizableShellPanel } from './resizable-shell.js';

const meta = {
  title: 'AppShell/Internals/ResizableShell',
  component: ResizableShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    a11y: {
      // react-resizable-panels wraps each panel in a scrollable div; the rule
      // wants tabindex=0 on it but the panel content here is short enough to
      // not actually scroll. Safe to disable for this primitive demo.
      config: { rules: [{ id: 'scrollable-region-focusable', enabled: false }] },
    },
  },
  // Stories below use `render` instead of args; meta-level args satisfy the
  // StoryObj<typeof meta> type requirement that `children` be present.
  args: { children: null },
} satisfies Meta<typeof ResizableShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ResizableShell orientation="horizontal" className="h-screen">
      <ResizableShellPanel defaultSize={20}>
        <div className="flex h-full items-center justify-center p-3 text-sm">Sidebar</div>
      </ResizableShellPanel>
      <ResizableHandle />
      <ResizableShellPanel>
        <div className="flex h-full items-center justify-center p-3 text-sm">Main</div>
      </ResizableShellPanel>
    </ResizableShell>
  ),
};
