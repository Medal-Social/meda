import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContextRail } from './context-rail.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, ContextItem, ContextModule, WorkspaceDefinition } from './types.js';

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
const apps: AppDefinition[] = [{ id: 'app-mail', label: 'Mail', icon: Inbox }];

const ITEMS: ContextItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' },
  { id: 'sent', label: 'Sent', icon: Inbox, to: '/sent' },
  { id: 'drafts', label: 'Drafts', icon: Inbox, to: '/drafts' },
];

const MODULE: ContextModule = {
  id: 'mail',
  label: 'Mail',
  description: 'Inbox + sent',
  items: ITEMS,
};

function Wrapper({
  children,
  storage,
}: {
  children: ReactNode;
  storage?: { load: (k: string) => unknown; save: (k: string, v: unknown) => void };
}) {
  return (
    <MedaShellProvider workspace={ws} apps={apps} storage={storage}>
      {children}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Spec §10 tests — Phase 9.1
// ---------------------------------------------------------------------------

describe('ContextRail — layout + visibility', () => {
  it('default width 300px applied as inline style on aside', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const aside = screen.getByRole('complementary', { name: 'Mail' });
    // Default layout state sets contextRail.width = 300
    expect(aside).toHaveStyle({ width: '300px' });
  });

  it('hidden=true renders nothing visible (aria-hidden div, no aside)', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} hidden />
      </Wrapper>
    );

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    const hiddenDiv = document.querySelector('[data-testid="context-rail-hidden"]');
    expect(hiddenDiv).toHaveAttribute('aria-hidden', 'true');
  });

  it('empty module.items renders hidden placeholder, no aside', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={{ id: 'mail', label: 'Mail', items: [] }} />
      </Wrapper>
    );

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    const empty = document.querySelector('[data-testid="context-rail-empty"]');
    expect(empty).toHaveAttribute('aria-hidden', 'true');
  });

  it('no module prop renders hidden placeholder, no aside', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" />
      </Wrapper>
    );

    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('resize handle is present with opacity-0 and hover:opacity-100 classes', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const handle = screen.getByRole('separator', { name: 'Resize context rail' });
    expect(handle.className).toContain('opacity-0');
    expect(handle.className).toContain('hover:opacity-100');
  });

  it('resize handle is 4px wide (w-1 class)', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const handle = screen.getByRole('separator', { name: 'Resize context rail' });
    expect(handle.className).toContain('w-1');
  });

  it('resize handle has cursor-col-resize class', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const handle = screen.getByRole('separator', { name: 'Resize context rail' });
    expect(handle.className).toContain('cursor-col-resize');
  });
});

describe('ContextRail — resize clamping', () => {
  it('min width clamp: pointer drag that would go below 240 is clamped to 240', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const aside = screen.getByRole('complementary', { name: 'Mail' });
    const handle = screen.getByRole('separator', { name: 'Resize context rail' });

    // Simulate drag that would bring width below min (300 - 200 = 100, clamped to 240)
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 300, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 100, pointerId: 1 });
    });

    expect(aside).toHaveStyle({ width: '240px' });
  });

  it('max width clamp: pointer drag that would exceed 420 is clamped to 420', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const aside = screen.getByRole('complementary', { name: 'Mail' });
    const handle = screen.getByRole('separator', { name: 'Resize context rail' });

    // Simulate drag that would bring width above max (300 + 200 = 500, clamped to 420)
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 300, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 500, pointerId: 1 });
    });

    expect(aside).toHaveStyle({ width: '420px' });
  });

  it('in-range drag updates width correctly', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const aside = screen.getByRole('complementary', { name: 'Mail' });
    const handle = screen.getByRole('separator', { name: 'Resize context rail' });

    // Simulate drag: start at x=300, move to x=350 → width goes from 300 to 350
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 300, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 350, pointerId: 1 });
    });

    expect(aside).toHaveStyle({ width: '350px' });
  });
});

describe('ContextRail — width persistence via useShellLayoutState', () => {
  it('calls storage.save when width is committed on pointerUp', async () => {
    const storage = {
      load: vi.fn(() => null),
      save: vi.fn(),
    };

    render(
      <Wrapper storage={storage}>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const handle = screen.getByRole('separator', { name: 'Resize context rail' });

    await act(async () => {
      fireEvent.pointerDown(handle, { clientX: 300, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 350, pointerId: 1 });
      fireEvent.pointerUp(handle, { clientX: 350, pointerId: 1 });
    });

    // storage.save should have been called with the layout state containing
    // contextRail.width = 350
    expect(storage.save).toHaveBeenCalled();
    const savedState = storage.save.mock.calls[storage.save.mock.calls.length - 1][1];
    expect((savedState as { contextRail: { width: number } }).contextRail.width).toBe(350);
  });
});
