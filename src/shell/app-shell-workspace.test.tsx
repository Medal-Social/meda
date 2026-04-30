import { fireEvent, render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(),
}));

import { AppShellWorkspace } from './app-shell-workspace.js';
import { useCommands } from './command-palette.js';
import { PanelViewsProvider } from './panel-views-provider.js';
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

function CommandRegistrationProbe() {
  useCommands([{ id: 'refresh', label: 'Refresh', group: 'Page', run: () => {} }]);
  return <div data-testid="command-registration-probe" />;
}

const routePanelViews = [
  {
    id: 'route-inspector',
    label: 'Route Inspector',
    icon: Inbox,
    render: () => <section>Route inspector content</section>,
  },
  {
    id: 'route-activity',
    label: 'Route Activity',
    icon: Inbox,
    render: () => <section>Route activity content</section>,
  },
];

const openPanelStorage = {
  load: () => ({
    contextRail: { width: 260, collapsed: false },
    rightPanel: { mode: 'panel', activeView: null, width: 340 },
  }),
  save: () => {},
};

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

  it('forwards headerCenter into the desktop header', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');

    render(
      <Provider>
        <AppShellWorkspace headerCenter={<nav aria-label="Section tabs">Queue</nav>}>
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    expect(screen.getByRole('navigation', { name: 'Section tabs' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Applications' })).not.toBeInTheDocument();
  });

  it('forwards app tab renderLink into the desktop header', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');

    render(
      <MedaShellProvider
        workspace={{ id: 'w', name: 'W', icon: null }}
        workspaces={[{ id: 'w', name: 'W', icon: null }]}
        apps={[{ id: 'a', label: 'A', icon: Inbox, to: '/a' }]}
        storage={{ load: () => null, save: () => {} }}
        themeAdapter="default"
      >
        <AppShellWorkspace
          appTabs={{
            renderLink: ({ app, linkProps }) => (
              <a {...linkProps} data-testid={`workspace-app-tab-${app.id}`} />
            ),
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </MedaShellProvider>
    );

    expect(screen.getByTestId('workspace-app-tab-a')).toHaveAttribute('href', '/a');
  });

  it('renders banners between the header and workspace row', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');

    const { container } = render(
      <Provider>
        <AppShellWorkspace banners={<div role="status">Impersonating customer</div>}>
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    const banner = screen.getByRole('status');
    const bannerRow = banner.closest('[data-meda-banners]');
    const header = container.querySelector('header');
    const workspaceRow = container.querySelector('.relative.flex.flex-1.overflow-hidden');

    expect(bannerRow).toBeInTheDocument();
    expect(bannerRow?.className).toContain('flex-shrink-0');
    expect(header?.compareDocumentPosition(bannerRow as Element)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
    expect(bannerRow?.compareDocumentPosition(workspaceRow as Element)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    );
  });

  it('passes main layout and className to the workspace scroll region', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');

    const { container } = render(
      <Provider>
        <AppShellWorkspace mainLayout="fullbleed" mainClassName="custom-main">
          <div>hi</div>
        </AppShellWorkspace>
      </Provider>
    );

    const main = container.querySelector('main');
    expect(main).toHaveAttribute('data-meda-shell-main-layout', 'fullbleed');
    expect(main).toHaveClass('custom-main');
  });

  it('auto-mounts the command palette registry for workspace descendants', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');

    render(
      <Provider>
        <AppShellWorkspace>
          <CommandRegistrationProbe />
        </AppShellWorkspace>
      </Provider>
    );

    expect(screen.getByTestId('command-registration-probe')).toBeInTheDocument();
  });

  it('renders desktop right panel tabs from route-registered panel views without static rightPanel config', async () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');

    render(
      <MedaShellProvider
        workspace={{ id: 'w', name: 'W', icon: null }}
        workspaces={[{ id: 'w', name: 'W', icon: null }]}
        apps={[{ id: 'a', label: 'A', icon: Inbox }]}
        storage={openPanelStorage}
        themeAdapter="default"
      >
        <AppShellWorkspace>
          <PanelViewsProvider views={routePanelViews} defaultView="route-activity">
            <main aria-label="content">hi</main>
          </PanelViewsProvider>
        </AppShellWorkspace>
      </MedaShellProvider>
    );

    expect(await screen.findByRole('button', { name: 'Route Inspector' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Route Activity' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByText('Route activity content')).toBeInTheDocument();
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

  it('renders mobile Panels nav and drawer content from route-registered panel views without static rightPanel config', async () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');

    render(
      <Provider>
        <AppShellWorkspace>
          <PanelViewsProvider views={routePanelViews} defaultView="route-activity">
            <main aria-label="content">hi</main>
          </PanelViewsProvider>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Panels' }));

    expect(screen.getByRole('button', { name: 'Route Inspector' })).toBeInTheDocument();
    const activeTab = screen.getByRole('button', { name: 'Route Activity' });
    expect(activeTab).toHaveAttribute('aria-current', 'true');
    expect(activeTab.className).toContain('text-sm');
    expect(screen.getByText('Route activity content')).toBeInTheDocument();
  });

  it('passes merged static and route-registered panel views into the mobile Panels drawer', async () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');

    render(
      <Provider>
        <AppShellWorkspace
          rightPanel={{
            panelViews: [
              {
                id: 'static-inspector',
                label: 'Static Inspector',
                icon: Inbox,
                render: () => <section>Static inspector content</section>,
              },
            ],
            defaultView: 'static-inspector',
          }}
        >
          <PanelViewsProvider views={routePanelViews} defaultView="route-activity">
            <main aria-label="content">hi</main>
          </PanelViewsProvider>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Panels' }));

    expect(screen.getByRole('button', { name: 'Static Inspector' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Route Inspector' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Route Activity' })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(screen.getByText('Route activity content')).toBeInTheDocument();
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

  it('keeps mobile menu linkProps safe to spread without embedding close handler', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');
    let linkPropsOnClick: unknown = null;

    render(
      <Provider>
        <MobileDrawerStateProbe />
        <AppShellWorkspace
          iconRail={{
            activeId: 'i',
            mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: Inbox }],
            renderLink: ({ item, linkProps }) => {
              linkPropsOnClick = linkProps.onClick;
              return <a {...linkProps} data-testid={`spread-mobile-link-${item.id}`} />;
            },
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    expect(linkPropsOnClick).toBeUndefined();

    fireEvent.click(screen.getByTestId('spread-mobile-link-i'));
    expect(screen.getByTestId('mobile-drawer-state')).toHaveTextContent('closed');
  });

  it('renders workspace menu href items, theme toggle, and footer in the mobile menu', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');

    render(
      <Provider>
        <MobileDrawerStateProbe />
        <AppShellWorkspace
          iconRail={{ mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: Inbox }] }}
          workspace={{
            menuItems: [{ id: 'audit', label: 'Audit log', href: '/audit', icon: Inbox }],
            menuFooter: <div>Workspace footer</div>,
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

    expect(screen.getByRole('link', { name: 'Audit log' })).toHaveAttribute('href', '/audit');
    expect(screen.getByRole('button', { name: /switch to .* theme/i })).toBeInTheDocument();
    expect(screen.getByText('Workspace footer')).toBeInTheDocument();
    expect(screen.queryByText('Manage workspaces')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Audit log' }));
    expect(screen.getByTestId('mobile-drawer-state')).toHaveTextContent('closed');
  });

  it('renders workspace menu onClick items in the mobile menu and closes after click', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');
    const handleSettings = vi.fn();

    render(
      <Provider>
        <MobileDrawerStateProbe />
        <AppShellWorkspace
          iconRail={{ mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: Inbox }] }}
          workspace={{
            menuItems: [
              {
                id: 'settings',
                label: 'Settings',
                onClick: handleSettings,
                variant: 'destructive',
                separatorAfter: true,
              },
            ],
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

    const settingsItem = screen.getByRole('button', { name: 'Settings' });
    expect(settingsItem).toHaveAttribute('data-variant', 'destructive');

    fireEvent.click(settingsItem);

    expect(handleSettings).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('mobile-drawer-state')).toHaveTextContent('closed');
  });

  it('renders a mobile menu for workspace items even when iconRail is omitted', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');

    render(
      <Provider>
        <AppShellWorkspace
          workspace={{
            menuItems: [{ id: 'audit', label: 'Audit log', href: '/audit' }],
          }}
        >
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

    expect(screen.getByRole('link', { name: 'Audit log' })).toHaveAttribute('href', '/audit');
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
