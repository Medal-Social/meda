import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2 } from 'lucide-react';
import { ResizableHandle, ResizableShell, ResizableShellPanel } from './resizable-shell.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const WORKSPACE: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={20} aria-hidden="true" />,
};

const APPS: AppDefinition[] = [{ id: 'app-a', label: 'App A', icon: Building2 }];

function memoryStorage() {
  const store = new Map<string, unknown>();
  return {
    load: (key: string) => store.get(key) ?? null,
    save: (key: string, value: unknown) => store.set(key, value),
  };
}

function Panel({ label, dim }: { label: string; dim?: boolean }) {
  return (
    <div
      className={[
        'flex h-full items-center justify-center text-sm',
        dim ? 'bg-muted text-muted-foreground' : 'bg-background text-foreground',
      ].join(' ')}
    >
      {label}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/ResizableShell',
  component: ResizableShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ResizableShell>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default: two equal horizontal panels with a resize handle between them.
 * Drag the handle to resize. Both panels are 50% by default.
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS} storage={memoryStorage()}>
        <div className="h-screen bg-background">
          <Story />
        </div>
      </MedaShellProvider>
    ),
  ],
  render: () => (
    <ResizableShell>
      <ResizableShellPanel defaultSize={50} id="left">
        <Panel label="Left Panel" />
      </ResizableShellPanel>
      <ResizableHandle />
      <ResizableShellPanel defaultSize={50} id="right">
        <Panel label="Right Panel" dim />
      </ResizableShellPanel>
    </ResizableShell>
  ),
};

/**
 * WithMinMax: left panel is constrained to min 20% / max 60%.
 * Drag the handle — the left panel will not shrink below 20% or grow above 60%.
 */
export const WithMinMax: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS} storage={memoryStorage()}>
        <div className="h-screen bg-background">
          <Story />
        </div>
      </MedaShellProvider>
    ),
  ],
  render: () => (
    <ResizableShell>
      <ResizableShellPanel defaultSize={30} minSize={20} maxSize={60} id="left-constrained">
        <Panel label="Left (20–60%)" />
      </ResizableShellPanel>
      <ResizableHandle withHandle />
      <ResizableShellPanel defaultSize={70} id="right-free">
        <Panel label="Right (free)" dim />
      </ResizableShellPanel>
    </ResizableShell>
  ),
};

/**
 * Vertical: two panels stacked vertically.
 * Drag the handle to resize top/bottom sections.
 */
export const Vertical: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS} storage={memoryStorage()}>
        <div className="h-screen bg-background">
          <Story />
        </div>
      </MedaShellProvider>
    ),
  ],
  render: () => (
    <ResizableShell orientation="vertical">
      <ResizableShellPanel defaultSize={40} id="top">
        <Panel label="Top Panel" />
      </ResizableShellPanel>
      <ResizableHandle />
      <ResizableShellPanel defaultSize={60} id="bottom">
        <Panel label="Bottom Panel" dim />
      </ResizableShellPanel>
    </ResizableShell>
  ),
};

/**
 * ThreePanels: three panels with two handles.
 */
export const ThreePanels: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS} storage={memoryStorage()}>
        <div className="h-screen bg-background">
          <Story />
        </div>
      </MedaShellProvider>
    ),
  ],
  render: () => (
    <ResizableShell>
      <ResizableShellPanel defaultSize={25} minSize={15} id="sidebar">
        <Panel label="Sidebar" />
      </ResizableShellPanel>
      <ResizableHandle />
      <ResizableShellPanel defaultSize={50} id="main">
        <Panel label="Main" dim />
      </ResizableShellPanel>
      <ResizableHandle withHandle />
      <ResizableShellPanel defaultSize={25} minSize={15} id="detail">
        <Panel label="Detail" />
      </ResizableShellPanel>
    </ResizableShell>
  ),
};
