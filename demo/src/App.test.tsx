import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

function matchMediaResult(query: string, matches = false) {
  return {
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };
}

function mockMobileViewport() {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => matchMediaResult(query, query === '(max-width: 767px)')),
  });
}

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(window, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => matchMediaResult(query)),
  });
});

describe('demo App', () => {
  it('renders the demo shell without crashing', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /the shell that runs medal/i })).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: 'Primary' }).length).toBeGreaterThan(0);
  });

  it('preserves subsection hashes that belong to the active app', async () => {
    window.history.replaceState(null, '', '#install');

    render(<App />);

    await waitFor(() => {
      expect(window.location.hash).toBe('#install');
    });
  });

  it('opens the mobile Links drawer', async () => {
    mockMobileViewport();

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Links' }));

    expect(await screen.findByRole('heading', { name: 'Meda resources' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'npm package' })).toHaveAttribute(
      'href',
      'https://www.npmjs.com/package/@medalsocial/meda'
    );
  });
});
