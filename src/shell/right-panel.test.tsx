import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RightPanel } from './right-panel.js';
import { MedaShellProvider, useMedaShell } from './shell-provider.js';
import type { AppDefinition, PanelMode, PanelView, WorkspaceDefinition } from './types.js';

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
