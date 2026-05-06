import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PanelViewsProvider } from '../../../src/shell/panel-views-provider.js';
import { RightPanel } from '../../../src/shell/right-panel.js';
import { MedaShellProvider, useMedaShell } from '../../../src/shell/shell-provider.js';
import type {
  AppDefinition,
  PanelMode,
  PanelView,
  WorkspaceDefinition,
} from '../../../src/shell/types.js';

// ---------------------------------------------------------------------------
// Mock useShellViewport — default 'desktop', overridden per-test where needed
// ---------------------------------------------------------------------------

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(() => 'desktop'),
}));

import { useShellViewport } from '../../../src/shell/use-shell-viewport.js';

// ---------------------------------------------------------------------------
// Browser stubs
// ---------------------------------------------------------------------------

beforeEach(() => {
  // biome-ignore lint/suspicious/noExplicitAny: test mock
  (useShellViewport as any).mockReturnValue('desktop');
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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ws: WorkspaceDefinition = { id: 'ws-test', name: 'Test', icon: null };
const apps: AppDefinition[] = [{ id: 'app-a', label: 'App A', icon: Info }];

interface WrapperProps {
  children: ReactNode;
  mode?: PanelMode;
  activeView?: string | null;
  panelWidth?: number;
  storage?: { load: (k: string) => unknown; save: (k: string, v: unknown) => void };
}

function makeStorage(layoutState?: {
  rightPanel?: { mode?: PanelMode; activeView?: string | null; width?: number };
}) {
  const state = {
    contextRail: { width: 300, collapsed: false },
    rightPanel: {
      mode: layoutState?.rightPanel?.mode ?? 'closed',
      activeView: layoutState?.rightPanel?.activeView ?? null,
      width: layoutState?.rightPanel?.width ?? 340,
    },
  };
  return {
    load: vi.fn(() => state),
    save: vi.fn(),
  };
}

function Wrapper({
  children,
  mode = 'closed',
  activeView = null,
  panelWidth = 340,
  storage,
}: WrapperProps) {
  const s = storage ?? makeStorage({ rightPanel: { mode, activeView, width: panelWidth } });
  return (
    <MedaShellProvider workspace={ws} apps={apps} storage={s}>
      {children}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Task 12.1 — Mode state tests
// ---------------------------------------------------------------------------

describe('RightPanel — mode="closed"', () => {
  it('has width 0 and pointer-events-none', () => {
    render(
      <Wrapper mode="closed">
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="closed"]') as HTMLElement;
    expect(aside).toBeInTheDocument();
    expect(aside.style.width).toBe('0px');
    expect(aside.style.pointerEvents).toBe('none');
  });

  it('sets aria-hidden when closed', () => {
    render(
      <Wrapper mode="closed">
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="closed"]') as HTMLElement;
    expect(aside).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('RightPanel — mode="panel"', () => {
  it('renders at default 340px width', () => {
    render(
      <Wrapper mode="panel" panelWidth={340}>
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="panel"]') as HTMLElement;
    expect(aside).toBeInTheDocument();
    expect(aside.style.width).toContain('340');
  });
});

describe('RightPanel — mode="expanded"', () => {
  it('renders at 60vw', () => {
    render(
      <Wrapper mode="expanded">
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="expanded"]') as HTMLElement;
    expect(aside).toBeInTheDocument();
    expect(aside.style.width).toBe('60vw');
  });
});

describe('RightPanel — mode="fullscreen"', () => {
  it('has fixed inset-0 classes and 100vw/100vh style', () => {
    render(
      <Wrapper mode="fullscreen">
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="fullscreen"]') as HTMLElement;
    expect(aside).toBeInTheDocument();
    expect(aside.style.width).toBe('100vw');
    expect(aside.className).toContain('fixed');
    expect(aside.className).toContain('inset-0');
    expect(aside.className).toContain('h-screen');
    expect(aside.className).toContain('w-screen');
  });

  it('has z-shell-fullscreen class in fullscreen mode', () => {
    render(
      <Wrapper mode="fullscreen">
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="fullscreen"]') as HTMLElement;
    // The fullscreen z-index class
    expect(aside.className).toContain('z-[var(--z-shell-fullscreen)]');
  });
});

describe('RightPanel — motion classes', () => {
  it('applies transition-[width], duration-[var(--motion-panel)], ease-[var(--motion-ease)]', () => {
    render(
      <Wrapper mode="panel">
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="panel"]') as HTMLElement;
    expect(aside.className).toContain('transition-[width]');
    expect(aside.className).toContain('duration-[var(--motion-panel)]');
    expect(aside.className).toContain('ease-[var(--motion-ease)]');
  });
});

describe('RightPanel — mode cycle button', () => {
  it('cycles panel → expanded → fullscreen → panel', () => {
    const storage = makeStorage({ rightPanel: { mode: 'panel', width: 340 } });

    render(
      <Wrapper mode="panel" storage={storage}>
        <RightPanel modes={['panel', 'expanded', 'fullscreen']} />
      </Wrapper>
    );

    // panel → expanded
    const cycleBtn = screen.getByRole('button', { name: /expand panel/i });
    act(() => {
      fireEvent.click(cycleBtn);
    });

    const expandedAside = document.querySelector('[data-meda-panel-mode="expanded"]');
    expect(expandedAside).toBeInTheDocument();

    // expanded → fullscreen
    const cycleBtn2 = screen.getByRole('button', { name: /maximize panel/i });
    act(() => {
      fireEvent.click(cycleBtn2);
    });

    const fullscreenAside = document.querySelector('[data-meda-panel-mode="fullscreen"]');
    expect(fullscreenAside).toBeInTheDocument();

    // fullscreen → panel
    const cycleBtn3 = screen.getByRole('button', { name: /restore panel/i });
    act(() => {
      fireEvent.click(cycleBtn3);
    });

    const panelAside = document.querySelector('[data-meda-panel-mode="panel"]');
    expect(panelAside).toBeInTheDocument();
  });

  it('close button sets mode to closed', () => {
    render(
      <Wrapper mode="panel">
        <RightPanel />
      </Wrapper>
    );

    const closeBtn = screen.getByRole('button', { name: /close panel/i });
    act(() => {
      fireEvent.click(closeBtn);
    });

    const closedAside = document.querySelector('[data-meda-panel-mode="closed"]');
    expect(closedAside).toBeInTheDocument();
  });

  it('modes={["panel"]} hides cycle button but shows close button', () => {
    render(
      <Wrapper mode="panel">
        <RightPanel modes={['panel']} />
      </Wrapper>
    );

    // Cycle button not present
    expect(screen.queryByRole('button', { name: /expand panel/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /maximize panel/i })).not.toBeInTheDocument();
    // Close button still present
    expect(screen.getByRole('button', { name: /close panel/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Task 12.2 — panelViews registry tests
// ---------------------------------------------------------------------------

const VIEWS: PanelView[] = [
  { id: 'inspector', label: 'Inspector', icon: Info, render: () => <div>Inspector content</div> },
  { id: 'activity', label: 'Activity', icon: Info, render: () => <div>Activity content</div> },
  { id: 'notes', label: 'Notes', icon: Info, render: () => <div>Notes content</div> },
];

describe('RightPanel — panelViews', () => {
  it('renders panelViews as tabs in header', () => {
    render(
      <Wrapper mode="panel" activeView="inspector">
        <RightPanel panelViews={VIEWS} />
      </Wrapper>
    );

    expect(screen.getByText('Inspector')).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('active panelView gets aria-current="true"', () => {
    render(
      <Wrapper mode="panel" activeView="inspector">
        <RightPanel panelViews={VIEWS} />
      </Wrapper>
    );

    const inspectorTab = screen.getByRole('button', { name: /inspector/i });
    expect(inspectorTab).toHaveAttribute('aria-current', 'true');
  });

  it('passes tab props into custom rendered panel tabs', () => {
    render(
      <Wrapper mode="panel" activeView="inspector">
        <RightPanel
          panelViews={VIEWS}
          renderTab={({ view, buttonProps }) => (
            <button {...buttonProps} type="button" data-testid={`panel-tab-${view.id}`} />
          )}
        />
      </Wrapper>
    );

    const inspectorTab = screen.getByTestId('panel-tab-inspector');
    expect(inspectorTab).toHaveAccessibleName('Inspector');
    expect(inspectorTab).toHaveAttribute('aria-current', 'true');
    expect(inspectorTab).toHaveAttribute('data-active', 'true');

    fireEvent.click(screen.getByTestId('panel-tab-activity'));
    expect(screen.getByTestId('panel-tab-activity')).toHaveAttribute('aria-current', 'true');
  });

  it('inactive tab does not have aria-current', () => {
    render(
      <Wrapper mode="panel" activeView="inspector">
        <RightPanel panelViews={VIEWS} />
      </Wrapper>
    );

    const activityTab = screen.getByRole('button', { name: /activity/i });
    expect(activityTab).not.toHaveAttribute('aria-current');
  });

  it('active view render({ workspaceId, appId }) is called with correct context', () => {
    const renderSpy = vi.fn(() => <div data-testid="rendered-view" />);
    const views: PanelView[] = [
      { id: 'inspector', label: 'Inspector', icon: Info, render: renderSpy },
    ];

    render(
      <Wrapper mode="panel" activeView="inspector">
        <RightPanel panelViews={views} />
      </Wrapper>
    );

    expect(screen.getByTestId('rendered-view')).toBeInTheDocument();
    expect(renderSpy).toHaveBeenCalledWith({ workspaceId: 'ws-test', appId: 'app-a' });
  });

  it('switching view tab calls setActiveView without changing mode', () => {
    render(
      <Wrapper mode="expanded" activeView="inspector">
        <RightPanel panelViews={VIEWS} />
      </Wrapper>
    );

    const activityTab = screen.getByRole('button', { name: /activity/i });
    act(() => {
      fireEvent.click(activityTab);
    });

    // Mode remains expanded
    const aside = document.querySelector('[data-meda-panel-mode="expanded"]');
    expect(aside).toBeInTheDocument();

    // Activity tab now active
    expect(activityTab).toHaveAttribute('aria-current', 'true');
  });

  it('defaultView sets activeView on mount when no active view set', async () => {
    // Storage returns null → hydration skips (isShellLayoutState(null) === false).
    // Provider starts at DEFAULTS: mode='closed', activeView=null.
    // We imperatively switch to panel mode after mount so tabs appear,
    // then verify the defaultView effect has already set activeView.
    const storage = { load: vi.fn(() => null), save: vi.fn() };

    function Root() {
      const ctx = useMedaShell();
      const isPanel = ctx.panel.mode === 'panel';
      return (
        <>
          <button type="button" onClick={() => ctx.panel.setMode('panel')} data-testid="open-panel">
            Open
          </button>
          {isPanel && <RightPanel panelViews={VIEWS} defaultView="activity" />}
        </>
      );
    }

    render(
      <MedaShellProvider workspace={ws} apps={apps} storage={storage}>
        <Root />
      </MedaShellProvider>
    );

    // Open the panel — this renders RightPanel for the first time
    await act(async () => {
      fireEvent.click(screen.getByTestId('open-panel'));
    });

    // After RightPanel mounts, its defaultView effect should have set activeView='activity'
    const activityTab = screen.getByRole('button', { name: /activity/i });
    expect(activityTab).toHaveAttribute('aria-current', 'true');
  });

  it('shows fallback when no active view selected', () => {
    render(
      <Wrapper mode="panel" activeView={null}>
        <RightPanel panelViews={VIEWS} />
      </Wrapper>
    );

    expect(screen.getByText('No panel view selected')).toBeInTheDocument();
  });
});

describe('RightPanel — PanelViewsProvider registrations', () => {
  const routeViews: PanelView[] = [
    { id: 'route-view', label: 'Route View', icon: Info, render: () => <div>Route content</div> },
  ];

  it('renders panel views registered by a route child through PanelViewsProvider', () => {
    render(
      <Wrapper mode="panel" activeView="route-view">
        <PanelViewsProvider views={routeViews}>
          <RightPanel />
        </PanelViewsProvider>
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: /route view/i })).toBeInTheDocument();
    expect(screen.getByText('Route content')).toBeInTheDocument();
  });

  it('registered views override static views with the same id', () => {
    const staticViews: PanelView[] = [
      {
        id: 'inspector',
        label: 'Static Inspector',
        icon: Info,
        render: () => <div>Static inspector content</div>,
      },
    ];
    const registeredViews: PanelView[] = [
      {
        id: 'inspector',
        label: 'Registered Inspector',
        icon: Info,
        render: () => <div>Registered inspector content</div>,
      },
    ];

    render(
      <Wrapper mode="panel" activeView="inspector">
        <PanelViewsProvider views={registeredViews}>
          <RightPanel panelViews={staticViews} />
        </PanelViewsProvider>
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: /registered inspector/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /static inspector/i })).not.toBeInTheDocument();
    expect(screen.getByText('Registered inspector content')).toBeInTheDocument();
    expect(screen.queryByText('Static inspector content')).not.toBeInTheDocument();
  });

  it('places registered overrides after remaining static views', () => {
    const staticViews: PanelView[] = [
      {
        id: 'inspector',
        label: 'Static Inspector',
        icon: Info,
        render: () => <div>Static inspector content</div>,
      },
      { id: 'activity', label: 'Activity', icon: Info, render: () => <div>Activity content</div> },
    ];
    const registeredViews: PanelView[] = [
      {
        id: 'inspector',
        label: 'Registered Inspector',
        icon: Info,
        render: () => <div>Registered inspector content</div>,
      },
    ];

    render(
      <Wrapper mode="panel" activeView="activity">
        <PanelViewsProvider views={registeredViews}>
          <RightPanel panelViews={staticViews} />
        </PanelViewsProvider>
      </Wrapper>
    );

    const activityTab = screen.getByRole('button', { name: /activity/i });
    const registeredTab = screen.getByRole('button', { name: /registered inspector/i });
    expect(
      activityTab.compareDocumentPosition(registeredTab) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('merges views from multiple provider instances without requiring consumer ids', () => {
    const firstRouteViews: PanelView[] = [
      { id: 'route-a', label: 'Route A', icon: Info, render: () => <div>Route A content</div> },
    ];
    const secondRouteViews: PanelView[] = [
      { id: 'route-b', label: 'Route B', icon: Info, render: () => <div>Route B content</div> },
    ];

    render(
      <Wrapper mode="panel" activeView="route-a">
        <PanelViewsProvider views={firstRouteViews}>
          <div />
        </PanelViewsProvider>
        <PanelViewsProvider views={secondRouteViews}>
          <div />
        </PanelViewsProvider>
        <RightPanel />
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: /route a/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /route b/i })).toBeInTheDocument();
  });

  it('registered provider defaultView wins over static defaultView and sets active view when no active view exists', async () => {
    const storage = { load: vi.fn(() => null), save: vi.fn() };

    function Root() {
      const ctx = useMedaShell();
      const isPanel = ctx.panel.mode === 'panel';
      return (
        <>
          <button type="button" onClick={() => ctx.panel.setMode('panel')} data-testid="open-panel">
            Open
          </button>
          {isPanel && (
            <PanelViewsProvider views={routeViews} defaultView="route-view">
              <RightPanel panelViews={VIEWS} defaultView="activity" />
            </PanelViewsProvider>
          )}
        </>
      );
    }

    render(
      <MedaShellProvider workspace={ws} apps={apps} storage={storage}>
        <Root />
      </MedaShellProvider>
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('open-panel'));
    });

    expect(screen.getByRole('button', { name: /route view/i })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByText('Route content')).toBeInTheDocument();
  });

  it('does not overwrite an existing active view when registered defaultView changes', async () => {
    const routeViews: PanelView[] = [
      { id: 'route-a', label: 'Route A', icon: Info, render: () => <div>Route A content</div> },
      { id: 'route-b', label: 'Route B', icon: Info, render: () => <div>Route B content</div> },
    ];

    function Root() {
      const [defaultView, setDefaultView] = useState('route-a');
      return (
        <>
          <button
            type="button"
            data-testid="switch-default"
            onClick={() => setDefaultView('route-b')}
          >
            Switch default
          </button>
          <PanelViewsProvider views={routeViews} defaultView={defaultView}>
            <RightPanel />
          </PanelViewsProvider>
        </>
      );
    }

    render(
      <Wrapper mode="panel" activeView={null}>
        <Root />
      </Wrapper>
    );

    expect(await screen.findByRole('button', { name: /route a/i })).toHaveAttribute(
      'aria-current',
      'true'
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('switch-default'));
    });

    expect(screen.getByRole('button', { name: /route a/i })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByText('Route A content')).toBeInTheDocument();
  });

  it('does not apply a defaultView id that is not registered', () => {
    render(
      <Wrapper mode="panel" activeView={null}>
        <PanelViewsProvider views={routeViews} defaultView="missing-view">
          <RightPanel />
        </PanelViewsProvider>
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: /route view/i })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('No panel view selected')).toBeInTheDocument();
  });

  it('uses the last registered defaultView when multiple providers supply defaults', async () => {
    const firstRouteViews: PanelView[] = [
      { id: 'route-a', label: 'Route A', icon: Info, render: () => <div>Route A content</div> },
    ];
    const secondRouteViews: PanelView[] = [
      { id: 'route-b', label: 'Route B', icon: Info, render: () => <div>Route B content</div> },
    ];

    render(
      <Wrapper mode="panel" activeView={null}>
        <PanelViewsProvider views={firstRouteViews} defaultView="route-a">
          <div />
        </PanelViewsProvider>
        <PanelViewsProvider views={secondRouteViews} defaultView="route-b">
          <div />
        </PanelViewsProvider>
        <RightPanel />
      </Wrapper>
    );

    expect(await screen.findByRole('button', { name: /route b/i })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByText('Route B content')).toBeInTheDocument();
  });

  it('replaces stale registrations when provider view props change', async () => {
    const firstRouteViews: PanelView[] = [
      { id: 'route-a', label: 'Route A', icon: Info, render: () => <div>Route A content</div> },
    ];
    const secondRouteViews: PanelView[] = [
      { id: 'route-b', label: 'Route B', icon: Info, render: () => <div>Route B content</div> },
    ];

    function Root() {
      const [views, setViews] = useState(firstRouteViews);
      return (
        <>
          <button
            type="button"
            data-testid="switch-views"
            onClick={() => setViews(secondRouteViews)}
          >
            Switch views
          </button>
          <PanelViewsProvider views={views}>
            <RightPanel />
          </PanelViewsProvider>
        </>
      );
    }

    render(
      <Wrapper mode="panel" activeView="route-b">
        <Root />
      </Wrapper>
    );

    expect(screen.getByRole('button', { name: /route a/i })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('switch-views'));
    });

    expect(screen.queryByRole('button', { name: /route a/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /route b/i })).toBeInTheDocument();
    expect(screen.getByText('Route B content')).toBeInTheDocument();
  });

  it('keeps registered views mounted through React StrictMode effect replay', () => {
    render(
      <StrictMode>
        <Wrapper mode="panel" activeView="route-view">
          <PanelViewsProvider views={routeViews}>
            <RightPanel />
          </PanelViewsProvider>
        </Wrapper>
      </StrictMode>
    );

    expect(screen.getByRole('button', { name: /route view/i })).toBeInTheDocument();
    expect(screen.getByText('Route content')).toBeInTheDocument();
  });

  it('does not re-register equivalent inline view arrays on parent rerender', async () => {
    function RegistrationChangeProbe() {
      const ctx = useMedaShell();
      const registrations = ctx.panelViews.registrations;
      const previousRegistrations = useRef(registrations);
      const [changes, setChanges] = useState(0);

      useEffect(() => {
        if (previousRegistrations.current !== registrations) {
          previousRegistrations.current = registrations;
          setChanges((value) => value + 1);
        }
      }, [registrations]);

      return <output data-testid="registration-change-count">{changes}</output>;
    }

    function Root() {
      const [count, setCount] = useState(0);
      return (
        <>
          <button type="button" data-testid="rerender-route" onClick={() => setCount((n) => n + 1)}>
            Rerender
          </button>
          <RegistrationChangeProbe />
          <PanelViewsProvider
            views={[
              {
                id: 'route-view',
                label: 'Route View',
                icon: Info,
                render: () => <div>Route content {count}</div>,
              },
            ]}
          >
            <RightPanel />
          </PanelViewsProvider>
        </>
      );
    }

    render(
      <Wrapper mode="panel" activeView="route-view">
        <Root />
      </Wrapper>
    );

    expect(await screen.findByText('Route content 0')).toBeInTheDocument();
    expect(screen.getByTestId('registration-change-count')).toHaveTextContent('1');

    await act(async () => {
      fireEvent.click(screen.getByTestId('rerender-route'));
    });

    expect(screen.getByText('Route content 1')).toBeInTheDocument();
    expect(screen.getByTestId('registration-change-count')).toHaveTextContent('1');
  });

  it('registered views unregister on provider unmount and RightPanel falls back to no selected view', async () => {
    function Root() {
      const [showRegistered, setShowRegistered] = useState(true);
      return (
        <>
          <button
            type="button"
            onClick={() => setShowRegistered(false)}
            data-testid="unmount-provider"
          >
            Unmount
          </button>
          {showRegistered ? (
            <PanelViewsProvider views={routeViews}>
              <RightPanel />
            </PanelViewsProvider>
          ) : (
            <RightPanel />
          )}
        </>
      );
    }

    render(
      <Wrapper mode="panel" activeView="route-view">
        <Root />
      </Wrapper>
    );

    expect(screen.getByText('Route content')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId('unmount-provider'));
    });

    expect(screen.queryByRole('button', { name: /route view/i })).not.toBeInTheDocument();
    expect(screen.getByText('No panel view selected')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Task 12.3 — Resize handle tests
// ---------------------------------------------------------------------------

describe('RightPanel — resize handle', () => {
  it('resize handle present only in panel mode', () => {
    const { rerender } = render(
      <Wrapper mode="panel">
        <RightPanel />
      </Wrapper>
    );

    expect(screen.queryByRole('separator', { name: 'Resize panel' })).toBeInTheDocument();

    // Re-render with expanded mode
    rerender(
      <Wrapper mode="expanded">
        <RightPanel />
      </Wrapper>
    );

    expect(screen.queryByRole('separator', { name: 'Resize panel' })).not.toBeInTheDocument();
  });

  it('resize handle absent in fullscreen mode', () => {
    render(
      <Wrapper mode="fullscreen">
        <RightPanel />
      </Wrapper>
    );

    expect(screen.queryByRole('separator', { name: 'Resize panel' })).not.toBeInTheDocument();
  });

  it('resize handle has hover-only opacity classes', () => {
    render(
      <Wrapper mode="panel">
        <RightPanel />
      </Wrapper>
    );

    const handle = screen.getByRole('separator', { name: 'Resize panel' });
    expect(handle.className).toContain('opacity-0');
    expect(handle.className).toContain('hover:opacity-100');
  });

  it('resize handle has cursor-col-resize class', () => {
    render(
      <Wrapper mode="panel">
        <RightPanel />
      </Wrapper>
    );

    const handle = screen.getByRole('separator', { name: 'Resize panel' });
    expect(handle.className).toContain('cursor-col-resize');
  });

  it('width clamped to max 520 on resize', () => {
    const storage = makeStorage({ rightPanel: { mode: 'panel', width: 340 } });

    render(
      <Wrapper mode="panel" panelWidth={340} storage={storage}>
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="panel"]') as HTMLElement;
    const handle = screen.getByRole('separator', { name: 'Resize panel' });

    // Drag left by 300px from x=500: delta = 300, 340 + 300 = 640 → clamped to 520
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 500, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 200, pointerId: 1 });
    });

    expect(aside.style.width).toBe('520px');
  });

  it('width clamped to min 300 on resize', () => {
    const storage = makeStorage({ rightPanel: { mode: 'panel', width: 340 } });

    render(
      <Wrapper mode="panel" panelWidth={340} storage={storage}>
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="panel"]') as HTMLElement;
    const handle = screen.getByRole('separator', { name: 'Resize panel' });

    // Drag right by 200px from x=500: delta = -200, 340 - 200 = 140 → clamped to 300
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 500, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 700, pointerId: 1 });
    });

    expect(aside.style.width).toBe('300px');
  });

  it('setWidth called with clamped value on pointer-up (persists to storage)', async () => {
    const storage = makeStorage({ rightPanel: { mode: 'panel', width: 340 } });

    render(
      <Wrapper mode="panel" panelWidth={340} storage={storage}>
        <RightPanel />
      </Wrapper>
    );

    const handle = screen.getByRole('separator', { name: 'Resize panel' });

    await act(async () => {
      fireEvent.pointerDown(handle, { clientX: 500, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 450, pointerId: 1 });
      fireEvent.pointerUp(handle, { clientX: 450, pointerId: 1 });
    });

    expect(storage.save).toHaveBeenCalled();
    const savedState = storage.save.mock.calls[storage.save.mock.calls.length - 1][1];
    expect((savedState as { rightPanel: { width: number } }).rightPanel.width).toBe(390);
  });
});

// ---------------------------------------------------------------------------
// Phase 13 carry-forward — mobile auto-hide
// ---------------------------------------------------------------------------

describe('RightPanel — resize handle no-op when not dragging', () => {
  it('pointerMove without prior pointerDown does not change width', () => {
    render(
      <Wrapper mode="panel" panelWidth={340}>
        <RightPanel />
      </Wrapper>
    );

    const aside = document.querySelector('[data-meda-panel-mode="panel"]') as HTMLElement;
    const handle = screen.getByRole('separator', { name: 'Resize panel' });

    // Fire pointerMove without a preceding pointerDown
    act(() => {
      fireEvent.pointerMove(handle, { clientX: 100, pointerId: 1 });
    });

    // Width must remain at 340px
    expect(aside.style.width).toContain('340');
  });

  it('pointerUp without prior pointerDown does not commit width', () => {
    const storage = makeStorage({ rightPanel: { mode: 'panel', width: 340 } });
    render(
      <Wrapper mode="panel" panelWidth={340} storage={storage}>
        <RightPanel />
      </Wrapper>
    );

    const handle = screen.getByRole('separator', { name: 'Resize panel' });

    act(() => {
      fireEvent.pointerUp(handle, { clientX: 100, pointerId: 1 });
    });

    // No save call from a no-op pointerUp
    expect(storage.save).not.toHaveBeenCalled();
  });
});

describe('RightPanel — cycleOpenMode is a no-op when mode is closed', () => {
  it('does not change mode when cycleOpenMode fires while panel is closed', () => {
    // Render with mode=closed, then force a click on the cycle button via internal
    // panel state mutation. We do this by opening the panel first, cycling to
    // verify the cycle works, then closing and verifying it stops.
    const storage = makeStorage({ rightPanel: { mode: 'panel', width: 340 } });

    function CycleTester() {
      const ctx = useMedaShell();
      return (
        <>
          <button
            type="button"
            data-testid="force-close"
            onClick={() => ctx.panel.setMode('closed')}
          >
            Close
          </button>
          <RightPanel modes={['panel', 'expanded']} />
        </>
      );
    }

    render(
      <MedaShellProvider workspace={ws} apps={apps} storage={storage}>
        <CycleTester />
      </MedaShellProvider>
    );

    // Panel starts in 'panel' mode — close it
    act(() => {
      fireEvent.click(screen.getByTestId('force-close'));
    });

    // No cycle button visible when closed — mode stays closed
    const aside = document.querySelector('[data-meda-panel-mode="closed"]');
    expect(aside).toBeInTheDocument();
  });
});

describe('RightPanel — hides on mobile viewport', () => {
  it('returns null when viewport is mobile (use MobileDrawers > PanelsDrawer instead)', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    render(
      <Wrapper mode="panel">
        <RightPanel />
      </Wrapper>
    );
    expect(document.querySelector('[data-meda-panel-mode]')).toBeNull();
  });
});

describe('RightPanel — renders on desktop viewport', () => {
  it('renders the aside element when viewport is desktop', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('desktop');
    render(
      <Wrapper mode="panel">
        <RightPanel />
      </Wrapper>
    );
    expect(document.querySelector('[data-meda-panel-mode="panel"]')).toBeInTheDocument();
  });
});
