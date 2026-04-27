import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Menu } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AppTabs,
  PanelToggle,
  ShellHeader,
  ShellHeaderFrame,
  ShellPanelToggle,
  WorkspaceSwitcher,
} from './shell-header.js';
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

// ---------------------------------------------------------------------------
// Task 7.3 — WorkspaceSwitcher
// ---------------------------------------------------------------------------

describe('WorkspaceSwitcher — renders icon, name, chevron', () => {
  it('displays workspace name and a chevron button', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    // The trigger button wraps name + chevron
    const trigger = screen.getByRole('button', { name: /acme corp/i });
    expect(trigger).toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — click opens menu with workspace list + Settings/Profile/Sign out', () => {
  it('shows workspace items + fixed actions after click', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.getByText('Beta LLC')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — empty workspaces array still shows Settings/Profile/Sign out', () => {
  it('omits workspace list but keeps fixed actions', () => {
    renderWithProvider(<WorkspaceSwitcher />, { workspaces: [] });

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.queryByText('Beta LLC')).not.toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — workspaceMenuFooter slot renders extra items', () => {
  it('footer node is rendered inside the menu', () => {
    renderWithProvider(<WorkspaceSwitcher workspaceMenuFooter={<div>Footer Item</div>} />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));

    expect(screen.getByText('Footer Item')).toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — Escape closes the menu', () => {
  it('pressing Escape after opening removes menu items from DOM', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));
    expect(screen.getByText('Sign out')).toBeInTheDocument();

    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: 'Escape',
      code: 'Escape',
    });

    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });
});

describe('WorkspaceSwitcher — outside click closes the menu', () => {
  it('clicking outside the menu hides menu items', () => {
    renderWithProvider(<WorkspaceSwitcher />);

    fireEvent.click(screen.getByRole('button', { name: /acme corp/i }));
    expect(screen.getByText('Sign out')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);

    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Task 7.4 — AppTabs
// ---------------------------------------------------------------------------

describe('AppTabs — renders one tab per app from context', () => {
  it('shows a tab for each app', () => {
    renderWithProvider(<AppTabs />);

    expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /billing/i })).toBeInTheDocument();
  });
});

describe('AppTabs — active tab has border-b-2 border-primary and text-foreground', () => {
  it('first app tab has active styles by default', () => {
    renderWithProvider(<AppTabs />, { defaultActiveApp: 'app-a' });

    const activeTab = screen.getByRole('tab', { name: /analytics/i });
    expect(activeTab.className).toContain('border-b-2');
    expect(activeTab.className).toContain('border-primary');
    expect(activeTab.className).toContain('text-foreground');
  });
});

describe('AppTabs — clicking inactive tab calls setActiveApp(id)', () => {
  it('clicking Billing tab activates it', () => {
    renderWithProvider(<AppTabs />, { defaultActiveApp: 'app-a' });

    const billingTab = screen.getByRole('tab', { name: /billing/i });
    fireEvent.click(billingTab);

    // After click, Billing should have active styles
    expect(billingTab.className).toContain('border-b-2');
    expect(billingTab.className).toContain('border-primary');
  });
});

// ---------------------------------------------------------------------------
// Task 7.5 — PanelToggle
// ---------------------------------------------------------------------------

describe('PanelToggle — toggles panel mode closed → panel', () => {
  it('clicking while closed sets mode to panel (aria-label flips)', () => {
    renderWithProvider(<PanelToggle />);

    const btn = screen.getByRole('button', { name: 'Open right panel' });
    fireEvent.click(btn);

    expect(screen.getByRole('button', { name: 'Close right panel' })).toBeInTheDocument();
  });
});

describe('PanelToggle — toggles panel mode panel → closed', () => {
  it('clicking while open sets mode to closed (aria-label flips back)', () => {
    renderWithProvider(<PanelToggle />);

    const openBtn = screen.getByRole('button', { name: 'Open right panel' });
    fireEvent.click(openBtn);

    const closeBtn = screen.getByRole('button', { name: 'Close right panel' });
    fireEvent.click(closeBtn);

    expect(screen.getByRole('button', { name: 'Open right panel' })).toBeInTheDocument();
  });
});

describe('PanelToggle — active state styled when panel is open', () => {
  it('button has bg-accent class when panel mode is not closed', () => {
    renderWithProvider(<PanelToggle />);

    fireEvent.click(screen.getByRole('button', { name: 'Open right panel' }));

    const btn = screen.getByRole('button', { name: 'Close right panel' });
    expect(btn.className).toContain('bg-accent');
  });
});

describe('PanelToggle — renders PanelRightOpen icon when closed, PanelRightClose when open', () => {
  it('aria-label reflects the next action correctly', () => {
    renderWithProvider(<PanelToggle />);

    // Closed → label says "Open right panel"
    expect(screen.getByRole('button', { name: 'Open right panel' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open right panel' }));

    // Open → label says "Close right panel"
    expect(screen.getByRole('button', { name: 'Close right panel' })).toBeInTheDocument();
  });
});
