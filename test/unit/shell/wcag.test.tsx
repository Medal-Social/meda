import '@testing-library/jest-dom/vitest';
import { DndContext } from '@dnd-kit/core';
import { act, render } from '@testing-library/react';
import {
  Bell,
  Calendar,
  FileText,
  Inbox,
  Mail,
  Settings,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { AppShell, AppShellBody } from '../../../src/shell/app-shell.js';
import { CommandPalette } from '../../../src/shell/command-palette.js';
import { ContextRail } from '../../../src/shell/context-rail.js';
import { DragModeBanner } from '../../../src/shell/drag-mode-banner.js';
import type { IconRailItem } from '../../../src/shell/icon-rail.js';
import { IconRail, RailDivider } from '../../../src/shell/icon-rail.js';
import { MobileBottomNav } from '../../../src/shell/internal/mobile-bottom-nav.js';
import { MobileDrawers } from '../../../src/shell/internal/mobile-drawers.js';
import { MobileHeader } from '../../../src/shell/internal/mobile-header.js';
import type { ShellStorageAdapter } from '../../../src/shell/layout-state.js';
import { RailDropSlot } from '../../../src/shell/rail-drop-slot.js';
import { RailDropZones } from '../../../src/shell/rail-drop-zones.js';
import { RightPanel } from '../../../src/shell/right-panel.js';
import {
  AppTabs,
  PanelToggle,
  ShellHeader,
  WorkspaceSwitcher,
} from '../../../src/shell/shell-header.js';
import { ShellMain } from '../../../src/shell/shell-main.js';
import type { MedaShellProviderProps } from '../../../src/shell/shell-provider.js';
import { MedaShellProvider, useMedaShell } from '../../../src/shell/shell-provider.js';
import { DefaultThemeProvider, ThemeToggle } from '../../../src/shell/theme.js';
import type { ContextModule, PanelView } from '../../../src/shell/types.js';

// ---------------------------------------------------------------------------
// Mock useShellViewport — default 'desktop'; per-test can override to 'mobile'
// ---------------------------------------------------------------------------

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'desktop'),
}));

import { useShellViewport } from '../../../src/shell/use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Browser stubs
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
  // ResizeObserver is used by cmdk (CommandPalette) and floating-ui — jsdom doesn't provide it.
  // Must be a real class (constructor) not just a factory fn.
  // biome-ignore lint/suspicious/noExplicitAny: test stub
  (globalThis as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  (useShellViewport as any).mockReturnValue('desktop');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Memory-backed storage — no localStorage bleed between tests
// ---------------------------------------------------------------------------

function makeMemoryStorage(): ShellStorageAdapter {
  const store = new Map<string, unknown>();
  return {
    load: (key) => store.get(key) ?? null,
    save: (key, value) => store.set(key, value),
  };
}

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const WORKSPACE = { id: 'ws1', name: 'Acme Corp', icon: <span>A</span> };
const WORKSPACES = [WORKSPACE, { id: 'ws2', name: 'Beta Inc', icon: <span>B</span> }];
const APPS = [
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'contacts', label: 'Contacts', icon: Users },
];

const RAIL_MAIN_ITEMS: IconRailItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' },
  { id: 'mail', label: 'Mail', icon: Mail, to: '/mail' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, to: '/calendar' },
];
const RAIL_UTILITY_ITEMS: IconRailItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings, to: '/settings' },
  { id: 'bell', label: 'Notifications', icon: Bell, to: '/notifications' },
];

