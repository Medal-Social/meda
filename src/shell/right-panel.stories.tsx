import type { Meta, StoryObj } from '@storybook/react-vite';
import { Activity, Building2, Info, StickyNote } from 'lucide-react';
import type { ReactNode } from 'react';
import { RightPanel } from './right-panel.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, PanelMode, PanelView, WorkspaceDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const WORKSPACE: WorkspaceDefinition = {
  id: 'ws-story',
  name: 'Story Workspace',
  icon: <Building2 size={20} aria-hidden="true" />,
};

const APPS: AppDefinition[] = [{ id: 'app-a', label: 'App A', icon: Activity }];

function memoryStorage(initialMode: PanelMode = 'panel', activeView: string | null = null) {
  const store = new Map<string, unknown>([
    [
      `meda:shell:${WORKSPACE.id}:app-a`,
      {
        contextRail: { width: 300, collapsed: false },
        rightPanel: { mode: initialMode, activeView, width: 340 },
      },
    ],
  ]);
  return {
    load: (key: string) => store.get(key) ?? null,
    save: (key: string, value: unknown) => store.set(key, value),
  };
}

// ---------------------------------------------------------------------------
// Panel views used by multi-view stories
// ---------------------------------------------------------------------------

function placeholder(label: string): () => ReactNode {
  return () => (
    <div className="p-4 text-sm text-muted-foreground">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p>Content for the {label.toLowerCase()} panel view goes here.</p>
    </div>
  );
}

const SINGLE_VIEW: PanelView[] = [
  { id: 'inspector', label: 'Inspector', icon: Info, render: placeholder('Inspector') },
];

const MULTI_VIEWS: PanelView[] = [
  { id: 'inspector', label: 'Inspector', icon: Info, render: placeholder('Inspector') },
  { id: 'activity', label: 'Activity', icon: Activity, render: placeholder('Activity') },
  { id: 'notes', label: 'Notes', icon: StickyNote, render: placeholder('Notes') },
];

// ---------------------------------------------------------------------------
// Provider decorator factory
// ---------------------------------------------------------------------------

function withProvider(mode: PanelMode, activeView: string | null = null) {
  return (Story: () => ReactNode) => (
    <MedaShellProvider
      workspace={WORKSPACE}
      apps={APPS}
      storage={memoryStorage(mode, activeView)}
      themeAdapter="default"
    >
      <div
        style={{
          display: 'flex',
          height: '600px',
          background: 'var(--color-shell-panel, #f4f4f5)',
        }}
      >
        <div className="flex-1 p-6 text-muted-foreground text-sm">Main content area</div>
        <Story />
      </div>
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/RightPanel',
  component: RightPanel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof RightPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/** Panel closed — width 0, invisible to users. */
export const Closed: Story = {
  decorators: [(Story) => withProvider('closed')(Story)],
  render: () => <RightPanel panelViews={SINGLE_VIEW} />,
};

/** Default panel mode — 340px width, resizable to [300, 520]. */
export const Panel: Story = {
  decorators: [(Story) => withProvider('panel', 'inspector')(Story)],
  render: () => <RightPanel panelViews={SINGLE_VIEW} defaultView="inspector" />,
};

/** Expanded mode — ~60vw, suitable for rich side-by-side layouts. */
export const Expanded: Story = {
  decorators: [(Story) => withProvider('expanded', 'inspector')(Story)],
  render: () => <RightPanel panelViews={SINGLE_VIEW} defaultView="inspector" />,
};

/** Fullscreen mode — 100vw/100vh takeover, covers header + rails. */
export const Fullscreen: Story = {
  decorators: [(Story) => withProvider('fullscreen', 'inspector')(Story)],
  render: () => <RightPanel panelViews={SINGLE_VIEW} defaultView="inspector" />,
};

/** Three panel views; tabs appear in the panel header. */
export const WithMultipleViews: Story = {
  decorators: [(Story) => withProvider('panel', 'inspector')(Story)],
  render: () => <RightPanel panelViews={MULTI_VIEWS} defaultView="inspector" />,
};

/**
 * Panel-only consumer: cycle button is hidden.
 * Use `modes={['panel']}` for embedding in constrained layouts (CRM, etc.)
 */
export const PanelOnly: Story = {
  decorators: [(Story) => withProvider('panel', 'inspector')(Story)],
  render: () => <RightPanel panelViews={SINGLE_VIEW} defaultView="inspector" modes={['panel']} />,
};
