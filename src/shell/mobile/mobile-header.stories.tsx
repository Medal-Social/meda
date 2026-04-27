import type { Meta, StoryObj } from '@storybook/react-vite';
import { Building2, Menu, Plus } from 'lucide-react';
import { MedaShellProvider } from '../shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from '../types.js';
import { MobileHeader } from './mobile-header.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const WORKSPACE: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={16} aria-hidden="true" />,
};

const APPS: AppDefinition[] = [{ id: 'inbox', label: 'Inbox', icon: Menu }];

// ---------------------------------------------------------------------------
// Mock viewport — MobileHeader hides unless band === 'mobile'.
// In Storybook we bypass useShellViewport by rendering at mobile width via
// the parameters.viewport setting. The component reads the real hook, so
// stories are best viewed at mobile width.
// ---------------------------------------------------------------------------

const meta = {
  title: 'Shell v2/Mobile/MobileHeader',
  component: MobileHeader,
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
} satisfies Meta<typeof MobileHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Root mode: workspace name + optional globalActions slot.
 * Set the Storybook viewport to iPhone (mobile1) to see the header.
 */
export const Root: Story = {
  args: {
    globalActions: (
      <button
        type="button"
        className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:opacity-90"
      >
        <Plus size={12} aria-hidden="true" />
        New
      </button>
    ),
  },
};

/**
 * Nested mode: shows ← parentLabel · pageTitle back button.
 */
export const Nested: Story = {
  args: {
    parentLabel: 'Mail',
    title: 'Inbox',
    onBack: () => console.log('back pressed'),
  },
};

/**
 * Nested mode without a title (back-only label).
 */
export const NestedNoTitle: Story = {
  args: {
    parentLabel: 'Settings',
    onBack: () => console.log('back pressed'),
  },
};
