import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Inbox, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IconRailItem } from './icon-rail.js';
import { IconRail } from './icon-rail.js';
import { MedaShellProvider } from './shell-provider.js';
import type { AppDefinition, WorkspaceDefinition } from './types.js';

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
const apps: AppDefinition[] = [{ id: 'app-a', label: 'A', icon: Inbox }];

const mainItems: IconRailItem[] = [
  { id: 'inbox', label: 'Inbox', to: '/inbox', icon: Inbox },
  { id: 'settings', label: 'Settings', to: '/settings', icon: Settings },
];

const utilityItems: IconRailItem[] = [{ id: 'help', label: 'Help', to: '/help', icon: Settings }];

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <MedaShellProvider workspace={ws} apps={apps}>
      {children}
    </MedaShellProvider>
  );
}

// ---------------------------------------------------------------------------
// Tests — IconRail
// ---------------------------------------------------------------------------

describe('IconRail', () => {
  it('width is 60px from --shell-rail-width (class contract)', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} />
      </Wrapper>
    );

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    expect(nav.className).toContain('w-[var(--shell-rail-width)]');
  });

  it('does not expand on hover — width class unchanged after mouseEnter', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} />
      </Wrapper>
    );

    const nav = screen.getByRole('navigation', { name: 'Primary' });
    const classBeforeHover = nav.className;
    fireEvent.mouseEnter(nav);
    expect(nav.className).toBe(classBeforeHover);
    expect(nav.className).toContain('w-[var(--shell-rail-width)]');
  });

  it('hover renders Tooltip with item label', async () => {
    render(
      <Wrapper>
        <IconRail mainItems={[{ id: 'inbox', label: 'Inbox', to: '/inbox', icon: Inbox }]} />
      </Wrapper>
    );

    const trigger = screen.getByTestId('icon-rail-trigger-inbox');

    await act(async () => {
      fireEvent.mouseEnter(trigger);
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Inbox');
  });

  it('active item has bg-primary/12 and text-primary classes', () => {
    render(
      <Wrapper>
        <IconRail
          mainItems={[{ id: 'inbox', label: 'Inbox', to: '/inbox', icon: Inbox }]}
          activeId="inbox"
        />
      </Wrapper>
    );

    const trigger = screen.getByTestId('icon-rail-trigger-inbox');
    expect(trigger.className).toContain('bg-primary/12');
    expect(trigger.className).toContain('text-primary');
  });

  it('inactive item does NOT have bg-primary/12', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} activeId="inbox" />
      </Wrapper>
    );

    const settingsTrigger = screen.getByTestId('icon-rail-trigger-settings');
    expect(settingsTrigger.className).not.toContain('bg-primary/12');
  });

  it('renderLink prop wraps each item', () => {
    render(
      <Wrapper>
        <IconRail
          mainItems={mainItems}
          renderLink={({ item, children }) => (
            <span data-testid={`link-${item.id}`}>{children}</span>
          )}
        />
      </Wrapper>
    );

    expect(screen.getByTestId('link-inbox')).toBeInTheDocument();
    expect(screen.getByTestId('link-settings')).toBeInTheDocument();
  });

  it('utilityItems render below mainItems with divider between', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} utilityItems={utilityItems} />
      </Wrapper>
    );

    const inboxTrigger = screen.getByTestId('icon-rail-trigger-inbox');
    const helpTrigger = screen.getByTestId('icon-rail-trigger-help');
    const divider = screen.getByTestId('rail-divider');

    // DOM ordering: inbox before divider, divider before help
    expect(
      inboxTrigger.compareDocumentPosition(divider) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      divider.compareDocumentPosition(helpTrigger) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it('footer renders at the bottom', () => {
    render(
      <Wrapper>
        <IconRail
          mainItems={mainItems}
          footer={
            <button data-testid="user-menu" type="button">
              Avatar
            </button>
          }
        />
      </Wrapper>
    );

    expect(screen.getByTestId('user-menu')).toBeInTheDocument();
  });

  it('does not render divider when utilityItems is empty', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} />
      </Wrapper>
    );

    expect(screen.queryByTestId('rail-divider')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — RailDivider
// ---------------------------------------------------------------------------

describe('RailDivider', () => {
  it('renders ChevronUp button (pinnedBottom default → aria-label Pull utility items up)', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} utilityItems={utilityItems} />
      </Wrapper>
    );

    const dividerBtn = screen.getByTestId('rail-divider');
    expect(dividerBtn).toHaveAttribute('aria-label', 'Pull utility items up');
  });

  it('click toggles aria-label to Push utility items down', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} utilityItems={utilityItems} />
      </Wrapper>
    );

    const dividerBtn = screen.getByTestId('rail-divider');
    fireEvent.click(dividerBtn);
    expect(dividerBtn).toHaveAttribute('aria-label', 'Push utility items down');
  });

  it('click again toggles back to Pull utility items up', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} utilityItems={utilityItems} />
      </Wrapper>
    );

    const dividerBtn = screen.getByTestId('rail-divider');
    fireEvent.click(dividerBtn);
    fireEvent.click(dividerBtn);
    expect(dividerBtn).toHaveAttribute('aria-label', 'Pull utility items up');
  });

  it('utility wrapper has mt-auto when pinnedBottom (default)', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} utilityItems={utilityItems} />
      </Wrapper>
    );

    const utilityWrapper = screen.getByTestId('utility-items-wrapper');
    expect(utilityWrapper.className).toContain('mt-auto');
  });

  it('utility wrapper loses mt-auto after clicking divider (pushed up)', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} utilityItems={utilityItems} />
      </Wrapper>
    );

    const dividerBtn = screen.getByTestId('rail-divider');
    fireEvent.click(dividerBtn);

    const utilityWrapper = screen.getByTestId('utility-items-wrapper');
    expect(utilityWrapper.className).not.toContain('mt-auto');
  });

  it('pinned state is component-local — two instances toggle independently', () => {
    render(
      <Wrapper>
        <IconRail mainItems={mainItems} utilityItems={utilityItems} />
        <IconRail mainItems={mainItems} utilityItems={utilityItems} />
      </Wrapper>
    );

    const [btn1, btn2] = screen.getAllByTestId('rail-divider');
    fireEvent.click(btn1);

    expect(btn1).toHaveAttribute('aria-label', 'Push utility items down');
    expect(btn2).toHaveAttribute('aria-label', 'Pull utility items up');
  });
});
