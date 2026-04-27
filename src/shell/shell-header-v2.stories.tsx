/**
 * Storybook stories for the v2 ShellHeader and its sub-components:
 *   WorkspaceSwitcher, AppTabs, PanelToggle.
 *
 * The legacy ShellHeaderFrame stories live in shell-header.stories.tsx under
 * 'Shell/ShellHeader'. These v2 stories use 'Shell v2/ShellHeader' to avoid a
 * title collision.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, FlaskConical, Inbox, MessageSquare, Settings, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { ShellHeader } from './shell-header.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const WORKSPACE_ACME: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={20} aria-hidden="true" />,
};

const WORKSPACE_BETA: WorkspaceDefinition = {
  id: 'ws-beta',
  name: 'Beta Workspace',
  icon: <Zap size={20} aria-hidden="true" />,
};

const WORKSPACE_GAMMA: WorkspaceDefinition = {
  id: 'ws-gamma',
  name: 'Gamma Labs',
  icon: <FlaskConical size={20} aria-hidden="true" />,
};

const APPS_3: AppDefinition[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// MedaShellProvider requires apps.length > 0 — use a single minimal app when
// the story focus is on workspace switching rather than app tabs.
const APPS_MINIMAL: AppDefinition[] = [{ id: 'home', label: 'Home', icon: Inbox }];

// ---------------------------------------------------------------------------
// Memory-backed storage adapter
// ---------------------------------------------------------------------------

function memoryStorage() {
  const store = new Map<string, unknown>();
  return {
    load: (key: string) => store.get(key) ?? null,
    save: (key: string, value: unknown) => store.set(key, value),
  };
}

// ---------------------------------------------------------------------------
// Decorator factory — wraps each story in the provider
// ---------------------------------------------------------------------------

function withShellProvider(
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
  title: 'Shell v2/ShellHeader',
  component: ShellHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShellHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default header: one workspace, three app tabs, no global actions.
 * Click the workspace name to open the dropdown menu.
 * Click an app tab to switch the active tab.
 * Click the panel toggle (right edge) to flip between open/closed icons.
 */
export const Default: Story = {
  decorators: [(Story) => withShellProvider(WORKSPACE_ACME, [WORKSPACE_ACME], APPS_3, Story)],
  render: () => <ShellHeader />,
};

/**
 * Header with a global action in the right-side slot.
 * Verifies the `globalActions` prop renders between AppTabs and PanelToggle.
 */
export const WithGlobalActions: Story = {
  decorators: [(Story) => withShellProvider(WORKSPACE_ACME, [WORKSPACE_ACME], APPS_3, Story)],
  render: (args) => (
    <ShellHeader
      {...args}
      globalActions={
        <button
          type="button"
          className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          + New
        </button>
      }
    />
  ),
};

/**
 * Three workspaces in the switcher.
 * Click the workspace name → the dropdown shows the full workspace list at the top.
 */
export const WithMultipleWorkspaces: Story = {
  decorators: [
    (Story) =>
      withShellProvider(
        WORKSPACE_ACME,
        [WORKSPACE_ACME, WORKSPACE_BETA, WORKSPACE_GAMMA],
        APPS_3,
        Story
      ),
  ],
  render: () => <ShellHeader />,
};

/**
 * Provider workspaces is empty (the switcher `workspaces` list is []).
 * Click the workspace name → the dropdown shows only Settings/Profile/Theme/Sign out
 * without a workspace section. Edge case: the active workspace itself still shows
 * in the trigger button.
 */
export const WithEmptyWorkspaces: Story = {
  decorators: [
    (Story) =>
      withShellProvider(
        WORKSPACE_ACME,
        [], // no workspaces list → switcher omits the workspace section
        APPS_MINIMAL,
        Story
      ),
  ],
  render: () => <ShellHeader />,
};

/**
 * Dark-theme variant. Toggle via Storybook's theme toolbar or select this story
 * directly to verify the dark token contract renders correctly.
 */
export const DarkTheme: Story = {
  parameters: {
    themes: { themeOverride: 'dark' },
  },
  decorators: [
    (Story) => withShellProvider(WORKSPACE_ACME, [WORKSPACE_ACME, WORKSPACE_BETA], APPS_3, Story),
  ],
  render: () => (
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
  ),
};
