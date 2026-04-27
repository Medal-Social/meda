import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, Menu, Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { MedaShellProvider, useMedaShell } from '../shell-provider.js';
import type { AppDefinition, MobileBottomNavItem, WorkspaceDefinition } from '../types.js';
import { MobileBottomNav } from './mobile-bottom-nav.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const WORKSPACE: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={16} aria-hidden="true" />,
};

const APPS: AppDefinition[] = [{ id: 'inbox', label: 'Inbox', icon: Menu }];

function FullscreenActivator({ children }: { children: ReactNode }) {
  const ctx = useMedaShell();
  return (
    <div>
      <button
        type="button"
        className="mb-4 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground"
        onClick={() => ctx.panel.setMode(ctx.panel.mode === 'fullscreen' ? 'closed' : 'fullscreen')}
      >
        Toggle fullscreen panel ({ctx.panel.mode})
      </button>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/Mobile/MobileBottomNav',
  component: MobileBottomNav,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
  },
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS}>
        <Story />
      </MedaShellProvider>
    ),
  ],
} satisfies Meta<typeof MobileBottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default 4-button bar (Menu / Module / Panels / AI).
 * View at mobile1 viewport. Clicking buttons sets provider drawer state.
 */
export const Default: Story = {};

/**
 * Custom mobileBottomNav override — 1 button with a star icon.
 */
export const Custom: Story = {
  decorators: [
    (Story) => {
      const customNav: MobileBottomNavItem[] = [
        { id: 'favorites', label: 'Favorites', icon: Star, opens: 'menu-drawer' },
      ];
      return (
        <MedaShellProvider workspace={WORKSPACE} apps={APPS} mobileBottomNav={customNav}>
          <Story />
        </MedaShellProvider>
      );
    },
  ],
};

/**
 * Hidden when the right panel is in fullscreen mode.
 * Click "Toggle fullscreen panel" to see the nav disappear.
 */
export const HiddenOnFullscreen: Story = {
  decorators: [
    (Story) => (
      <MedaShellProvider workspace={WORKSPACE} apps={APPS}>
        <FullscreenActivator>
          <Story />
        </FullscreenActivator>
      </MedaShellProvider>
    ),
  ],
};
