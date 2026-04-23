import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_SIDE_PANEL_WIDTH,
  MAX_SIDE_PANEL_WIDTH,
  ShellStateProvider,
  useShellState,
} from './shell-state';

afterEach(() => {
  cleanup();
});

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };
}

function ShellStateHarness({ initialSearch = '' }: { initialSearch?: string }) {
  const [searchParams, setSearchParamsState] = useState(() => new URLSearchParams(initialSearch));

  return (
    <ShellStateProvider
      adapter={{
        searchParams,
        setSearchParams: (updater) => {
          setSearchParamsState((currentSearchParams) => updater(currentSearchParams));
        },
      }}
      initialActiveRail="lab"
      selectionQueryParam="product"
      sidePanelWidthStorageKey="picasso.side-panel.width"
    >
      <ShellStateConsumer />
    </ShellStateProvider>
  );
}

function ShellStateConsumer() {
  const shell = useShellState();

  return (
    <div>
      <div data-testid="panel">{shell.activePanelView ?? 'none'}</div>
      <div data-testid="last-panel">{shell.lastPanelView ?? 'none'}</div>
      <div data-testid="entity">{shell.selectedEntityId ?? 'none'}</div>
      <div data-testid="rail">{shell.activeRail}</div>
      <div data-testid="width">{shell.sidePanelWidth}</div>
      <div data-testid="palette">{shell.commandPaletteOpen ? 'open' : 'closed'}</div>
      <button type="button" onClick={() => shell.setActivePanelView('info')}>
        set panel
      </button>
      <button type="button" onClick={() => shell.closePanelView()}>
        close panel
      </button>
      <button type="button" onClick={() => shell.restoreLastPanelView('fallback')}>
        restore panel
      </button>
      <button
        type="button"
        onClick={() => shell.selectEntity('frame-13', { panelView: 'overview' })}
      >
        select entity
      </button>
      <button type="button" onClick={() => shell.clearEntity()}>
        clear entity
      </button>
      <button type="button" onClick={() => shell.setSidePanelWidth(999)}>
        resize panel
      </button>
      <button type="button" onClick={() => shell.openCommandPalette()}>
        open palette
      </button>
      <button type="button" onClick={() => shell.closeCommandPalette()}>
        close palette
      </button>
    </div>
  );
}

describe('ShellStateProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', createStorageMock());
  });

  it('reads and updates panel and selection state through the adapter', () => {
    render(<ShellStateHarness />);

    expect(screen.getByTestId('panel')).toHaveTextContent('none');
    expect(screen.getByTestId('entity')).toHaveTextContent('none');
    expect(screen.getByTestId('rail')).toHaveTextContent('lab');

    fireEvent.click(screen.getByText('set panel'));
    expect(screen.getByTestId('panel')).toHaveTextContent('info');
    expect(screen.getByTestId('last-panel')).toHaveTextContent('info');

    fireEvent.click(screen.getByText('close panel'));
    expect(screen.getByTestId('panel')).toHaveTextContent('none');

    fireEvent.click(screen.getByText('restore panel'));
    expect(screen.getByTestId('panel')).toHaveTextContent('info');

    fireEvent.click(screen.getByText('select entity'));
    expect(screen.getByTestId('entity')).toHaveTextContent('frame-13');
    expect(screen.getByTestId('panel')).toHaveTextContent('overview');

    fireEvent.click(screen.getByText('clear entity'));
    expect(screen.getByTestId('entity')).toHaveTextContent('none');
  });

  it('restores and persists a clamped panel width', () => {
    localStorage.setItem('picasso.side-panel.width', '420');

    render(<ShellStateHarness />);

    expect(screen.getByTestId('width')).toHaveTextContent('420');

    fireEvent.click(screen.getByText('resize panel'));
    expect(screen.getByTestId('width')).toHaveTextContent(String(MAX_SIDE_PANEL_WIDTH));

    vi.advanceTimersByTime(300);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'picasso.side-panel.width',
      String(MAX_SIDE_PANEL_WIDTH)
    );
  });

  it('falls back to the default width and tracks command palette state', () => {
    render(<ShellStateHarness initialSearch="?panel=ai&product=frame-13" />);

    expect(screen.getByTestId('width')).toHaveTextContent(String(DEFAULT_SIDE_PANEL_WIDTH));
    expect(screen.getByTestId('panel')).toHaveTextContent('ai');
    expect(screen.getByTestId('entity')).toHaveTextContent('frame-13');
    expect(screen.getByTestId('palette')).toHaveTextContent('closed');

    fireEvent.click(screen.getByText('open palette'));
    expect(screen.getByTestId('palette')).toHaveTextContent('open');

    fireEvent.click(screen.getByText('close palette'));
    expect(screen.getByTestId('palette')).toHaveTextContent('closed');
  });
});
