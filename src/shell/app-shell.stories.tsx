import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Activity,
  Bell,
  Building2,
  Calendar,
  FileText,
  FlaskConical,
  HelpCircle,
  Inbox,
  Info,
  LogOut,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { AppShell, AppShellBody } from './app-shell.js';
import { CommandPalette, useCommands } from './command-palette.js';
import { ContextRail } from './context-rail.js';
import type { IconRailItem } from './icon-rail.js';
import { IconRail } from './icon-rail.js';
import { MobileBottomNav } from './mobile/mobile-bottom-nav.js';
import { MobileDrawers } from './mobile/mobile-drawers.js';
import { MobileHeader } from './mobile/mobile-header.js';
import { RightPanel } from './right-panel.js';
import { ShellHeader } from './shell-header.js';
import { ShellMain } from './shell-main.js';
import { MedaShellProvider } from './shell-provider.js';
import type {
  AppDefinition,
  ContextItem,
  ContextModule,
  PanelView,
  WorkspaceDefinition,
} from './types.js';

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

const PANEL_VIEWS: PanelView[] = [
  {
    id: 'inspector',
    label: 'Inspector',
    icon: Info,
    render: () => (
      <div className="p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Inspector</p>
        <p>Select an item to inspect its properties.</p>
      </div>
    ),
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    render: () => (
      <div className="p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Activity</p>
        <p>Recent activity across this workspace.</p>
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Memory-backed storage adapter — avoids localStorage bleed between stories
// ---------------------------------------------------------------------------

function memoryStorage(panelMode: 'closed' | 'panel' | 'expanded' | 'fullscreen' = 'closed') {
  const store = new Map<string, unknown>([
    [
      'meda:shell:ws-acme:inbox',
      {
        contextRail: { width: 300, collapsed: false },
        rightPanel: { mode: panelMode, activeView: 'inspector', width: 340 },
      },
    ],
  ]);
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
  Story: () => ReactNode,
  panelMode: 'closed' | 'panel' | 'expanded' | 'fullscreen' = 'closed'
) {
  return (
    <MedaShellProvider
      workspace={workspace}
      workspaces={workspaces}
      apps={apps}
      storage={memoryStorage(panelMode)}
      themeAdapter="default"
    >
      <Story />
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// DemoCommands — registers demo commands inside <CommandPalette>
// ---------------------------------------------------------------------------

function DemoCommands() {
  useCommands([
    {
      id: 'nav-inbox',
      label: 'Go to Inbox',
      icon: Inbox,
      group: 'Navigation',
      run: async () => alert('Navigate to Inbox'),
    },
    {
      id: 'action-new-email',
      label: 'New email',
      icon: Plus,
      group: 'Actions',
      shortcut: 'C',
      run: async () => alert('New email'),
    },
    {
      id: 'nav-settings',
      label: 'Settings',
      icon: Settings,
      group: 'Navigation',
      run: async () => alert('Navigate to Settings'),
    },
    {
      id: 'account-sign-out',
      label: 'Sign out',
      icon: LogOut,
      group: 'Account',
      run: async () => alert('Sign out'),
    },
  ]);
  return null;
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
 * Full combined desktop layout: ShellHeader + IconRail + ContextRail + ShellMain + RightPanel.
 * Wrapped in <CommandPalette> — press ⌘K to open the palette with demo commands.
 * This is the canonical representation of the complete Meda shell at RC.1.
 * Hover rail icons for tooltips. Drag the ContextRail right edge to resize it.
 * Use the panel header controls to cycle modes or close the panel.
 */
export const Combined: Story = {
  decorators: [
    (Story) => withProvider(WORKSPACE, [WORKSPACE, WORKSPACE_2, WORKSPACE_3], APPS, Story, 'panel'),
  ],
  render: () => (
    <CommandPalette>
      <DemoCommands />
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
          <IconRail
            mainItems={RAIL_MAIN_ITEMS}
            utilityItems={RAIL_UTILITY_ITEMS}
            activeId="inbox"
          />
          <ContextRail appId="inbox" module={INBOX_MODULE} activeItemId="inbox" />
          <ShellMain layout="workspace">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Inbox</h1>
            <p className="text-muted-foreground">
              Main content area — rendered inside ShellMain with workspace layout (max-w-[1280px],
              responsive padding). Press ⌘K to open the command palette.
            </p>
          </ShellMain>
          <RightPanel panelViews={PANEL_VIEWS} defaultView="inspector" />
        </AppShellBody>
      </AppShell>
    </CommandPalette>
  ),
};

/**
 * Mobile combined layout — demonstrates the Phase 13 auto-hide wiring.
 *
 * On a mobile viewport:
 * - <ShellHeader>, <IconRail>, <ContextRail>, <RightPanel> all return null (auto-hidden).
 * - <MobileHeader> and <MobileBottomNav> render instead.
 * - <MobileDrawers> mounts the drawer slots (menu / module / panels / ai).
 *
 * Set the Storybook viewport to "Mobile" to see this in action.
 */
export const MobileCombined: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  decorators: [
    (Story) => withProvider(WORKSPACE, [WORKSPACE, WORKSPACE_2, WORKSPACE_3], APPS, Story, 'panel'),
  ],
  render: () => (
    <CommandPalette>
      <DemoCommands />
      <AppShell>
        {/* Desktop chrome — auto-hides on mobile */}
        <ShellHeader />
        {/* Mobile chrome — only visible on mobile */}
        <MobileHeader />
        <AppShellBody>
          {/* Desktop chrome — auto-hides on mobile */}
          <IconRail
            mainItems={RAIL_MAIN_ITEMS}
            utilityItems={RAIL_UTILITY_ITEMS}
            activeId="inbox"
          />
          <ContextRail appId="inbox" module={INBOX_MODULE} activeItemId="inbox" />
          <ShellMain layout="workspace">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Mobile main content</h1>
            <p className="text-muted-foreground">
              On mobile: only MobileHeader + MobileBottomNav are visible. Desktop chrome
              (ShellHeader, IconRail, ContextRail, RightPanel) auto-hides via useShellViewport().
            </p>
          </ShellMain>
          {/* Desktop chrome — auto-hides on mobile */}
          <RightPanel panelViews={PANEL_VIEWS} defaultView="inspector" />
        </AppShellBody>
        {/* Mobile chrome — only visible on mobile */}
        <MobileBottomNav />
        <MobileDrawers menuItems={RAIL_MAIN_ITEMS} module={INBOX_MODULE} panelViews={PANEL_VIEWS} />
      </AppShell>
    </CommandPalette>
  ),
};
