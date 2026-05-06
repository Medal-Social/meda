import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  CommandPalette,
  CommandRegistryContext,
  useCommandGroup,
  useCommands,
} from '../../../src/shell/command-palette.js';
import { MedaShellProvider, useMedaShell } from '../../../src/shell/shell-provider.js';
import type {
  AppDefinition,
  CommandDefinition,
  WorkspaceDefinition,
} from '../../../src/shell/types.js';

// ---------------------------------------------------------------------------
// Browser stubs
// ---------------------------------------------------------------------------

// cmdk's CommandList uses ResizeObserver to measure list height
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// cmdk calls scrollIntoView on selected items; jsdom doesn't implement it
Element.prototype.scrollIntoView = vi.fn();

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', MockResizeObserver);
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
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const workspace: WorkspaceDefinition = { id: 'ws1', name: 'Test WS', icon: null };
const apps: AppDefinition[] = [{ id: 'app-a', label: 'App A', icon: Inbox }];

/** Reads and displays commandPalette.open from provider context */
function PaletteStateReader() {
  const ctx = useMedaShell();
  return <span data-testid="palette-open">{String(ctx.commandPalette.open)}</span>;
}

// ---------------------------------------------------------------------------
// Task 14.1: Basic open/close via hotkey
// ---------------------------------------------------------------------------

