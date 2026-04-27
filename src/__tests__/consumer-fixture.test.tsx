import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Home, LayoutGrid, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
// Legacy shell primitives — imported from the legacy surface directly
// (they're no longer in the root barrel since Phase 16 switched it to v2)
import {
  NavigationArea,
  ShellAppRail,
  ShellDesktopPanelDock,
  ShellFrame,
  ShellHeaderFrame,
  ShellModuleNav,
  type ShellRailItem,
  ShellStateProvider,
  type ShellTab,
  ShellTabBar,
  useShellState,
  WorkbenchLayout,
} from '../shell/public';

afterEach(() => {
  cleanup();
});

const appRailItems: ShellRailItem[] = [
  { to: '/overview', label: 'Overview', icon: Home },
  { to: '/ideas', label: 'Ideas', icon: Sparkles },
];

const tabs: ShellTab[] = [
  { id: 'overview', label: 'Overview', to: '/overview' },
  { id: 'details', label: 'Details', to: '/details' },
];

function ShellStateHarness() {
  const [searchParams, setSearchParamsState] = useState(() => new URLSearchParams());

  return (
    <ShellStateProvider
      adapter={{
        searchParams,
        setSearchParams: (updater) => {
          setSearchParamsState((currentSearchParams) => updater(currentSearchParams));
        },
      }}
      initialActiveRail="overview"
      selectionQueryParam="item"
      sidePanelWidthStorageKey="fixture.side-panel.width"
    >
      <FixtureConsumer />
    </ShellStateProvider>
  );
}

function FixtureConsumer() {
  const shell = useShellState();

  return (
    <div>
      <div data-testid="panel">{shell.activePanelView ?? 'none'}</div>
      <div data-testid="selection">{shell.selectedEntityId ?? 'none'}</div>
      <button type="button" onClick={() => shell.restoreLastPanelView('assistant')}>
        open panel
      </button>
      <button
        type="button"
        onClick={() => shell.selectEntity('frame-13', { panelView: 'overview' })}
      >
        select entity
      </button>
    </div>
  );
}

describe('meda fixture consumer', () => {
  it('renders Meda shell primitives from the package root', () => {
    render(
      <ShellFrame
        header={
          <ShellHeaderFrame
            left={<div>Workspace</div>}
            center={
              <ShellTabBar
                tabs={tabs}
                activeTab="overview"
                ariaLabel="Fixture tabs"
                renderLink={({ children, className, tab, isActive }) => (
                  <a
                    key={tab.id}
                    href={tab.to}
                    aria-current={isActive ? 'page' : undefined}
                    className={className}
                  >
                    {children}
                  </a>
                )}
              />
            }
            right={<button type="button">Run</button>}
          />
        }
        navigation={
          <NavigationArea>
            <ShellAppRail
              mainItems={appRailItems}
              utilityItems={[{ to: '/library', label: 'Library', icon: LayoutGrid }]}
              isItemActive={(item) => item.to === '/overview'}
              renderLink={({ children, className, item }) => (
                <a key={item.to} href={item.to} className={className}>
                  {children}
                </a>
              )}
            />
            <ShellModuleNav
              module={{
                label: 'Fixture',
                description: 'Shared shell proof',
                items: [
                  {
                    to: '/overview',
                    label: 'Overview',
                    description: 'Shell home',
                    icon: Home,
                    shortcut: '1',
                  },
                ],
              }}
              ariaLabel="Fixture navigation"
              isItemActive={(item) => item.to === '/overview'}
              renderLink={({ children, className, item }) => (
                <a key={item.to} href={item.to} className={className}>
                  {children}
                </a>
              )}
            />
          </NavigationArea>
        }
        content={
          <WorkbenchLayout
            viewportBand="desktop"
            main={<div>Main content</div>}
            aside={<div>Inspector</div>}
          />
        }
        desktopDock={
          <ShellDesktopPanelDock
            defaultView="assistant"
            panelOpen
            width={360}
            viewIds={['assistant']}
            onWidthChange={() => {}}
            renderPanel={({ defaultView, className }) => (
              <div className={className} data-testid="fixture-panel">
                {defaultView}
              </div>
            )}
          />
        }
      />
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Fixture tabs' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Fixture navigation' })).toBeInTheDocument();
    expect(screen.getByText('Main content')).toBeInTheDocument();
    expect(screen.getByText('Inspector')).toBeInTheDocument();
    expect(screen.getByTestId('fixture-panel')).toHaveTextContent('assistant');
  });

  it('uses the shared shell state provider through a host adapter', () => {
    render(<ShellStateHarness />);

    expect(screen.getByTestId('panel')).toHaveTextContent('none');
    expect(screen.getByTestId('selection')).toHaveTextContent('none');

    fireEvent.click(screen.getByText('open panel'));
    expect(screen.getByTestId('panel')).toHaveTextContent('assistant');

    fireEvent.click(screen.getByText('select entity'));
    expect(screen.getByTestId('selection')).toHaveTextContent('frame-13');
    expect(screen.getByTestId('panel')).toHaveTextContent('overview');
  });
});
