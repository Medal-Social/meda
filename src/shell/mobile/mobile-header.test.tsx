import { fireEvent, render, screen } from '@testing-library/react';
import { Menu } from 'lucide-react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MedaShellProvider } from '../shell-provider.js';
import { MobileHeader } from './mobile-header.js';

// ---------------------------------------------------------------------------
// Mock useShellViewport — default 'mobile', can be overridden per-test
// ---------------------------------------------------------------------------

vi.mock('../use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'mobile'),
}));

import { useShellViewport } from '../use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Global browser stubs
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
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  (useShellViewport as any).mockReturnValue('mobile');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MedaShellProvider
      workspace={{ id: 'ws1', name: 'Acme', icon: null }}
      apps={[{ id: 'app-a', label: 'App A', icon: Menu }]}
    >
      {children}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MobileHeader — renders nothing on non-mobile viewport', () => {
  it('returns null on desktop', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('desktop');
    render(<MobileHeader />, { wrapper: Wrapper });
    expect(document.querySelector('header[data-meda-mobile-header]')).toBeNull();
  });

  it('returns null on tablet', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('tablet');
    render(<MobileHeader />, { wrapper: Wrapper });
    expect(document.querySelector('header[data-meda-mobile-header]')).toBeNull();
  });
});

describe('MobileHeader — root mode', () => {
  it('shows workspace name', () => {
    render(<MobileHeader />, { wrapper: Wrapper });
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('renders globalActions when provided', () => {
    render(<MobileHeader globalActions={<button type="button">+ New</button>} />, {
      wrapper: Wrapper,
    });
    expect(screen.getByText('+ New')).toBeInTheDocument();
  });

  it('does not render a back button in root mode', () => {
    render(<MobileHeader />, { wrapper: Wrapper });
    expect(screen.queryByRole('button', { name: /go back/i })).toBeNull();
  });
});

describe('MobileHeader — nested mode', () => {
  it('shows back button with aria-label', () => {
    render(<MobileHeader parentLabel="Mail" title="Inbox" />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('shows parentLabel and title', () => {
    render(<MobileHeader parentLabel="Mail" title="Inbox" />, { wrapper: Wrapper });
    expect(screen.getByText('Mail')).toBeInTheDocument();
    expect(screen.getByText('Inbox')).toBeInTheDocument();
  });

  it('clicking back button calls onBack', () => {
    const onBack = vi.fn();
    render(<MobileHeader parentLabel="Mail" title="Inbox" onBack={onBack} />, {
      wrapper: Wrapper,
    });
    fireEvent.click(screen.getByRole('button', { name: /go back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows separator dot between parentLabel and title', () => {
    render(<MobileHeader parentLabel="Mail" title="Inbox" />, { wrapper: Wrapper });
    expect(screen.getByText('·')).toBeInTheDocument();
  });
});

describe('MobileHeader — height', () => {
  it('header has h-[var(--shell-header-height)] class', () => {
    render(<MobileHeader />, { wrapper: Wrapper });
    const header = document.querySelector('header[data-meda-mobile-header]');
    expect(header?.className).toContain('h-[var(--shell-header-height)]');
  });
});