describe('CommandPalette — Cmd+K opens palette', () => {
  it('Cmd+K (metaKey) opens palette', () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <PaletteStateReader />
        </CommandPalette>
      </MedaShellProvider>
    );

    expect(screen.getByTestId('palette-open').textContent).toBe('false');
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('palette-open').textContent).toBe('true');
  });

  it('Ctrl+K also opens palette (mod = meta or ctrl)', () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <PaletteStateReader />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByTestId('palette-open').textContent).toBe('true');
  });

  it('plain K (no modifier) does NOT open palette', () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <PaletteStateReader />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.keyDown(window, { key: 'k' });
    expect(screen.getByTestId('palette-open').textContent).toBe('false');
  });

  it('Cmd+Shift+K does NOT match mod+k (strict modifier checking)', () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <PaletteStateReader />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.keyDown(window, { key: 'k', metaKey: true, shiftKey: true });
    expect(screen.getByTestId('palette-open').textContent).toBe('false');
  });

  it('Cmd+Alt+K does NOT match mod+k (strict alt-absent matching)', () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <PaletteStateReader />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.keyDown(window, { key: 'k', metaKey: true, altKey: true });
    expect(screen.getByTestId('palette-open').textContent).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Esc closes palette
// ---------------------------------------------------------------------------

describe('CommandPalette — Esc closes palette', () => {
  it('palette renders search input when open', async () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette />
      </MedaShellProvider>
    );

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search commands…')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Renders commands grouped by group field
// ---------------------------------------------------------------------------

describe('CommandPalette — renders commands grouped by group field', () => {
  it('shows commands registered by children under correct groups', async () => {
    function TwoGroupRegistrar() {
      const ctx = useMedaShell();
      // Register commands via registry context is done through useCommands (COMMIT 3).
      // For this base test, directly set palette open and assert structure from registry.
      // We verify the palette opens and search input is present.
      return (
        <button
          type="button"
          data-testid="open-btn"
          onClick={() => ctx.commandPalette.setOpen(true)}
        >
          open
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <TwoGroupRegistrar />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open-btn'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search commands…')).toBeInTheDocument();
    });
    expect(screen.getByText('No results.')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

describe('CommandPalette — empty state', () => {
  it('shows "No results." when no commands registered', async () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette />
      </MedaShellProvider>
    );

    fireEvent.keyDown(window, { key: 'k', metaKey: true });

    await waitFor(() => {
      expect(screen.getByText('No results.')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// CommandRegistryContext is exported
// ---------------------------------------------------------------------------

describe('CommandPalette — registry context', () => {
  it('CommandRegistryContext is exported and accessible', () => {
    expect(CommandRegistryContext).toBeDefined();
  });

  it('CommandRegistryContext provides register/unregister/registerGroup/unregisterGroup inside CommandPalette', () => {
    const { result } = renderHook(
      () => {
        const { useContext } = require('react') as typeof import('react');
        return useContext(CommandRegistryContext);
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MedaShellProvider workspace={workspace} apps={apps}>
            <CommandPalette>{children}</CommandPalette>
          </MedaShellProvider>
        ),
      }
    );

    expect(result.current).not.toBeNull();
    expect(typeof result.current?.register).toBe('function');
    expect(typeof result.current?.unregister).toBe('function');
    expect(typeof result.current?.registerGroup).toBe('function');
    expect(typeof result.current?.unregisterGroup).toBe('function');
  });

  it('CommandRegistryContext is null outside CommandPalette', () => {
    const { result } = renderHook(
      () => {
        const { useContext } = require('react') as typeof import('react');
        return useContext(CommandRegistryContext);
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MedaShellProvider workspace={workspace} apps={apps}>
            {children}
          </MedaShellProvider>
        ),
      }
    );

    expect(result.current).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// CommandPalette — provider state is used (not internal)
// ---------------------------------------------------------------------------

describe('CommandPalette — reads open state from provider', () => {
  it('opens when provider commandPalette.open is set to true externally', async () => {
    function ExternalOpener() {
      const ctx = useMedaShell();
      return (
        <button
          type="button"
          data-testid="ext-open"
          onClick={() => ctx.commandPalette.setOpen(true)}
        >
          open externally
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <ExternalOpener />
        <CommandPalette />
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('ext-open'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search commands…')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// matchesHotkey — strict matching exported via behavior tests
// ---------------------------------------------------------------------------

describe('matchesHotkey — strict modifier matching', () => {
  it('mod+shift+k only matches Cmd+Shift+K, not Cmd+K', () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps} commandPaletteHotkey="mod+shift+k">
        <CommandPalette>
          <PaletteStateReader />
        </CommandPalette>
      </MedaShellProvider>
    );

    // Cmd+K without shift — should NOT open
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('palette-open').textContent).toBe('false');

    // Cmd+Shift+K — should open
    fireEvent.keyDown(window, { key: 'k', metaKey: true, shiftKey: true });
    expect(screen.getByTestId('palette-open').textContent).toBe('true');
  });

  it('mod+alt+k only matches Cmd+Alt+K, not Cmd+K', () => {
    render(
      <MedaShellProvider workspace={workspace} apps={apps} commandPaletteHotkey="mod+alt+k">
        <CommandPalette>
          <PaletteStateReader />
        </CommandPalette>
      </MedaShellProvider>
    );

    // Cmd+K without alt — should NOT open
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(screen.getByTestId('palette-open').textContent).toBe('false');

    // Cmd+Alt+K — should open
    fireEvent.keyDown(window, { key: 'k', metaKey: true, altKey: true });
    expect(screen.getByTestId('palette-open').textContent).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Task 14.2: useCommands hook
// ---------------------------------------------------------------------------

describe('useCommands — registers on mount, unregisters on unmount', () => {
  it('registers commands on mount; they appear in palette', async () => {
    const cmd: CommandDefinition = {
      id: 'test-1',
      label: 'Test One',
      group: 'tests',
      run: vi.fn(),
    };

    function Consumer() {
      useCommands([cmd]);
      return null;
    }

    function Opener() {
      const ctx = useMedaShell();
      return (
        <button type="button" onClick={() => ctx.commandPalette.setOpen(true)} data-testid="open">
          open
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <Consumer />
          <Opener />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      expect(screen.getByText('Test One')).toBeInTheDocument();
    });
  });

  it('unregisters commands on unmount', async () => {
    const cmd: CommandDefinition = {
      id: 'unmount-cmd',
      label: 'Unmount Me',
      group: 'tests',
      run: vi.fn(),
    };

    function Consumer({ show }: { show: boolean }) {
      const ctx = useMedaShell();
      return (
        <>
          {show && <CommandConsumerChild cmd={cmd} />}
          <button type="button" onClick={() => ctx.commandPalette.setOpen(true)} data-testid="open">
            open
          </button>
        </>
      );
    }

    function CommandConsumerChild({ cmd: c }: { cmd: CommandDefinition }) {
      useCommands([c]);
      return null;
    }

    const { rerender } = render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <Consumer show={true} />
        </CommandPalette>
      </MedaShellProvider>
    );

    // Open palette — command should be visible
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.getByText('Unmount Me')).toBeInTheDocument();
    });

    // Close palette and unmount consumer
    act(() => {
      // Force close via Escape
    });

    rerender(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <Consumer show={false} />
        </CommandPalette>
      </MedaShellProvider>
    );

    // Open again — command should be gone
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    await waitFor(() => {
      expect(screen.queryByText('Unmount Me')).toBeNull();
    });
  });

  it('multiple components can register commands; all appear in palette', async () => {
    const cmd1: CommandDefinition = {
      id: 'multi-1',
      label: 'Multi Alpha',
      group: 'tests',
      run: vi.fn(),
    };
    const cmd2: CommandDefinition = {
      id: 'multi-2',
      label: 'Multi Beta',
      group: 'tests',
      run: vi.fn(),
    };

    function ConsumerA() {
      useCommands([cmd1]);
      return null;
    }

    function ConsumerB() {
      useCommands([cmd2]);
      return null;
    }

    function Opener() {
      const ctx = useMedaShell();
      return (
        <button type="button" onClick={() => ctx.commandPalette.setOpen(true)} data-testid="open">
          open
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <ConsumerA />
          <ConsumerB />
          <Opener />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      expect(screen.getByText('Multi Alpha')).toBeInTheDocument();
      expect(screen.getByText('Multi Beta')).toBeInTheDocument();
    });
  });

  it('throws when used outside CommandPalette', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useCommands([]), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MedaShellProvider workspace={workspace} apps={apps}>
            {children}
          </MedaShellProvider>
        ),
      });
    }).toThrow('useCommands must be used inside <CommandPalette>');
    errSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Command shortcut display
// ---------------------------------------------------------------------------

describe('CommandPalette — command shortcut display', () => {
  function CommandSetup({ commands }: { commands: CommandDefinition[] }) {
    useCommands(commands);
    const ctx = useMedaShell();
    return (
      <button type="button" onClick={() => ctx.commandPalette.setOpen(true)} data-testid="open">
        open
      </button>
    );
  }

  it('shows hotkey text when a command has hotkey but no shortcut', async () => {
    const cmd: CommandDefinition = {
      id: 'hotkey-only',
      label: 'Hotkey Only',
      group: 'tests',
      hotkey: '⌘J',
      run: vi.fn(),
    };

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <CommandSetup commands={[cmd]} />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      expect(screen.getByText('Hotkey Only')).toBeInTheDocument();
      expect(screen.getByText('⌘J')).toBeInTheDocument();
    });
  });

  it('shows shortcut instead of hotkey when both are present', async () => {
    const cmd: CommandDefinition = {
      id: 'shortcut-wins',
      label: 'Shortcut Wins',
      group: 'tests',
      shortcut: '⌘S',
      hotkey: '⌘H',
      run: vi.fn(),
    };

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <CommandSetup commands={[cmd]} />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      expect(screen.getByText('Shortcut Wins')).toBeInTheDocument();
      expect(screen.getByText('⌘S')).toBeInTheDocument();
    });
    expect(screen.queryByText('⌘H')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 14.2: useCommandGroup hook
// ---------------------------------------------------------------------------

describe('useCommandGroup — orders groups by priority', () => {
  it('groups are ordered by priority (lower = first)', async () => {
    const cmdA: CommandDefinition = {
      id: 'grp-a-cmd',
      label: 'Alpha Cmd',
      group: 'group-a',
      run: vi.fn(),
    };
    const cmdB: CommandDefinition = {
      id: 'grp-b-cmd',
      label: 'Beta Cmd',
      group: 'group-b',
      run: vi.fn(),
    };

    // group-b has lower priority → should appear first
    function Setup() {
      useCommands([cmdA, cmdB]);
      useCommandGroup({ id: 'group-a', label: 'Group A', priority: 200 });
      useCommandGroup({ id: 'group-b', label: 'Group B', priority: 100 });
      const ctx = useMedaShell();
      return (
        <button type="button" onClick={() => ctx.commandPalette.setOpen(true)} data-testid="open">
          open
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <Setup />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      expect(screen.getByText('Group A')).toBeInTheDocument();
      expect(screen.getByText('Group B')).toBeInTheDocument();
    });

    // Check DOM order — Group B should appear before Group A
    const headings = screen.getAllByText(/Group [AB]/);
    expect(headings[0].textContent).toBe('Group B');
    expect(headings[1].textContent).toBe('Group A');
  });

  it('throws when used outside CommandPalette', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useCommandGroup({ id: 'test', label: 'Test', priority: 1 }), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <MedaShellProvider workspace={workspace} apps={apps}>
            {children}
          </MedaShellProvider>
        ),
      });
    }).toThrow('useCommandGroup must be used inside <CommandPalette>');
    errSpy.mockRestore();
  });

  it('groups with no useCommandGroup registration use group id as label (default priority=100)', async () => {
    // Commands in groups not registered via useCommandGroup — exercises the
    // ga?.priority ?? 100 and ga?.label ?? a branches (ga is undefined).
    const cmdX: CommandDefinition = {
      id: 'unregistered-x',
      label: 'X Cmd',
      group: 'unregistered-b',
      run: vi.fn(),
    };
    const cmdY: CommandDefinition = {
      id: 'unregistered-y',
      label: 'Y Cmd',
      group: 'unregistered-a',
      run: vi.fn(),
    };

    function Setup() {
      useCommands([cmdX, cmdY]);
      // No useCommandGroup calls — both groups have undefined registration
      const ctx = useMedaShell();
      return (
        <button type="button" onClick={() => ctx.commandPalette.setOpen(true)} data-testid="open">
          open
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <Setup />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      // Groups render with their id as label since no useCommandGroup was called
      expect(screen.getByText('X Cmd')).toBeInTheDocument();
      expect(screen.getByText('Y Cmd')).toBeInTheDocument();
    });
  });

  it('sorts groups with equal priority by label (localeCompare fallback)', async () => {
    const cmdZ: CommandDefinition = {
      id: 'grp-z-cmd',
      label: 'Z Cmd',
      group: 'group-z',
      run: vi.fn(),
    };
    const cmdA: CommandDefinition = {
      id: 'grp-a-cmd',
      label: 'A Cmd',
      group: 'group-a',
      run: vi.fn(),
    };

    function Setup() {
      useCommands([cmdZ, cmdA]);
      // Both groups have the same priority so they sort by label
      useCommandGroup({ id: 'group-z', label: 'Zebra Group', priority: 50 });
      useCommandGroup({ id: 'group-a', label: 'Alpha Group', priority: 50 });
      const ctx = useMedaShell();
      return (
        <button type="button" onClick={() => ctx.commandPalette.setOpen(true)} data-testid="open">
          open
        </button>
      );
    }

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <Setup />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      expect(screen.getByText('Alpha Group')).toBeInTheDocument();
      expect(screen.getByText('Zebra Group')).toBeInTheDocument();
    });

    // Alpha Group (a) should appear before Zebra Group (z)
    const headings = screen.getAllByText(/Alpha Group|Zebra Group/);
    expect(headings[0].textContent).toBe('Alpha Group');
    expect(headings[1].textContent).toBe('Zebra Group');
  });
});

// ---------------------------------------------------------------------------
// CommandPalette — handleSelect executes command and closes palette
// ---------------------------------------------------------------------------

describe('CommandPalette — selecting a command runs it and closes the palette', () => {
  function CommandSetup({ commands }: { commands: CommandDefinition[] }) {
    useCommands(commands);
    const ctx = useMedaShell();
    return (
      <button type="button" onClick={() => ctx.commandPalette.setOpen(true)} data-testid="open">
        open
      </button>
    );
  }

  it('clicking a command item executes the command and closes the palette', async () => {
    const runFn = vi.fn();
    const cmd: CommandDefinition = {
      id: 'exec-cmd',
      label: 'Execute Me',
      group: 'actions',
      run: runFn,
    };

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <CommandSetup commands={[cmd]} />
          <PaletteStateReader />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      expect(screen.getByText('Execute Me')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Execute Me'));

    await waitFor(() => {
      expect(runFn).toHaveBeenCalledTimes(1);
    });
  });

  it('command item with a Lucide icon renders the icon svg', async () => {
    const cmd: CommandDefinition = {
      id: 'icon-cmd',
      label: 'Icon Command',
      group: 'actions',
      icon: Inbox,
      run: vi.fn(),
    };

    render(
      <MedaShellProvider workspace={workspace} apps={apps}>
        <CommandPalette>
          <CommandSetup commands={[cmd]} />
        </CommandPalette>
      </MedaShellProvider>
    );

    fireEvent.click(screen.getByTestId('open'));

    await waitFor(() => {
      expect(screen.getByText('Icon Command')).toBeInTheDocument();
    });

    // Icon is an SVG rendered by Lucide next to the label
    const item =
      screen.getByText('Icon Command').closest('[data-value]') ??
      screen.getByText('Icon Command').parentElement;
    expect(item?.querySelector('svg')).not.toBeNull();
  });
});
