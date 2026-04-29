import { fireEvent, render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(),
}));

import { AppShellWorkspace } from './app-shell-workspace.js';
import { MedaShellProvider, useMedaShell } from './shell-provider.js';
import { useShellViewport } from './use-shell-viewport.js';

const Provider = ({ children }: { children: React.ReactNode }) => (
  <MedaShellProvider
    workspace={{ id: 'w', name: 'W', icon: null }}
    workspaces={[{ id: 'w', name: 'W', icon: null }]}
    apps={[{ id: 'a', label: 'A', icon: Inbox }]}
    storage={{ load: () => null, save: () => {} }}
    themeAdapter="default"
  >
    {children}
  </MedaShellProvider>
);

const config = {
  iconRail: { mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: Inbox }] },
  contextRail: {
    appId: 'a',
    module: {
      id: 'i',
      label: 'Inbox',
      items: [{ id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' }],
    },
  },
  rightPanel: {
    panelViews: [{ id: 'inspector', label: 'Inspector', icon: Inbox, render: () => null }],
  },
};

function MobileDrawerStateProbe() {
  const ctx = useMedaShell();
  return <output data-testid="mobile-drawer-state">{ctx.mobileDrawer.open ?? 'closed'}</output>;
}

describe('AppShellWorkspace', () => {
  it('renders desktop chrome (icon rail + context rail + right panel) on desktop', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');
    render(
      <Provider>
        <AppShellWorkspace {...config}>
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );
    expect(screen.getByTestId('icon-rail')).toBeInTheDocument();
    expect(screen.getByTestId('context-rail')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-bottom-nav')).not.toBeInTheDocument();
  });

  it('renders mobile chrome (header + bottom nav + drawers) on mobile', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');
    render(
      <Provider>
        <AppShellWorkspace {...config}>
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );
    expect(screen.queryByTestId('icon-rail')).not.toBeInTheDocument();
    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });

  it('passes iconRail.renderLink through to IconRail on desktop', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');

    render(
      <Provider>
        <AppShellWorkspace
          iconRail={{
            mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: Inbox }],
            renderLink: ({ item, children, className }) => (
              <a
                data-testid={`custom-link-${item.id}`}
                href={`/next${item.to}`}
                className={className}
              >
                {children}
              </a>
            ),
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    const link = screen.getByTestId('custom-link-i');
    expect(link).toHaveAttribute('href', '/next/i');
    expect(link.className).toContain('h-11');
  });

  it('passes iconRail.renderLink through to the mobile menu and closes after navigation click', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');
    const navigate = vi.fn();

    render(
      <Provider>
        <MobileDrawerStateProbe />
        <AppShellWorkspace
          iconRail={{
            activeId: 'i',
            mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: Inbox }],
            renderLink: ({ item, isActive, children, className }) => (
              <button
                type="button"
                data-testid={`custom-mobile-link-${item.id}`}
                data-active={isActive ? 'true' : 'false'}
                className={className}
                onClick={() => navigate(item.to)}
              >
                {children}
              </button>
            ),
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(screen.getByTestId('mobile-drawer-state')).toHaveTextContent('menu-drawer');

    const link = screen.getByTestId('custom-mobile-link-i');
    expect(link).toHaveAttribute('data-active', 'true');
    expect(link.className).toContain('rounded-md');

    fireEvent.click(link);

    expect(navigate).toHaveBeenCalledWith('/i');
    expect(screen.getByTestId('mobile-drawer-state')).toHaveTextContent('closed');
  });

  it('renders mobile context module custom content with the context rail app id', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');

    render(
      <Provider>
        <AppShellWorkspace
          iconRail={config.iconRail}
          contextRail={{
            appId: 'context-app',
            module: {
              id: 'custom-module',
              label: 'Custom Module',
              render: ({ workspaceId, appId }) => (
                <section data-testid="mobile-module-custom-content">
                  {workspaceId}:{appId}
                </section>
              ),
            },
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Module' }));

    expect(screen.getByTestId('mobile-module-custom-content')).toHaveTextContent('w:context-app');
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('renders mobile context module items before custom content', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');

    render(
      <Provider>
        <AppShellWorkspace
          iconRail={config.iconRail}
          contextRail={{
            appId: 'context-app',
            module: {
              ...config.contextRail.module,
              render: () => (
                <section data-testid="mobile-module-custom-content">Conversation list</section>
              ),
            },
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Module' }));

    const moduleLink = screen.getByRole('link', { name: 'Inbox' });
    const customContent = screen.getByTestId('mobile-module-custom-content');
    expect(
      moduleLink.compareDocumentPosition(customContent) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it.each([
    { id: 'empty-module', label: 'Empty Module' },
    { id: 'empty-items-module', label: 'Empty Items Module', items: [] },
  ])('does not render a mobile Module nav item for empty module %#', (module) => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');

    render(
      <Provider>
        <AppShellWorkspace
          iconRail={config.iconRail}
          contextRail={{
            appId: 'context-app',
            module,
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Module' })).not.toBeInTheDocument();
  });
});
