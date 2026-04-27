import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Menu } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ShellHeader, ShellHeaderFrame, ShellPanelToggle } from './shell-header.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Browser stubs — DefaultThemeProvider reads localStorage + matchMedia
// ---------------------------------------------------------------------------

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
      dispatchEvent: vi.fn(),
    }))
  );
});

afterEach(() => {
  document.documentElement.classList.remove('dark');
  vi.unstubAllGlobals();
  cleanup();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ws: WorkspaceDefinition = { id: 'ws-test', name: 'Acme Corp', icon: null };
const ws2: WorkspaceDefinition = { id: 'ws-other', name: 'Beta LLC', icon: null };
const apps: AppDefinition[] = [
  { id: 'app-a', label: 'Analytics', icon: Menu },
  { id: 'app-b', label: 'Billing', icon: Menu },
];

function renderWithProvider(
  ui: React.ReactNode,
  opts: {
    workspaces?: WorkspaceDefinition[];
    defaultActiveApp?: string;
  } = {}
) {
  return render(
    <MedaShellProvider
      workspace={ws}
      workspaces={opts.workspaces ?? [ws, ws2]}
      apps={apps}
      defaultActiveApp={opts.defaultActiveApp}
    >
      {ui}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Legacy components (preserved for back-compat)
// ---------------------------------------------------------------------------

describe('ShellHeaderFrame', () => {
  it('renders left, center, and right header slots', () => {
    render(
      <ShellHeaderFrame
        left={<div>Workspace</div>}
        center={<nav>Tabs</nav>}
        right={<button type="button">Action</button>}
      />
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Tabs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByTestId('shell-header-actions')).toBeInTheDocument();
  });
});

describe('ShellPanelToggle', () => {
  it('renders the open state label and fires toggle', () => {
    const onToggle = vi.fn();

    render(<ShellPanelToggle panelOpen onToggle={onToggle} />);

    fireEvent.click(screen.getByLabelText('Close panel'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders the closed state label', () => {
    render(<ShellPanelToggle panelOpen={false} onToggle={vi.fn()} />);

    expect(screen.getByLabelText('Open panel')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Task 7.2 — ShellHeader skeleton
// ---------------------------------------------------------------------------

describe('ShellHeader — renders WorkspaceSwitcher and PanelToggle from context', () => {
  it('shows workspace name and panel toggle button', () => {
    renderWithProvider(<ShellHeader />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /open right panel|close right panel/i })
    ).toBeInTheDocument();
  });
});

describe('ShellHeader — renders globalActions before PanelToggle', () => {
  it('globalActions node appears in DOM order before the panel toggle', () => {
    renderWithProvider(<ShellHeader globalActions={<button type="button">Custom</button>} />);

    const customBtn = screen.getByRole('button', { name: 'Custom' });
    const panelBtn = screen.getByRole('button', { name: /open right panel|close right panel/i });

    // compareDocumentPosition: 4 = DOCUMENT_POSITION_FOLLOWING (panelBtn comes after customBtn)
    expect(customBtn.compareDocumentPosition(panelBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });
});

describe('ShellHeader — has h-[var(--shell-header-height)] class', () => {
  it('root element has the 56px height class', () => {
    const { container } = renderWithProvider(<ShellHeader />);

    const header = container.querySelector('header');
    expect(header?.className).toContain('h-[var(--shell-header-height)]');
  });
});

describe('ShellHeader — has no center slot', () => {
  it('renders only left and right regions (no third div in between)', () => {
    const { container } = renderWithProvider(<ShellHeader />);

    const header = container.querySelector('header');
    // Direct div children of the header — should be 2 (left, right) not 3
    const divChildren = Array.from(header?.children ?? []).filter((c) => c.tagName === 'DIV');
    expect(divChildren.length).toBe(2);
  });
});
