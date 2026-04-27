'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Building2,
  Inbox,
  LogOut,
  Menu,
  Plus,
  Send,
  Settings,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import {
  CommandPalette,
  type CommandPaletteProps,
  useCommandGroup,
  useCommands,
} from './command-palette.js';
import { MedaShellProvider, useMedaShell } from './shell-provider.js';
import type { CommandDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const WORKSPACE = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={16} aria-hidden="true" />,
};

const APPS = [{ id: 'inbox', label: 'Inbox', icon: Menu }];

const NAV_COMMANDS: CommandDefinition[] = [
  {
    id: 'nav-inbox',
    label: 'Go to Inbox',
    icon: Inbox,
    group: 'navigation',
    shortcut: '⌘I',
    run: () => {},
  },
  {
    id: 'nav-sent',
    label: 'Go to Sent',
    icon: Send,
    group: 'navigation',
    shortcut: '⌘S',
    run: () => {},
  },
  { id: 'nav-starred', label: 'Go to Starred', icon: Star, group: 'navigation', run: () => {} },
];

const ACTION_COMMANDS: CommandDefinition[] = [
  {
    id: 'act-new',
    label: 'New Message',
    icon: Plus,
    group: 'actions',
    shortcut: '⌘N',
    run: () => {},
  },
  { id: 'act-ai', label: 'Ask AI', icon: Sparkles, group: 'actions', run: () => {} },
];

const SETTINGS_COMMANDS: CommandDefinition[] = [
  { id: 'set-settings', label: 'Settings', icon: Settings, group: 'settings', run: () => {} },
  { id: 'set-logout', label: 'Sign out', icon: LogOut, group: 'settings', run: () => {} },
];

// ---------------------------------------------------------------------------
// Decorators / helpers
// ---------------------------------------------------------------------------

function PaletteOpener() {
  const ctx = useMedaShell();
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <button
        type="button"
        onClick={() => ctx.commandPalette.setOpen(true)}
        className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        Open palette
      </button>
      <p className="text-xs text-muted-foreground">or press ⌘K</p>
    </div>
  );
}

/** Registers the three command groups + commands via hooks */
function CommandRegistrar({ children }: { children?: ReactNode }) {
  useCommandGroup({ id: 'navigation', label: 'Navigation', priority: 100 });
  useCommandGroup({ id: 'actions', label: 'Actions', priority: 200 });
  useCommandGroup({ id: 'settings', label: 'Settings', priority: 300 });
  useCommands([...NAV_COMMANDS, ...ACTION_COMMANDS, ...SETTINGS_COMMANDS]);
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/CommandPalette',
  component: CommandPalette,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS}>
        <Story />
      </MedaShellProvider>
    ),
  ],
} satisfies Meta<CommandPaletteProps>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Palette is mounted but closed. Press ⌘K or click "Open palette" to trigger.
 */
export const Closed: Story = {
  render: () => (
    <CommandPalette>
      <PaletteOpener />
    </CommandPalette>
  ),
};

/**
 * Palette is open by default with no commands registered.
 * Shows the empty state: "No results."
 */
export const EmptyState: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS} commandPaletteHotkey="mod+k">
        <CommandPalette>
          <Story />
        </CommandPalette>
      </MedaShellProvider>
    ),
  ],
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useMedaShell();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      ctx.commandPalette.setOpen(true);
    }, [ctx.commandPalette]);
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <p className="text-xs text-muted-foreground">
          No commands registered — palette shows empty state
        </p>
      </div>
    );
  },
};

/**
 * Palette open with commands registered across three groups (Navigation,
 * Actions, Settings). Groups are ordered by priority.
 */
export const WithRegisteredCommands: Story = {
  render: () => (
    <CommandPalette>
      <CommandRegistrar>
        <PaletteOpener />
      </CommandRegistrar>
    </CommandPalette>
  ),
};

/**
 * Palette open — shows the full command list across all groups.
 * Useful for Chromatic visual review.
 */
export const Open: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS}>
        <CommandPalette>
          <CommandRegistrar />
          <Story />
        </CommandPalette>
      </MedaShellProvider>
    ),
  ],
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useMedaShell();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      ctx.commandPalette.setOpen(true);
    }, [ctx.commandPalette]);
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <p className="text-xs text-muted-foreground">
          Command palette is open — 8 commands across 3 groups
        </p>
      </div>
    );
  },
};

/**
 * Palette with a destructive command in the settings group.
 */
export const WithDestructiveCommand: Story = {
  render: () => {
    function Setup() {
      useCommandGroup({ id: 'danger', label: 'Danger Zone', priority: 400 });
      useCommands([
        {
          id: 'del-all',
          label: 'Delete all messages',
          icon: Trash2,
          group: 'danger',
          run: () => {},
        },
      ]);
      return <PaletteOpener />;
    }

    return (
      <CommandPalette>
        <Setup />
      </CommandPalette>
    );
  },
};
