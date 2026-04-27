import type { Meta, StoryObj } from '@storybook/react-vite';
import { Activity, Building2, FileText, Inbox, Menu, Send, Sparkles, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import type { IconRailItem } from '../icon-rail.js';
import { MedaShellProvider, useMedaShell } from '../shell-provider.js';
import type { AppDefinition, ContextModule, PanelView, WorkspaceDefinition } from '../types.js';
import { MobileDrawers } from './mobile-drawers.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const WORKSPACE: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={16} aria-hidden="true" />,
};

const APPS: AppDefinition[] = [{ id: 'inbox', label: 'Inbox', icon: Menu }];

const MENU_ITEMS: IconRailItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' },
  { id: 'files', label: 'Files', icon: FileText, to: '/files' },
  { id: 'activity', label: 'Activity', icon: Activity, to: '/activity' },
];

const INBOX_MODULE: ContextModule = {
  id: 'inbox',
  label: 'Inbox',
  description: 'Mail and drafts',
  items: [
    { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' },
    { id: 'sent', label: 'Sent', icon: Send, to: '/sent' },
    { id: 'drafts', label: 'Drafts', icon: FileText, to: '/drafts' },
  ],
};

const PANEL_VIEWS: PanelView[] = [
  {
    id: 'inspector',
    label: 'Inspector',
    icon: Inbox,
    render: () => (
      <div className="p-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Inspector</p>
        <p>Select an item to inspect its properties.</p>
      </div>
    ),
  },
  {
    id: 'starred',
    label: 'Starred',
    icon: Star,
    render: () => (
      <div className="p-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Starred</p>
        <p>Your starred items appear here.</p>
      </div>
    ),
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Sparkles,
    render: () => (
      <div className="p-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">AI Assistant</p>
        <p>Ask anything about your workspace.</p>
      </div>
    ),
  },
];

// ---------------------------------------------------------------------------
// Helper to pre-open a specific drawer
// ---------------------------------------------------------------------------

function DrawerOpener({ kind, children }: { kind: string; children: ReactNode }) {
  const ctx = useMedaShell();
  // Open on mount via button click simulation — deferred to avoid render-time setState
  return (
    <div className="p-4">
      <button
        type="button"
        className="mb-4 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground"
        onClick={() => ctx.mobileDrawer.setOpen(kind)}
      >
        Open {kind}
      </button>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/Mobile/MobileDrawers',
  component: MobileDrawers,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
} satisfies Meta<typeof MobileDrawers>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * MenuDrawer — left sheet listing icon-rail items.
 * Click "Open menu-drawer" to trigger.
 */
export const MenuOpen: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS}>
        <DrawerOpener kind="menu-drawer">
          <Story />
        </DrawerOpener>
      </MedaShellProvider>
    ),
  ],
  args: { menuItems: MENU_ITEMS },
};

/**
 * ModuleDrawer — left sheet listing current app's context-rail items.
 */
export const ModuleOpen: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS}>
        <DrawerOpener kind="module-drawer">
          <Story />
        </DrawerOpener>
      </MedaShellProvider>
    ),
  ],
  args: { module: INBOX_MODULE },
};

/**
 * PanelsDrawer — bottom sheet with view tabs and active panel content.
 */
export const PanelsOpen: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS}>
        <DrawerOpener kind="panels-drawer">
          <Story />
        </DrawerOpener>
      </MedaShellProvider>
    ),
  ],
  args: { panelViews: PANEL_VIEWS },
};

/**
 * AiDrawer — bottom sheet pinned to the 'ai' panel view.
 */
export const AiOpen: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS}>
        <DrawerOpener kind="ai-drawer">
          <Story />
        </DrawerOpener>
      </MedaShellProvider>
    ),
  ],
  args: { panelViews: PANEL_VIEWS },
};
