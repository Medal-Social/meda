import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  BookOpen,
  Building2,
  Calendar,
  FileText,
  HelpCircle,
  Inbox,
  Mail,
  Send,
  Settings,
  Star,
  Tag,
  Trash2,
  Users,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { ContextRail } from './context-rail.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, ContextItem, ContextModule, WorkspaceDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const WORKSPACE: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={20} aria-hidden="true" />,
};

const APPS: AppDefinition[] = [{ id: 'mail', label: 'Mail', icon: Mail }];

function memoryStorage() {
  const store = new Map<string, unknown>();
  return {
    load: (key: string) => store.get(key) ?? null,
    save: (key: string, value: unknown) => store.set(key, value),
  };
}

const MAIL_ITEMS: ContextItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/mail/inbox', shortcut: '⌘1' },
  { id: 'sent', label: 'Sent', icon: Send, to: '/mail/sent', shortcut: '⌘2' },
  { id: 'drafts', label: 'Drafts', icon: FileText, to: '/mail/drafts' },
  { id: 'starred', label: 'Starred', icon: Star, to: '/mail/starred' },
];

const MAIL_MODULE: ContextModule = {
  id: 'mail',
  label: 'Mail',
  description: 'Inbox + sent',
  items: MAIL_ITEMS,
};

const LONG_ITEMS: ContextItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/mail/inbox' },
  { id: 'sent', label: 'Sent', icon: Send, to: '/mail/sent' },
  { id: 'drafts', label: 'Drafts', icon: FileText, to: '/mail/drafts' },
  { id: 'starred', label: 'Starred', icon: Star, to: '/mail/starred' },
  { id: 'archive', label: 'Archive', icon: BookOpen, to: '/mail/archive' },
  { id: 'trash', label: 'Trash', icon: Trash2, to: '/mail/trash' },
  { id: 'tags', label: 'Tags', icon: Tag, to: '/mail/tags' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, to: '/mail/calendar' },
  { id: 'contacts', label: 'Contacts', icon: Users, to: '/mail/contacts' },
  { id: 'notifications', label: 'Notifications', icon: Bell, to: '/mail/notifications' },
  { id: 'settings', label: 'Settings', icon: Settings, to: '/mail/settings' },
  { id: 'help', label: 'Help', icon: HelpCircle, to: '/mail/help' },
];

// ---------------------------------------------------------------------------
// Decorator factory
// ---------------------------------------------------------------------------

function withProvider(
  workspace: WorkspaceDefinition,
  apps: AppDefinition[],
  Story: () => ReactNode
) {
  return (
    <MedaShellProvider workspace={workspace} apps={apps} storage={memoryStorage()}>
      <div className="flex h-screen bg-background">
        <Story />
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Main content area
        </div>
      </div>
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/ContextRail',
  component: ContextRail,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    appId: 'mail',
    module: MAIL_MODULE,
  },
} satisfies Meta<typeof ContextRail>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default: Mail module with title, description, 4 items. Drag the right edge to resize.
 */
export const Default: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, APPS, Story)],
  render: () => <ContextRail appId="mail" module={MAIL_MODULE} />,
};

/**
 * DarkTheme: same as Default in dark mode.
 */
export const DarkTheme: Story = {
  parameters: {
    themes: { themeOverride: 'dark' },
  },
  decorators: [(Story) => withProvider(WORKSPACE, APPS, Story)],
  render: () => <ContextRail appId="mail" module={MAIL_MODULE} />,
};

/**
 * WithActiveItem: Inbox is highlighted with bg-primary/10 + text-primary.
 */
export const WithActiveItem: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, APPS, Story)],
  render: () => <ContextRail appId="mail" module={MAIL_MODULE} activeItemId="inbox" />,
};

/**
 * Hidden: hidden=true evaporates the rail. Nothing visible renders.
 */
export const Hidden: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, APPS, Story)],
  render: () => <ContextRail appId="mail" module={MAIL_MODULE} hidden />,
};

/**
 * EmptyItems: module with empty items array. Rail is hidden (aria-hidden placeholder).
 */
export const EmptyItems: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, APPS, Story)],
  render: () => <ContextRail appId="mail" module={{ id: 'mail', label: 'Mail', items: [] }} />,
};

/**
 * LongItemList: 12 items to show vertical scrolling and density.
 */
export const LongItemList: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, APPS, Story)],
  render: () => (
    <ContextRail
      appId="mail"
      module={{ id: 'mail', label: 'Mail', description: 'All folders', items: LONG_ITEMS }}
      activeItemId="inbox"
    />
  ),
};

/**
 * WithRenderLink: custom renderLink render-prop wraps items in router-compatible spans.
 */
export const WithRenderLink: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, APPS, Story)],
  render: () => (
    <ContextRail
      appId="mail"
      module={MAIL_MODULE}
      activeItemId="sent"
      renderLink={({ item, isActive, className, children }) => (
        <a
          key={item.id}
          href={item.to}
          data-active={isActive}
          className={className}
          title={`Custom link: ${item.label}`}
        >
          {children}
          {isActive && <Zap size={10} className="ml-auto text-primary" aria-hidden="true" />}
        </a>
      )}
    />
  ),
};
