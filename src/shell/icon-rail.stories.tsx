import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Bell,
  Building2,
  Calendar,
  FlaskConical,
  HelpCircle,
  Inbox,
  Mail,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { IconRailItem } from './icon-rail.js';
import { IconRail } from './icon-rail.js';
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
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const MAIN_ITEMS: IconRailItem[] = [
  { id: 'inbox', label: 'Inbox', to: '/inbox', icon: Inbox },
  { id: 'mail', label: 'Mail', to: '/mail', icon: Mail },
  { id: 'calendar', label: 'Calendar', to: '/calendar', icon: Calendar },
  { id: 'users', label: 'People', to: '/people', icon: Users },
];

const UTILITY_ITEMS: IconRailItem[] = [
  { id: 'bell', label: 'Notifications', to: '/notifications', icon: Bell },
  { id: 'help', label: 'Help', to: '/help', icon: HelpCircle },
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
      {/* Constrain height so the rail renders in a realistic shell height */}
      <div className="flex h-screen bg-background">
        <Story />
      </div>
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/IconRail',
  component: IconRail,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  // mainItems is required; provide defaults so Story type inference is satisfied
  args: {
    mainItems: MAIN_ITEMS,
    utilityItems: UTILITY_ITEMS,
  },
} satisfies Meta<typeof IconRail>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default: four main items, two utility items, no footer.
 * The rail is 60px wide and never expands. Hover an icon to see its label tooltip.
 */
export const Default: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, [WORKSPACE], APPS, Story)],
  render: () => <IconRail mainItems={MAIN_ITEMS} utilityItems={UTILITY_ITEMS} />,
};

/**
 * Dark-theme variant.
 */
export const DarkTheme: Story = {
  parameters: {
    themes: { themeOverride: 'dark' },
  },
  decorators: [(Story) => withProvider(WORKSPACE, [WORKSPACE], APPS, Story)],
  render: () => <IconRail mainItems={MAIN_ITEMS} utilityItems={UTILITY_ITEMS} />,
};

/**
 * WithFooter: same as Default plus a placeholder avatar button at the bottom.
 */
export const WithFooter: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, [WORKSPACE], APPS, Story)],
  render: () => (
    <IconRail
      mainItems={MAIN_ITEMS}
      utilityItems={UTILITY_ITEMS}
      footer={
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/12 text-primary text-sm font-semibold"
          aria-label="User menu"
        >
          A
        </button>
      }
    />
  ),
};

/**
 * WithActiveItem: Inbox is highlighted with bg-primary/12 + primary-tinted icon.
 */
export const WithActiveItem: Story = {
  decorators: [
    (Story) => withProvider(WORKSPACE, [WORKSPACE, WORKSPACE_2, WORKSPACE_3], APPS, Story),
  ],
  render: () => <IconRail mainItems={MAIN_ITEMS} utilityItems={UTILITY_ITEMS} activeId="inbox" />,
};

/**
 * EmptyUtility: only main items — no RailDivider rendered.
 */
export const EmptyUtility: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, [WORKSPACE], APPS, Story)],
  render: () => <IconRail mainItems={MAIN_ITEMS} />,
};

/**
 * RailDividerPushedUp: click the chevron button to push utility items
 * directly under the divider instead of pinning them to the bottom.
 * Use the play function or click the divider button interactively.
 */
export const RailDividerPushedUp: Story = {
  decorators: [(Story) => withProvider(WORKSPACE, [WORKSPACE], APPS, Story)],
  render: () => <IconRail mainItems={MAIN_ITEMS} utilityItems={UTILITY_ITEMS} />,
  play: async ({ canvasElement }) => {
    // Click the divider button once to push utility items up
    const divider = canvasElement.querySelector('[data-testid="rail-divider"]') as HTMLElement;
    if (divider) divider.click();
  },
};
