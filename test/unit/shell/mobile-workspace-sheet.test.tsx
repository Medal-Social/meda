import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Target, Users } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileWorkspaceSheet } from '../../../src/shell/internal/mobile-workspace-sheet.js';
import { MedaShellProvider, useMedaShell } from '../../../src/shell/shell-provider.js';
import type {
  AppDefinition,
  MobileNavTree,
  WorkspaceDefinition,
} from '../../../src/shell/types.js';

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'mobile'),
}));

const ws: WorkspaceDefinition = { id: 'ws', name: 'Medal Social', icon: null };
const apps: AppDefinition[] = [{ id: 'app', label: 'App', icon: Users }];

const tree: MobileNavTree = {
  groups: [
    {
      id: 'crm',
      label: 'CRM',
      items: [
        {
          id: 'contacts',
          label: 'Contacts',
          icon: Users,
          to: '/crm/contacts',
          views: [
            { id: 'all', label: 'All', to: '/crm/contacts?view=all' },
            { id: 'leads', label: 'Leads', to: '/crm/contacts?view=leads' },
          ],
        },
        {
          id: 'deals',
          label: 'Deals',
          icon: Target,
          to: '/crm/deals',
          views: [
            { id: 'all', label: 'All', to: '/crm/deals?view=all' },
            { id: 'won', label: 'Won', to: '/crm/deals?view=won' },
          ],
        },
        { id: 'email', label: 'Email', icon: Users, to: '/crm/email' },
      ],
    },
  ],
  footerItems: [{ id: 'settings', label: 'Settings', icon: Users, to: '/settings' }],
};

function OpenSheet() {
  const ctx = useMedaShell();
  // biome-ignore lint/correctness/useExhaustiveDependencies: open once on mount
  useEffect(() => {
    ctx.mobileDrawer.setOpen('workspace-sheet');
  }, []);
  return null;
}

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MedaShellProvider
      workspace={ws}
      apps={apps}
      storage={{ load: () => null, save: () => undefined }}
    >
      {children}
    </MedaShellProvider>
  );
}

beforeEach(() => {
  vi.stubGlobal('localStorage', {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
});

describe('MobileWorkspaceSheet', () => {
  it('renders the nav tree; plain rows navigate, presets are hidden until expanded', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} />
      </Wrapper>
    );
    // Group label + submodule rows.
    expect(screen.getByText('CRM')).toBeInTheDocument();
    expect(screen.getByText('Deals')).toBeInTheDocument();
    // Email is a plain navigate row (a link), no chevron-down expansion.
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute('href', '/crm/email');
    // Preset views are collapsed by default.
    expect(screen.queryByRole('link', { name: 'Deals · Won' })).toBeNull();
  });

  it('expands one submodule at a time (accordion) and navigates to a preset', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} />
      </Wrapper>
    );
    // Expand Deals → its presets appear.
    fireEvent.click(screen.getByRole('button', { name: /Deals/ }));
    expect(screen.getByRole('link', { name: 'Deals · Won' })).toHaveAttribute(
      'href',
      '/crm/deals?view=won'
    );

    // Expand Contacts → Deals collapses (one open at a time).
    fireEvent.click(screen.getByRole('button', { name: /Contacts/ }));
    expect(screen.getByRole('link', { name: 'Contacts · Leads' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Deals · Won' })).toBeNull();
  });
});
