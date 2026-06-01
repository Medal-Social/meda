import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContextRail } from '../../../src/shell/context-rail.js';
import { MedaShellProvider } from '../../../src/shell/shell-provider.js';
import type {
  AppDefinition,
  ContextItem,
  ContextModule,
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

const CUSTOM_RENDER_MODULE: ContextModule = {
  id: 'custom',
  label: 'Custom Rail',
  description: 'Custom rail description',
  render: () => (
    <section>
      <h2>Consumer heading</h2>
      <p>Consumer custom content</p>
    </section>
  ),
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
  it('default width 260px applied as inline style on aside', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const aside = screen.getByRole('complementary', { name: 'Mail' });
    // Default layout state sets contextRail.width = 260
    expect(aside).toHaveStyle({ width: '260px' });
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

  it('module without items or custom render renders hidden placeholder, no aside', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={{ id: 'mail', label: 'Mail' }} />
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

  it('seam wrapper hosts the resize separator and the unified group/seam reveal scope', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    // The resize separator semantics live on the thin seam line; the wrapper
    // (data-testid="context-rail-seam") owns positioning + the group/seam scope
    // so the line + grip reveal together on rail hover. The grip button is a
    // sibling of the separator (not nested) — keeps roles a11y-valid.
    const separator = screen.getByRole('separator', { name: 'Resize context rail' });
    const seam = screen.getByTestId('context-rail-seam');
    expect(seam).toContainElement(separator);
    expect(seam).toContainElement(screen.getByTestId('context-rail-toggle'));
    expect(seam.className).toContain('group/seam');
  });

  it('seam straddles the rail boundary (w-3 + translate-x-1/2)', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const seam = screen.getByTestId('context-rail-seam');
    expect(seam.className).toContain('w-3');
    expect(seam.className).toContain('translate-x-1/2');
  });

  it('seam has cursor-col-resize class when expanded', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const seam = screen.getByTestId('context-rail-seam');
    expect(seam.className).toContain('cursor-col-resize');
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

    // Simulate drag that would bring width below min (260 - 200 = 60, clamped to 240)
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

    // Simulate drag that would bring width above max (260 + 200 = 460, clamped to 420)
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

    // Simulate drag: start at x=300, move to x=350 → delta +50, width goes from 260 to 310
    act(() => {
      fireEvent.pointerDown(handle, { clientX: 300, pointerId: 1 });
      fireEvent.pointerMove(handle, { clientX: 350, pointerId: 1 });
    });

    expect(aside).toHaveStyle({ width: '310px' });
  });
});

// ---------------------------------------------------------------------------
// Phase 9.2 tests — module items rendering
// ---------------------------------------------------------------------------

