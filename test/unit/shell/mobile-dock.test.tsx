import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Home, Inbox, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileDock } from '../../../src/shell/internal/mobile-dock.js';
import { MedaShellProvider, useMedaShell } from '../../../src/shell/shell-provider.js';
import type {
  AppDefinition,
  MobileDockItem,
  WorkspaceDefinition,
} from '../../../src/shell/types.js';

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'mobile'),
}));

import { useShellViewport } from '../../../src/shell/use-shell-viewport.js';

const ws: WorkspaceDefinition = { id: 'ws', name: 'Test', icon: null };
const apps: AppDefinition[] = [{ id: 'app', label: 'App', icon: Home }];

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

const dockItems: MobileDockItem[] = [
  { id: 'home', label: 'Home', icon: Home, to: '/home' },
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox', badge: true },
  { id: 'sheet', label: 'Open navigation', icon: Home, action: 'open-sheet' },
  { id: 'pilot', label: 'Pilot', icon: Sparkles, to: '/pilot', emphasis: 'brand' },
];

beforeEach(() => {
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  (useShellViewport as any).mockReturnValue('mobile');
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

describe('MobileDock', () => {
  it('renders pinned links and the standalone brand slot on mobile', () => {
    render(
      <Wrapper>
        <MobileDock items={dockItems} activeTo="/home" />
      </Wrapper>
    );
    expect(screen.getByTestId('mobile-dock')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: 'Inbox' })).toHaveAttribute('href', '/inbox');
    expect(screen.getByRole('link', { name: 'Pilot' })).toHaveAttribute('href', '/pilot');
    // Active route carries aria-current.
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  });

  it('opens the workspace sheet from the selector action', () => {
    function Probe() {
      const ctx = useMedaShell();
      return <span data-testid="drawer">{ctx.mobileDrawer.open ?? 'none'}</span>;
    }
    render(
      <Wrapper>
        <MobileDock items={dockItems} />
        <Probe />
      </Wrapper>
    );
    expect(screen.getByTestId('drawer')).toHaveTextContent('none');
    fireEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByTestId('drawer')).toHaveTextContent('workspace-sheet');
  });

  it('renders nothing on non-mobile viewports', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('desktop');
    render(
      <Wrapper>
        <MobileDock items={dockItems} />
      </Wrapper>
    );
    expect(screen.queryByTestId('mobile-dock')).toBeNull();
  });

  it('renders a full-width labeled bar with a tinted active slot in the bar variant', () => {
    render(
      <Wrapper>
        <MobileDock items={dockItems} variant="bar" activeTo="/inbox" />
      </Wrapper>
    );
    expect(screen.getByTestId('mobile-dock')).toBeInTheDocument();
    // The bar shows visible text labels (the pill variant is icon-only).
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Pilot')).toBeInTheDocument();
    // The active destination is tinted and carries aria-current.
    const inbox = screen.getByRole('link', { name: 'Inbox' });
    expect(inbox).toHaveAttribute('aria-current', 'page');
    expect(inbox.className).toContain('text-primary');
    // The sheet trigger still opens the workspace sheet.
    expect(screen.getByRole('button', { name: 'Open navigation' })).toBeInTheDocument();
  });
});
