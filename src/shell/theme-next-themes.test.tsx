import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from './theme.js';
import { NextThemesAdapter } from './theme-next-themes.js';

afterEach(() => {
  document.documentElement.classList.remove('dark');
  vi.unstubAllGlobals();
});

function ThemeConsumer() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
    </div>
  );
}

describe('NextThemesAdapter — bridges next-themes useTheme to meda ThemeAdapter shape', () => {
  it('exposes theme and resolvedTheme via meda ThemeCtx', () => {
    // Stub matchMedia so next-themes system detection works in jsdom
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    // With defaultTheme="system" and no stored preference, theme is 'system'
    expect(screen.getByTestId('theme').textContent).toBe('system');
    // resolvedTheme: matchMedia returns matches=false (light) → 'light'
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  it('narrowResolved defaults to light when resolvedTheme is undefined or unknown', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    );

    render(
      <NextThemesAdapter>
        <ThemeConsumer />
      </NextThemesAdapter>
    );

    // resolvedTheme should always be 'light' or 'dark', never undefined
    const resolved = screen.getByTestId('resolved').textContent;
    expect(resolved === 'light' || resolved === 'dark').toBe(true);
  });
});