describe('ContextRail — module items rendering', () => {
  it('renders module.render custom content without items and passes shell render context', () => {
    render(
      <Wrapper>
        <ContextRail
          appId="mail"
          module={{
            id: 'mail',
            label: 'Mail',
            render: ({ workspaceId, appId }) => (
              <section data-testid="module-custom-content">
                {workspaceId}:{appId}
              </section>
            ),
          }}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('module-custom-content')).toHaveTextContent('ws-test:mail');
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('renders items before custom module content when both are supplied', () => {
    render(
      <Wrapper>
        <ContextRail
          appId="mail"
          module={{
            ...MODULE,
            render: () => <section data-testid="module-custom-content">Custom tools</section>,
          }}
        />
      </Wrapper>
    );

    const nav = screen.getByRole('navigation', { name: 'Mail navigation' });
    const custom = screen.getByTestId('module-custom-content');
    expect(nav.compareDocumentPosition(custom) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders module title + description in header', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    expect(screen.getByRole('heading', { name: 'Mail' })).toBeInTheDocument();
    expect(screen.getByText('Inbox + sent')).toBeInTheDocument();
  });

  it('renders one item per module.items entry', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    // 3 items: Inbox, Sent, Drafts
    expect(screen.getByText('Inbox')).toBeInTheDocument();
    expect(screen.getByText('Sent')).toBeInTheDocument();
    expect(screen.getByText('Drafts')).toBeInTheDocument();
    // Link elements
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);
  });

  it('active item has bg-primary/10 and text-primary classes', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} activeItemId="inbox" />
      </Wrapper>
    );

    const inboxLink = screen.getByRole('link', { name: /inbox/i });
    expect(inboxLink.className).toContain('bg-primary/10');
    expect(inboxLink.className).toContain('text-primary');
  });

  it('active item has aria-current="page"', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} activeItemId="inbox" />
      </Wrapper>
    );

    const inboxLink = screen.getByRole('link', { name: /inbox/i });
    expect(inboxLink).toHaveAttribute('aria-current', 'page');
  });

  it('inactive items do not have bg-primary/10', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} activeItemId="inbox" />
      </Wrapper>
    );

    const sentLink = screen.getByRole('link', { name: /sent/i });
    expect(sentLink.className).not.toContain('bg-primary/10');
    expect(sentLink.className).not.toContain('text-primary');
  });

  it('renderLink prop wraps each item in custom element', () => {
    render(
      <Wrapper>
        <ContextRail
          appId="mail"
          module={MODULE}
          renderLink={({ item, children }) => (
            <span key={item.id} data-testid={`link-${item.id}`}>
              {children}
            </span>
          )}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('link-inbox')).toBeInTheDocument();
    expect(screen.getByTestId('link-sent')).toBeInTheDocument();
    expect(screen.getByTestId('link-drafts')).toBeInTheDocument();
    // No default <a> elements rendered
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('renderLink receives default link props for route adapters', () => {
    render(
      <Wrapper>
        <ContextRail
          appId="mail"
          module={MODULE}
          activeItemId="inbox"
          renderLink={({ item, linkProps }) => (
            <a {...linkProps} data-testid={`route-link-${item.id}`} data-route-link="true" />
          )}
        />
      </Wrapper>
    );

    const inboxLink = screen.getByTestId('route-link-inbox');
    expect(inboxLink).toHaveAttribute('href', '/inbox');
    expect(inboxLink).toHaveAttribute('aria-current', 'page');
    expect(inboxLink).toHaveAttribute('data-route-link', 'true');
  });

  it('item with shortcut renders keyboard shortcut text', () => {
    const moduleWithShortcut: ContextModule = {
      id: 'mail',
      label: 'Mail',
      items: [{ id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox', shortcut: '⌘I' }],
    };

    render(
      <Wrapper>
        <ContextRail appId="mail" module={moduleWithShortcut} />
      </Wrapper>
    );

    expect(screen.getByText('⌘I')).toBeInTheDocument();
  });
});

describe('ContextRail — header and scroll defaults', () => {
  it('renders the visible Meda header by default for item navigation rails', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    expect(screen.getByRole('heading', { name: 'Mail' })).toBeInTheDocument();
    expect(screen.getByText('Inbox + sent')).toBeInTheDocument();
  });

  it('hides the visible Meda header by default for custom render rails', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={CUSTOM_RENDER_MODULE} />
      </Wrapper>
    );

    expect(screen.queryByRole('heading', { name: 'Custom Rail' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Consumer heading' })).toBeInTheDocument();
    expect(screen.getByLabelText('Custom Rail')).toBeInTheDocument();
  });

  it('header="visible" renders the Meda header for custom render rails', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={CUSTOM_RENDER_MODULE} header="visible" />
      </Wrapper>
    );

    expect(screen.getByRole('heading', { name: 'Custom Rail' })).toBeInTheDocument();
    expect(screen.getByText('Custom rail description')).toBeInTheDocument();
  });

  it('header="hidden" hides the Meda header for item navigation rails', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} header="hidden" />
      </Wrapper>
    );

    expect(screen.queryByRole('heading', { name: 'Mail' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inbox/i })).toBeInTheDocument();
  });

  it('uses a vertical scroll container by default', () => {
    const { container } = render(
      <Wrapper>
        <ContextRail appId="mail" module={CUSTOM_RENDER_MODULE} />
      </Wrapper>
    );

    const scrollArea = container.querySelector('[data-meda-context-rail-scroll-area]');
    expect(scrollArea).toHaveClass('overflow-y-auto');
    expect(scrollArea).toHaveClass('overflow-x-hidden');
  });

  it('scroll="none" disables the built-in vertical scroll container', () => {
    const { container } = render(
      <Wrapper>
        <ContextRail appId="mail" module={CUSTOM_RENDER_MODULE} scroll="none" />
      </Wrapper>
    );

    const scrollArea = container.querySelector('[data-meda-context-rail-scroll-area]');
    expect(scrollArea).not.toHaveClass('overflow-y-auto');
    expect(scrollArea).toHaveClass('overflow-hidden');
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
    // contextRail.width = 310 (260 default + 50 drag delta)
    expect(storage.save).toHaveBeenCalled();
    const savedState = storage.save.mock.calls[storage.save.mock.calls.length - 1][1];
    expect((savedState as { contextRail: { width: number } }).contextRail.width).toBe(310);
  });
});

// ---------------------------------------------------------------------------
// Phase 13 carry-forward — mobile auto-hide
// ---------------------------------------------------------------------------

describe('ContextRail — hides on mobile viewport', () => {
  it('returns null when viewport is mobile', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );
    expect(screen.queryByRole('complementary', { name: 'Mail' })).not.toBeInTheDocument();
  });
});

