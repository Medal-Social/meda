import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { Inbox, Settings } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResizableHandle, ResizableShell, ResizableShellPanel } from './resizable-shell.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Browser stubs
// ---------------------------------------------------------------------------

// react-resizable-panels uses ResizeObserver internally; jsdom doesn't provide it.
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

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

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ws: WorkspaceDefinition = { id: 'ws-test', name: 'Test', icon: null };
const apps: AppDefinition[] = [{ id: 'app-a', label: 'A', icon: Inbox }];

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MedaShellProvider workspace={ws} apps={apps}>
      {children}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests — ResizableShell
// ---------------------------------------------------------------------------

describe('ResizableShell', () => {
  it('renders horizontal panel group (data-group attribute present)', () => {
    render(
      <Wrapper>
        <ResizableShell>
          <ResizableShellPanel defaultSize={50} id="left">
            <div>Left</div>
          </ResizableShellPanel>
          <ResizableHandle />
          <ResizableShellPanel defaultSize={50} id="right">
            <div>Right</div>
          </ResizableShellPanel>
        </ResizableShell>
      </Wrapper>
    );

    // react-resizable-panels v4 adds data-group to the Group element
    const group = document.querySelector('[data-group]');
    expect(group).toBeInTheDocument();
  });

  it('renders both child panels', () => {
    render(
      <Wrapper>
        <ResizableShell>
          <ResizableShellPanel defaultSize={50} id="panel-a">
            <div data-testid="panel-a-content">Panel A</div>
          </ResizableShellPanel>
          <ResizableHandle />
          <ResizableShellPanel defaultSize={50} id="panel-b">
            <div data-testid="panel-b-content">Panel B</div>
          </ResizableShellPanel>
        </ResizableShell>
      </Wrapper>
    );

    expect(screen.getByTestId('panel-a-content')).toBeInTheDocument();
    expect(screen.getByTestId('panel-b-content')).toBeInTheDocument();
  });

  it('vertical orientation renders vertical panel group', () => {
    render(
      <Wrapper>
        <ResizableShell orientation="vertical">
          <ResizableShellPanel defaultSize={50} id="top">
            <div>Top</div>
          </ResizableShellPanel>
          <ResizableHandle />
          <ResizableShellPanel defaultSize={50} id="bottom">
            <div>Bottom</div>
          </ResizableShellPanel>
        </ResizableShell>
      </Wrapper>
    );

    // PanelGroup in vertical mode sets flexDirection: column — check data-group present
    const group = document.querySelector('[data-group]');
    expect(group).toBeInTheDocument();

    // Also verify the Group renders with vertical style (flex-direction: column)
    // react-resizable-panels applies inline style on the group element
    const groupStyle = (group as HTMLElement).style;
    expect(groupStyle.flexDirection).toBe('column');
  });

  it('min/max props forwarded to Panel (data-panel attribute present)', () => {
    render(
      <Wrapper>
        <ResizableShell>
          <ResizableShellPanel defaultSize={50} minSize={20} maxSize={80} id="panel-constrained">
            <div data-testid="panel-constrained-content">Content</div>
          </ResizableShellPanel>
          <ResizableHandle />
          <ResizableShellPanel defaultSize={50} id="panel-other">
            <div>Other</div>
          </ResizableShellPanel>
        </ResizableShell>
      </Wrapper>
    );

    // react-resizable-panels v4 adds data-panel to each Panel element
    const panels = document.querySelectorAll('[data-panel]');
    expect(panels.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('panel-constrained-content')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — ResizableHandle
// ---------------------------------------------------------------------------

describe('ResizableHandle', () => {
  it('renders the separator element (data-separator attribute present)', () => {
    render(
      <Wrapper>
        <ResizableShell>
          <ResizableShellPanel defaultSize={50} id="a">
            <div>A</div>
          </ResizableShellPanel>
          <ResizableHandle />
          <ResizableShellPanel defaultSize={50} id="b">
            <div>B</div>
          </ResizableShellPanel>
        </ResizableShell>
      </Wrapper>
    );

    // react-resizable-panels v4 adds data-separator to the Separator element
    const separator = document.querySelector('[data-separator]');
    expect(separator).toBeInTheDocument();
  });

  it('handle has cursor-col-resize and hover:bg-ring classes', () => {
    render(
      <Wrapper>
        <ResizableShell>
          <ResizableShellPanel defaultSize={50} id="a">
            <div>A</div>
          </ResizableShellPanel>
          <ResizableHandle />
          <ResizableShellPanel defaultSize={50} id="b">
            <div>B</div>
          </ResizableShellPanel>
        </ResizableShell>
      </Wrapper>
    );

    // The ResizableHandle renders a wrapper div with the style classes
    // react-resizable-panels Separator has role="separator"
    const separator = document.querySelector('[data-separator]');
    expect(separator).toBeInTheDocument();
    // Our className wrapper sits on the Separator element directly
    expect(separator?.className).toContain('cursor-col-resize');
    expect(separator?.className).toContain('hover:bg-ring');
  });

  it('withHandle=true renders the visible drag indicator inner div', () => {
    render(
      <Wrapper>
        <ResizableShell>
          <ResizableShellPanel defaultSize={50} id="a">
            <div>A</div>
          </ResizableShellPanel>
          <ResizableHandle withHandle />
          <ResizableShellPanel defaultSize={50} id="b">
            <div>B</div>
          </ResizableShellPanel>
        </ResizableShell>
      </Wrapper>
    );

    const indicator = document.querySelector('[data-testid="resize-handle-indicator"]');
    expect(indicator).toBeInTheDocument();
  });

  it('withHandle=false (default) does not render inner drag indicator', () => {
    render(
      <Wrapper>
        <ResizableShell>
          <ResizableShellPanel defaultSize={50} id="a">
            <div>A</div>
          </ResizableShellPanel>
          <ResizableHandle />
          <ResizableShellPanel defaultSize={50} id="b">
            <div>B</div>
          </ResizableShellPanel>
        </ResizableShell>
      </Wrapper>
    );

    const indicator = document.querySelector('[data-testid="resize-handle-indicator"]');
    expect(indicator).not.toBeInTheDocument();
  });
});

// Silence unused import warning
void Settings;