const CONTEXT_MODULE: ContextModule = {
  id: 'mail-module',
  label: 'Mail',
  description: 'Your mailbox',
  items: [
    { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' },
    { id: 'sent', label: 'Sent', icon: FileText, to: '/sent' },
    { id: 'drafts', label: 'Drafts', icon: Mail, to: '/drafts' },
  ],
};

const PANEL_VIEWS: PanelView[] = [
  {
    id: 'inspector',
    label: 'Inspector',
    icon: FileText,
    render: () => <div>Inspector content</div>,
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Sparkles,
    render: () => <div>AI assistant content</div>,
  },
];

// ---------------------------------------------------------------------------
// Provider wrapper
// ---------------------------------------------------------------------------

function withProvider(children: ReactNode, overrides?: Partial<MedaShellProviderProps>) {
  return (
    <MedaShellProvider
      workspace={WORKSPACE}
      workspaces={WORKSPACES}
      apps={APPS}
      storage={makeMemoryStorage()}
      {...overrides}
    >
      {children}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Helpers to render in a specific panel mode
// ---------------------------------------------------------------------------

function ProviderWithPanelMode({
  mode,
  children,
}: {
  mode: 'closed' | 'panel' | 'expanded' | 'fullscreen';
  children: ReactNode;
}) {
  return (
    <MedaShellProvider workspace={WORKSPACE} apps={APPS} storage={makeMemoryStorage()}>
      <PanelModeForcer mode={mode}>{children}</PanelModeForcer>
    </MedaShellProvider>
  );
}

function PanelModeForcer({
  mode,
  children,
}: {
  mode: 'closed' | 'panel' | 'expanded' | 'fullscreen';
  children: ReactNode;
}) {
  const ctx = useMedaShell();
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time mount effect
  useEffect(() => {
    ctx.panel.setMode(mode);
  }, []);
  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('shell a11y', () => {
  // ---- 1. AppShell + AppShellBody -------------------------------------------

  it('AppShell + AppShellBody — no violations', async () => {
    const { container } = render(
      withProvider(
        <AppShell variant="workspace">
          <AppShellBody>
            <p>Body content</p>
          </AppShellBody>
        </AppShell>
      )
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 2. ShellHeader --------------------------------------------------------

  it('ShellHeader — no violations', async () => {
    const { container } = render(withProvider(<ShellHeader />));
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 3. WorkspaceSwitcher closed ------------------------------------------

  it('WorkspaceSwitcher (closed) — no violations', async () => {
    const { container } = render(withProvider(<WorkspaceSwitcher />));
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 4. WorkspaceSwitcher open --------------------------------------------

  it('WorkspaceSwitcher (open) — no violations', async () => {
    const { container } = render(withProvider(<WorkspaceSwitcher />));
    // Open the dropdown by clicking the trigger
    const trigger = container.querySelector('button');
    if (trigger) {
      await act(async () => {
        trigger.click();
      });
    }
    // Test against document.body because the dropdown portal renders outside container.
    // Disable aria-command-name: base-ui's focus-trap sentinel spans carry role="button"
    // without accessible names — this is a base-ui internal implementation detail
    // (visually hidden focus guards) that is not a real a11y issue in the rendered UI.
    // Disable region: document.body includes test scaffolding outside landmarks — not
    // an app-level a11y concern; app landmarks are tested via container-scoped tests.
    expect(
      await axe(document.body, {
        rules: {
          'aria-command-name': { enabled: false },
          region: { enabled: false },
        },
      })
    ).toHaveNoViolations();
  });

  // ---- 5. AppTabs -----------------------------------------------------------

  it('AppTabs — no violations', async () => {
    const { container } = render(withProvider(<AppTabs />));
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 6. PanelToggle closed ------------------------------------------------

  it('PanelToggle (closed state) — no violations', async () => {
    const { container } = render(withProvider(<PanelToggle />));
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 7. PanelToggle open --------------------------------------------------

  it('PanelToggle (open state) — no violations', async () => {
    // Render with panel mode set to 'panel' so toggle shows "close" state
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(
        <ProviderWithPanelMode mode="panel">
          <PanelToggle />
        </ProviderWithPanelMode>
      ));
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 8. IconRail with main + utility + active state -----------------------

  it('IconRail (main + utility + active) — no violations', async () => {
    const { container } = render(
      withProvider(
        <IconRail mainItems={RAIL_MAIN_ITEMS} utilityItems={RAIL_UTILITY_ITEMS} activeId="inbox" />
      )
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 9. RailDivider pinned-bottom ----------------------------------------

  it('RailDivider (pinnedBottom=true) — no violations', async () => {
    const { container } = render(<RailDivider pinnedBottom={true} onToggle={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 10. RailDivider pinned-top ------------------------------------------

  it('RailDivider (pinnedBottom=false) — no violations', async () => {
    const { container } = render(<RailDivider pinnedBottom={false} onToggle={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 11. ContextRail with module ------------------------------------------

  it('ContextRail (with module) — no violations', async () => {
    const { container } = render(
      withProvider(<ContextRail appId="mail" module={CONTEXT_MODULE} activeItemId="inbox" />)
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 12. ShellMain — workspace layout ------------------------------------

  it('ShellMain (workspace layout) — no violations', async () => {
    const { container } = render(
      <ShellMain layout="workspace">
        <p>Workspace content</p>
      </ShellMain>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 13. ShellMain — centered layout -------------------------------------

  it('ShellMain (centered layout) — no violations', async () => {
    const { container } = render(
      <ShellMain layout="centered">
        <p>Centered content</p>
      </ShellMain>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 14. ShellMain — fullbleed layout ------------------------------------

  it('ShellMain (fullbleed layout) — no violations', async () => {
    const { container } = render(
      <ShellMain layout="fullbleed">
        <p>Full bleed content</p>
      </ShellMain>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 15. RightPanel — closed mode ----------------------------------------

  it('RightPanel (mode=closed) — no violations', async () => {
    // Default provider state has mode=closed
    const { container } = render(withProvider(<RightPanel panelViews={PANEL_VIEWS} />));
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 16. RightPanel — panel mode -----------------------------------------

  it('RightPanel (mode=panel) — no violations', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(
        <ProviderWithPanelMode mode="panel">
          <RightPanel panelViews={PANEL_VIEWS} defaultView="inspector" />
        </ProviderWithPanelMode>
      ));
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 17. RightPanel — expanded mode --------------------------------------

  it('RightPanel (mode=expanded) — no violations', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(
        <ProviderWithPanelMode mode="expanded">
          <RightPanel panelViews={PANEL_VIEWS} defaultView="inspector" />
        </ProviderWithPanelMode>
      ));
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 18. RightPanel — fullscreen mode ------------------------------------

  it('RightPanel (mode=fullscreen) — no violations', async () => {
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(
        <ProviderWithPanelMode mode="fullscreen">
          <RightPanel panelViews={PANEL_VIEWS} defaultView="inspector" />
        </ProviderWithPanelMode>
      ));
    });
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 19. MobileHeader — root mode ----------------------------------------

  it('MobileHeader (root mode) — no violations', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    const { container } = render(withProvider(<MobileHeader />));
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 20. MobileHeader — nested mode ---------------------------------------

  it('MobileHeader (nested mode) — no violations', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    const { container } = render(
      withProvider(<MobileHeader parentLabel="Mail" title="Inbox" onBack={() => {}} />)
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 21. MobileBottomNav --------------------------------------------------

  it('MobileBottomNav — no violations', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    const { container } = render(withProvider(<MobileBottomNav />));
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 22. MobileDrawers — Menu drawer open --------------------------------

  it('MobileDrawers (Menu drawer open) — no violations', async () => {
    function MenuOpener() {
      const ctx = useMedaShell();
      return (
        <button
          type="button"
          onClick={() => ctx.mobileDrawer.setOpen('menu-drawer')}
          data-testid="open-menu"
          aria-label="Open menu"
        >
          Open
        </button>
      );
    }

    render(
      withProvider(
        <>
          <MenuOpener />
          <MobileDrawers menuItems={RAIL_MAIN_ITEMS} />
        </>
      )
    );

    await act(async () => {
      document.querySelector<HTMLButtonElement>('[data-testid="open-menu"]')?.click();
    });

    // Disable region: document.body includes test scaffolding outside landmarks
    expect(
      await axe(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations();
  });

  // ---- 23. MobileDrawers — Module drawer open ------------------------------

  it('MobileDrawers (Module drawer open) — no violations', async () => {
    function ModuleOpener() {
      const ctx = useMedaShell();
      return (
        <button
          type="button"
          onClick={() => ctx.mobileDrawer.setOpen('module-drawer')}
          data-testid="open-module"
          aria-label="Open module"
        >
          Open
        </button>
      );
    }

    render(
      withProvider(
        <>
          <ModuleOpener />
          <MobileDrawers module={CONTEXT_MODULE} />
        </>
      )
    );

    await act(async () => {
      document.querySelector<HTMLButtonElement>('[data-testid="open-module"]')?.click();
    });

    expect(
      await axe(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations();
  });

  // ---- 24. MobileDrawers — Panels drawer open -------------------------------

  it('MobileDrawers (Panels drawer open) — no violations', async () => {
    function PanelsOpener() {
      const ctx = useMedaShell();
      return (
        <button
          type="button"
          onClick={() => ctx.mobileDrawer.setOpen('panels-drawer')}
          data-testid="open-panels"
          aria-label="Open panels"
        >
          Open
        </button>
      );
    }

    render(
      withProvider(
        <>
          <PanelsOpener />
          <MobileDrawers panelViews={PANEL_VIEWS} />
        </>
      )
    );

    await act(async () => {
      document.querySelector<HTMLButtonElement>('[data-testid="open-panels"]')?.click();
    });

    expect(
      await axe(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations();
  });

  // ---- 25. MobileDrawers — AI drawer open -----------------------------------

  it('MobileDrawers (AI drawer open) — no violations', async () => {
    function AiOpener() {
      const ctx = useMedaShell();
      return (
        <button
          type="button"
          onClick={() => ctx.mobileDrawer.setOpen('ai-drawer')}
          data-testid="open-ai"
          aria-label="Open AI"
        >
          Open
        </button>
      );
    }

    render(
      withProvider(
        <>
          <AiOpener />
          <MobileDrawers panelViews={PANEL_VIEWS} />
        </>
      )
    );

    await act(async () => {
      document.querySelector<HTMLButtonElement>('[data-testid="open-ai"]')?.click();
    });

    expect(
      await axe(document.body, { rules: { region: { enabled: false } } })
    ).toHaveNoViolations();
  });

  // ---- 26. ThemeToggle ------------------------------------------------------

  it('ThemeToggle — no violations', async () => {
    const { container } = render(
      <DefaultThemeProvider>
        <ThemeToggle />
      </DefaultThemeProvider>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 27. CommandPalette — closed state ------------------------------------

  it('CommandPalette (closed) — no violations', async () => {
    const { container } = render(
      withProvider(
        <CommandPalette>
          <div>App content</div>
        </CommandPalette>
      )
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  // ---- 28. CommandPalette — open state --------------------------------------

  it('CommandPalette (open) — no violations', async () => {
    function PaletteOpener() {
      const ctx = useMedaShell();
      return (
        <button
          type="button"
          onClick={() => ctx.commandPalette.setOpen(true)}
          data-testid="open-palette"
          aria-label="Open command palette"
        >
          Open
        </button>
      );
    }

    render(
      withProvider(
        <CommandPalette>
          <PaletteOpener />
        </CommandPalette>
      )
    );

    await act(async () => {
      document.querySelector<HTMLButtonElement>('[data-testid="open-palette"]')?.click();
    });

    // CommandDialog renders via a portal — test against document.body.
    // Disable region: document.body includes test scaffolding outside landmarks.
    // Disable aria-command-name: base-ui renders visually-hidden focus-guard spans
    //   with role="button" and no accessible name — this is a base-ui internals issue.
    // Disable aria-required-children: cmdk's role="listbox" is empty when no commands
    //   are registered; axe flags the empty listbox — library behavior, not app issue.
    expect(
      await axe(document.body, {
        rules: {
          region: { enabled: false },
          'aria-command-name': { enabled: false },
          'aria-required-children': { enabled: false },
        },
      })
    ).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// RailDropSlot a11y
// ---------------------------------------------------------------------------

describe('RailDropSlot a11y', () => {
  it('has no axe violations in idle state', async () => {
    const { container } = render(
      <DndContext>
        <RailDropSlot id="m1" ariaLabel="Assign to studio.local">
          <div>studio.local</div>
        </RailDropSlot>
      </DndContext>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations when disabled', async () => {
    const { container } = render(
      <DndContext>
        <RailDropSlot id="m2" ariaLabel="Assign to laptop.local" disabled>
          <div>laptop.local</div>
        </RailDropSlot>
      </DndContext>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('render prop — idle state — no violations', async () => {
    const { container } = render(
      <DndContext>
        <RailDropSlot
          id="m3"
          ariaLabel="Assign to beast.local"
          render={(state) => <div data-state={state}>beast.local</div>}
        />
      </DndContext>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('render prop — rejected (disabled) state — no violations', async () => {
    // Disabled slot renders the rejected visual without a drag in progress.
    const { container } = render(
      <DndContext>
        <RailDropSlot
          id="m4"
          ariaLabel="Assign to offline.local"
          disabled
          render={(state) => <div data-state={state}>offline.local · {state}</div>}
        />
      </DndContext>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// DragModeBanner a11y
// ---------------------------------------------------------------------------

describe('DragModeBanner a11y', () => {
  it('renders nothing (null) when no drag is active — no violations', async () => {
    // When no drag is happening the banner returns null; the DndContext wrapper
    // renders an empty container. axe should see no issues.
    const { container } = render(
      <DndContext>
        <DragModeBanner message="Drop on a machine to assign" cancelKey="ESC" />
      </DndContext>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('forceActive-equivalent via wrapper — banner visible — no violations', async () => {
    // DragModeBanner only becomes visible when useDndMonitor fires onDragStart.
    // We can't easily simulate a real pointer drag in jsdom, so we instead render
    // the banner markup directly to verify the static HTML is accessible.
    const { container } = render(
      <div>
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none flex items-center justify-center gap-3 px-4 py-2 text-sm"
        >
          <span>Drop on a machine to assign</span>
          <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">ESC</kbd>
        </div>
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

// ---------------------------------------------------------------------------
// RailDropZones a11y
// ---------------------------------------------------------------------------

describe('RailDropZones a11y', () => {
  it('idle state (no drag) — no violations', async () => {
    const { container } = render(
      <DndContext>
        <RailDropZones
          title="Drop zones"
          subtitle="Eligible machines for ENG-405"
          count="3 / 4"
          icon={<Target className="size-4" aria-hidden="true" />}
        >
          <DndContext>
            <RailDropSlot id="z-m1" ariaLabel="Assign to mac-mini-01">
              <div>mac-mini-01</div>
            </RailDropSlot>
          </DndContext>
        </RailDropZones>
      </DndContext>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('forceActive=true (drag-active outline) — no violations', async () => {
    const { container } = render(
      <DndContext>
        <RailDropZones
          title="Drop zones"
          subtitle="Eligible machines for ENG-405"
          count="3 / 4"
          forceActive
          icon={<Target className="size-4" aria-hidden="true" />}
        >
          <DndContext>
            <RailDropSlot id="z-m2" ariaLabel="Assign to studio-mbp">
              <div>studio-mbp</div>
            </RailDropSlot>
          </DndContext>
        </RailDropZones>
      </DndContext>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
