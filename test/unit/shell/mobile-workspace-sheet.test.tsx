import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Target, Users } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

/** Lets a test close and re-open the sheet to exercise the open-time reset. */
function SheetControls() {
  const ctx = useMedaShell();
  return (
    <>
      <button
        type="button"
        data-testid="open-sheet"
        onClick={() => ctx.mobileDrawer.setOpen('workspace-sheet')}
      >
        open-sheet
      </button>
      <button
        type="button"
        data-testid="close-sheet"
        onClick={() => ctx.mobileDrawer.setOpen(null)}
      >
        close-sheet
      </button>
    </>
  );
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

describe('MobileWorkspaceSheet — opens where you are', () => {
  let scrollIntoView: ReturnType<typeof vi.fn>;
  const originalScrollIntoView = Element.prototype.scrollIntoView;

  beforeEach(() => {
    scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('expands and scrolls to the row named by activeId', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} activeId="deals" />
      </Wrapper>
    );
    expect(screen.getByRole('link', { name: 'Deals · Won' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Contacts · Leads' })).toBeNull();
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('falls back to the row that owns activeTo through its own `to`', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} activeTo="/crm/deals" />
      </Wrapper>
    );
    expect(screen.getByRole('link', { name: 'Deals · Won' })).toBeInTheDocument();
  });

  it('falls back to the row that owns activeTo through one of its views', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} activeTo="/crm/contacts?view=leads" />
      </Wrapper>
    );
    expect(screen.getByRole('link', { name: 'Contacts · Leads' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Deals · Won' })).toBeNull();
  });

  it('leaves everything collapsed when the current row has no preset views', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} activeId="email" />
      </Wrapper>
    );
    expect(screen.queryByRole('link', { name: 'Deals · Won' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Contacts · Leads' })).toBeNull();
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('lets the user collapse the pre-expanded row, and re-expands on the next open', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <SheetControls />
        <MobileWorkspaceSheet tree={tree} activeId="deals" />
      </Wrapper>
    );
    expect(screen.getByRole('link', { name: 'Deals · Won' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^Deals/ }));
    expect(screen.queryByRole('link', { name: 'Deals · Won' })).toBeNull();

    fireEvent.click(screen.getByTestId('close-sheet'));
    fireEvent.click(screen.getByTestId('open-sheet'));
    expect(screen.getByRole('link', { name: 'Deals · Won' })).toBeInTheDocument();
  });

  it('keeps the tree order by default and hoists the current row with currentFirst', () => {
    const order = () =>
      Array.from(document.querySelectorAll('section[aria-label="CRM"] [data-meda-nav-item]')).map(
        (el) => el.getAttribute('data-meda-nav-item')
      );

    const { unmount } = render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} activeId="deals" />
      </Wrapper>
    );
    expect(order()).toEqual(['contacts', 'deals', 'email']);
    unmount();

    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} activeId="deals" currentFirst />
      </Wrapper>
    );
    expect(order()).toEqual(['deals', 'contacts', 'email']);
  });

  it('is a no-op when neither activeId nor activeTo matches a row', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} activeId="nope" currentFirst />
      </Wrapper>
    );
    expect(screen.queryByRole('link', { name: 'Deals · Won' })).toBeNull();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(
      Array.from(document.querySelectorAll('section[aria-label="CRM"] [data-meda-nav-item]')).map(
        (el) => el.getAttribute('data-meda-nav-item')
      )
    ).toEqual(['contacts', 'deals', 'email']);
  });

  it('resolves footer rows too', () => {
    render(
      <Wrapper>
        <OpenSheet />
        <MobileWorkspaceSheet tree={tree} activeId="settings" />
      </Wrapper>
    );
    expect(scrollIntoView).toHaveBeenCalled();
  });
});
