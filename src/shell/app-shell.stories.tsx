import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  Building2,
  Calendar,
  FileText,
  FlaskConical,
  HelpCircle,
  Inbox,
  MessageSquare,
  Send,
  Settings,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { AppShell, AppShellBody } from './app-shell.js';
import { ContextRail } from './context-rail.js';
import type { IconRailItem } from './icon-rail.js';
import { IconRail } from './icon-rail.js';
import { ShellHeader } from './shell-header.js';
import { ShellMain } from './shell-main.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, ContextItem, ContextModule, WorkspaceDefinition } from './types.js';

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

const RAIL_MAIN_ITEMS: IconRailItem[] = [
  { id: 'inbox', label: 'Inbox', to: '/inbox', icon: Inbox },
  { id: 'calendar', label: 'Calendar', to: '/calendar', icon: Calendar },
  { id: 'users', label: 'People', to: '/people', icon: Users },
];

const RAIL_UTILITY_ITEMS: IconRailItem[] = [
  { id: 'bell', label: 'Notifications', to: '/notifications', icon: Bell },
  { id: 'help', label: 'Help', to: '/help', icon: HelpCircle },
];

const INBOX_ITEMS: ContextItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox', shortcut: '⌘1' },
  { id: 'sent', label: 'Sent', icon: Send, to: '/sent', shortcut: '⌘2' },
  { id: 'drafts', label: 'Drafts', icon: FileText, to: '/drafts' },
  { id: 'starred', label: 'Starred', icon: Star, to: '/starred' },
];

const INBOX_MODULE: ContextModule = {
  id: 'inbox',
  label: 'Inbox',
  description: 'Mail + drafts',
  items: INBOX_ITEMS,
};

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
 * Full combined view: ShellHeader + IconRail + ContextRail + main content area.
 * This is the closest representation of what a real app shell looks like.
 * Hover the rail icons to see tooltips. Click the chevron divider to reposition
 * utility items. Drag the ContextRail right edge to resize it.
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
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
          >
            + New
          </button>
        }
      />
      <AppShellBody>
        <IconRail mainItems={RAIL_MAIN_ITEMS} utilityItems={RAIL_UTILITY_ITEMS} activeId="inbox" />
        <ContextRail appId="inbox" module={INBOX_MODULE} activeItemId="inbox" />
        <ShellMain layout="workspace">
          <h1 className="text-2xl font-semibold text-foreground mb-2">Inbox</h1>
          <p className="text-muted-foreground">
            Main content area — rendered inside ShellMain with workspace layout (max-w-[1280px],
            responsive padding).
          </p>
        </ShellMain>
      </AppShellBody>
    </AppShell>
  ),
};
