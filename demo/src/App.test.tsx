import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import packageJson from '../../package.json';
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

function queryMatchesWidth(query: string, width: number) {
  const min = query.match(/min-width:\s*(\d+)px/);
  const max = query.match(/max-width:\s*(\d+)px/);
  const aboveMin = min ? width >= Number(min[1]) : true;
  const belowMax = max ? width <= Number(max[1]) : true;
  return aboveMin && belowMax;
}

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn((query: string) => matchMediaResult(query, queryMatchesWidth(query, width))),
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
    expect(screen.getByText(`v${packageJson.version}`)).toBeInTheDocument();
    expect(screen.getAllByRole('navigation', { name: 'Primary' }).length).toBeGreaterThan(0);
  });

  it('preserves subsection hashes that belong to the active app', async () => {
    window.history.replaceState(null, '', '#install');

    render(<App />);

    await waitFor(() => {
      expect(window.location.hash).toBe('#install');
    });
  });

  it('renders the marketing site through mobile AppShell chrome', async () => {
    setViewportWidth(390);

    render(<App />);

    expect(await screen.findByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

    expect(await screen.findByRole('heading', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Storybook' })).toBeInTheDocument();
  });
});
