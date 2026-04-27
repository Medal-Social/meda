import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, FlaskConical, Inbox, MessageSquare, Settings, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppShell, AppShellBody } from './app-shell.js';
import { ShellHeader } from './shell-header.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const WORKSPACE: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={20} aria-hidden="true" />,
};

const WORKSPACE_2: WorkspaceDefinition = {
  id: 'ws-beta',
  name: 'Beta Workspace',
  icon: <Zap size={20} aria-hidden="true" />,
};

const WORKSPACE_3: WorkspaceDefinition = {
  id: 'ws-gamma',
  name: 'Gamma Labs',
  icon: <FlaskConical size={20} aria-hidden="true" />,
};

const APPS: AppDefinition[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ---------------------------------------------------------------------------
// Memory-backed storage adapter — avoids localStorage bleed between stories
// ---------------------------------------------------------------------------

function memoryStorage() {
  const store = new Map<string, unknown>();
  return {
    load: (key: string) => store.get(key) ?? null,
    save: (key: string, value: unknown) => store.set(key, value),
  };
}

// ---------------------------------------------------------------------------
// Decorator factory
// ---------------------------------------------------------------------------

function withProvider(
  workspace: WorkspaceDefinition,
  workspaces: WorkspaceDefinition[],
  apps: AppDefinition[],
  Story: () => ReactNode
) {
  return (
    <MedaShellProvider
      workspace={workspace}
      workspaces={workspaces}
      apps={apps}
      storage={memoryStorage()}
      themeAdapter="default"
    >
      <Story />
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Bare layout container — proves the 100vh shell with a placeholder body works.
 */
export const Default: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, [WORKSPACE], APPS, Story)],
  render: () => (
    <AppShell>
      <AppShellBody>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          AppShell body content
        </div>
      </AppShellBody>
    </AppShell>
  ),
};

/**
 * Same as Default but with Storybook's dark-theme decorator active.
 * Toggle via the toolbar or select this story to verify dark tokens render.
 */
export const WithDarkBackground: Story = {
  parameters: {
    themes: { themeOverride: 'dark' },
  },
  decorators: [(Story) => withProvider(WORKSPACE, [WORKSPACE], APPS, Story)],
  render: () => (
    <AppShell>
      <AppShellBody>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          AppShell body content — dark theme
        </div>
      </AppShellBody>
    </AppShell>
  ),
};

/**
 * Full combined view: ShellHeader inside AppShell above AppShellBody.
 * This is the closest representation of what a real app shell looks like.
 */
export const Combined: Story = {
  decorators: [
    (Story) => withProvider(WORKSPACE, [WORKSPACE, WORKSPACE_2, WORKSPACE_3], APPS, Story),
  ],
  render: () => (
    <AppShell>
      <ShellHeader
        globalActions={
          <button
            type="button"
            className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
          >
            + New
          </button>
        }
      />
      <AppShellBody>
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Main workspace content area
        </div>
      </AppShellBody>
    </AppShell>
  ),
};
