import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChevronsUpDown, Home, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { MobileDock } from './internal/mobile-dock.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, MobileDockItem, WorkspaceDefinition } from './types.js';

const WORKSPACE: WorkspaceDefinition = { id: 'ws', name: 'Medal Social', icon: null };
const APPS: AppDefinition[] = [{ id: 'home', label: 'Home', icon: Home }];

// Stand-in for apps/web's `PilotIcon` (the Medal brandmark) so the Storybook
// preview matches the real dock — a purple disc with the white Medal diamond.
function MedalMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#5B2D8C" />
      <path
        d="M8 24L24 8L40 24L24 40L8 24Z"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// Matches the native app: Home · Inbox · Switch (⇅) · Pilot.
const ITEMS: MobileDockItem[] = [
  { id: 'home', label: 'Home', icon: Home, to: '/home' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox', badge: true },
  { id: 'switch', label: 'Switch', icon: ChevronsUpDown, action: 'open-sheet' },
  {
    id: 'pilot',
    label: 'Pilot',
    icon: MedalMark as MobileDockItem['icon'],
    to: '/pilot',
    emphasis: 'brand',
  },
];

// The dock only paints on a mobile viewport (max-width: 767px) — render the
// story at ≤767px to see it.
function Frame({ children }: { children: ReactNode }) {
  return (
    <MedaShellProvider
      workspace={WORKSPACE}
      apps={APPS}
      storage={{ load: () => null, save: () => undefined }}
    >
      <div
        style={{
          position: 'relative',
          height: '100vh',
          background: 'var(--background, #ffffff)',
        }}
      >
        <div style={{ padding: 16, fontSize: 13, color: 'var(--muted-foreground, #78716c)' }}>
          Mobile dock — render at ≤767px.
        </div>
        {children}
      </div>
    </MedaShellProvider>
  );
}

const meta: Meta<typeof MobileDock> = {
  title: 'Shell/MobileDock',
  component: MobileDock,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <Frame>
        <Story />
      </Frame>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof MobileDock>;

export const Bar: Story = { args: { items: ITEMS, activeTo: '/inbox', variant: 'bar' } };
export const Pill: Story = { args: { items: ITEMS, activeTo: '/home', variant: 'pill' } };
