import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Menu } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell, AppShellBody } from './app-shell.js';
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

const ws: WorkspaceDefinition = { id: 'ws-test', name: 'Test', icon: null };
const apps: AppDefinition[] = [{ id: 'app-a', label: 'A', icon: Menu }];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get the AppShell / AppShellBody root div via its child sentinel. */
function getRootDiv(testId = 'x'): HTMLElement {
  const child = screen.getByTestId(testId);
  const root = child.closest('div[class]');
  if (!root) throw new Error('Could not find root div');
  return root as HTMLElement;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AppShell', () => {
  it('writes data-meda-app and data-meda-workspace to root div', () => {
    render(
      <MedaShellProvider workspace={ws} apps={apps}>
        <AppShell>
          <div data-testid="x" />
        </AppShell>
      </MedaShellProvider>
    );

    const root = getRootDiv();
    expect(root).toHaveAttribute('data-meda-app', 'app-a');
    expect(root).toHaveAttribute('data-meda-workspace', 'ws-test');
  });

  it('applies bg-background text-foreground classes', () => {
    render(
      <MedaShellProvider workspace={ws} apps={apps}>
        <AppShell>
          <div data-testid="x" />
        </AppShell>
      </MedaShellProvider>
    );

    const root = getRootDiv();
    expect(root.className).toContain('bg-background');
    expect(root.className).toContain('text-foreground');
  });

  it('appends consumer className without replacing base classes', () => {
    render(
      <MedaShellProvider workspace={ws} apps={apps}>
        <AppShell className="custom-extra">
          <div data-testid="x" />
        </AppShell>
      </MedaShellProvider>
    );

    const root = getRootDiv();
    expect(root.className).toContain('bg-background');
    expect(root.className).toContain('text-foreground');
    expect(root.className).toContain('custom-extra');
  });
});

describe('AppShellBody', () => {
  it('renders horizontal flex container for rails + main', () => {
    render(
      <AppShellBody>
        <div data-testid="x" />
      </AppShellBody>
    );

    const root = getRootDiv();
    expect(root.className).toContain('relative');
    expect(root.className).toContain('flex');
    expect(root.className).toContain('overflow-hidden');
    expect(root.className).toContain('h-[calc(100vh-var(--shell-header-height))]');
  });
});