describe('ContextRail — renders on desktop viewport', () => {
  it('renders the aside element when viewport is desktop', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('desktop');
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );
    expect(screen.getByRole('complementary', { name: 'Mail' })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Collapse toggle — chevron button on the rail's right edge
// ---------------------------------------------------------------------------

describe('collapse toggle', () => {
  it('renders the toggle button when expanded', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );
    const btn = screen.getByTestId('context-rail-toggle');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Collapse sidebar');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    // aria-controls is a per-instance id (useId) prefixed with meda-context-rail-
    const ariaControls = btn.getAttribute('aria-controls');
    expect(ariaControls).toMatch(/^meda-context-rail-/);
    // The aside it points at must actually exist
    // biome-ignore lint/style/noNonNullAssertion: ariaControls is confirmed non-null by the toMatch assertion above
    expect(document.getElementById(ariaControls!)).toBeInTheDocument();
  });

  it('renders the toggle button when collapsed (seeded via storage)', () => {
    // Seed initial layout state via the storage adapter so we exercise the
    // first-render path (catches bugs that wouldn't manifest via click-to-collapse).
    const seededStorage = {
      load: (key: string) =>
        key.startsWith('meda:shell:')
          ? {
              contextRail: { width: 300, collapsed: true },
              rightPanel: { mode: 'closed', activeView: null, width: 340 },
            }
          : null,
      save: () => {},
    };
    render(
      <Wrapper storage={seededStorage}>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );
    const btn = screen.getByTestId('context-rail-toggle');
    expect(btn).toHaveAttribute('aria-label', 'Expand sidebar');
    expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  it('clicking the toggle flips ctx.contextRail.collapsed', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );
    const btn = screen.getByTestId('context-rail-toggle');
    expect(btn).toHaveAttribute('aria-expanded', 'true');
    act(() => {
      fireEvent.click(btn);
    });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    act(() => {
      fireEvent.click(btn);
    });
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the seam mounted when collapsed (so the rail can be reopened) but disables resize', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );
    const seam = screen.getByTestId('context-rail-seam');
    expect(seam).toBeInTheDocument();
    expect(seam.getAttribute('data-collapsed')).toBe('false');
    expect(seam.className).toContain('cursor-col-resize');
    expect(screen.getByRole('separator', { name: /resize context rail/i })).toBeInTheDocument();

    // Collapse via the grip — the unified seam stays mounted (it carries the
    // expand grip) but flips to a non-resizable state.
    act(() => {
      fireEvent.click(screen.getByTestId('context-rail-toggle'));
    });
    const collapsedSeam = screen.getByTestId('context-rail-seam');
    expect(collapsedSeam).toBeInTheDocument();
    expect(collapsedSeam.getAttribute('data-collapsed')).toBe('true');
    expect(collapsedSeam.className).toContain('cursor-default');
  });

  it('does not render the toggle on mobile viewport', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );
    expect(screen.queryByTestId('context-rail-toggle')).not.toBeInTheDocument();
  });

  it('outer aside id is per-instance (multiple rails do not collide on duplicate id)', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );
    const asides = screen.getAllByRole('complementary', { name: 'Mail' });
    expect(asides).toHaveLength(2);
    const ids = asides.map((a) => a.id);
    expect(ids[0]).toMatch(/^meda-context-rail-/);
    expect(ids[1]).toMatch(/^meda-context-rail-/);
    expect(ids[0]).not.toBe(ids[1]); // unique per instance
  });

  it('does not render the toggle when collapsible={false}', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} collapsible={false} />
      </Wrapper>
    );
    expect(screen.queryByTestId('context-rail-toggle')).not.toBeInTheDocument();
    // The aside still renders (collapsible=false just removes the affordance)
    expect(screen.getByRole('complementary', { name: 'Mail' })).toBeInTheDocument();
  });

  it('collapsible={false} forces expanded render even when persisted state is collapsed', () => {
    // Seed collapsed: true via storage to simulate a user who collapsed the
    // rail before the consumer flipped collapsible to false. Without the
    // override, the rail would render at width 0 with no way to recover.
    const seededCollapsed = {
      load: (key: string) =>
        key.startsWith('meda:shell:')
          ? {
              contextRail: { width: 260, collapsed: true },
              rightPanel: { mode: 'closed', activeView: null, width: 340 },
            }
          : null,
      save: () => {},
    };
    render(
      <Wrapper storage={seededCollapsed}>
        <ContextRail appId="mail" module={MODULE} collapsible={false} />
      </Wrapper>
    );
    // No toggle (collapsible=false)
    expect(screen.queryByTestId('context-rail-toggle')).not.toBeInTheDocument();
    // Aside renders at the persisted width, NOT at width 0
    const aside = screen.getByRole('complementary', { name: 'Mail' });
    expect(aside).toHaveStyle({ width: '260px' });
  });
});

describe('ContextRail — resize handle no-op when not dragging', () => {
  it('pointerMove without prior pointerDown does not change width', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const aside = screen.getByRole('complementary', { name: 'Mail' });
    const handle = screen.getByRole('separator', { name: 'Resize context rail' });

    // Fire pointerMove without a preceding pointerDown
    act(() => {
      fireEvent.pointerMove(handle, { clientX: 100, pointerId: 1 });
    });

    // Width must remain at the default 260px
    expect(aside).toHaveStyle({ width: '260px' });
  });

  it('pointerUp without prior pointerDown does not commit width', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    const aside = screen.getByRole('complementary', { name: 'Mail' });
    const handle = screen.getByRole('separator', { name: 'Resize context rail' });

    act(() => {
      fireEvent.pointerUp(handle, { clientX: 100, pointerId: 1 });
    });

    expect(aside).toHaveStyle({ width: '260px' });
  });
});
