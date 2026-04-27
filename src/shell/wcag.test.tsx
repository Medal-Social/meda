import { render } from '@testing-library/react';
import { Home, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { NavigationArea } from './navigation-area.js';
import { ShellAppRail } from './shell-app-rail.js';
import { ShellDesktopPanelDock } from './shell-desktop-panel-dock.js';
import { ShellFrame } from './shell-frame.js';
import { ShellHeaderFrame, ShellPanelToggle } from './shell-header.js';
import { ShellModuleNav } from './shell-module-nav.js';
import { ShellPanelRail } from './shell-panel-rail.js';
import { ShellScrollableContent } from './shell-scrollable-content.js';
import { ShellTabBar } from './shell-tab-bar.js';
import { WorkbenchLayout } from './workbench-layout.js';

const renderLink = ({
  children,
  className,
  item,
}: {
  children: ReactNode;
  className: string;
  item: { to: string };
}) => (
  <a key={item.to} href={item.to} className={className}>
    {children}
  </a>
);

describe('shell a11y', () => {
  it('NavigationArea has no axe violations', async () => {
    const { container } = render(
      <NavigationArea>
        <div>nav</div>
      </NavigationArea>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ShellTabBar has no axe violations', async () => {
    const { container } = render(
      <ShellTabBar
        tabs={[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
        ]}
        activeTab="all"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ShellHeaderFrame has no axe violations', async () => {
    const { container } = render(
      <ShellHeaderFrame
        left={<strong>Meda</strong>}
        right={<ShellPanelToggle panelOpen={false} onToggle={() => {}} />}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ShellAppRail has no axe violations', async () => {
    const { container } = render(
      <ShellAppRail
        mainItems={[{ to: '/h', label: 'Home', icon: Home }]}
        utilityItems={[{ to: '/i', label: 'Inbox', icon: Inbox }]}
        isItemActive={(item) => item.to === '/h'}
        renderLink={renderLink}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ShellModuleNav has no axe violations', async () => {
    const { container } = render(
      <ShellModuleNav
        module={{
          label: 'Mail',
          description: 'Inbox and threads',
          items: [{ to: '/inbox', label: 'Inbox', icon: Inbox }],
        }}
        ariaLabel="Mail navigation"
        isItemActive={(item) => item.to === '/inbox'}
        renderLink={renderLink}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ShellPanelRail has no axe violations', async () => {
    const { container } = render(
      <ShellPanelRail
        moduleViews={[{ id: 'details', label: 'Details', icon: Inbox }]}
        globalViews={[]}
        activePanelView="details"
        onTogglePanelView={() => {}}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ShellDesktopPanelDock has no axe violations', async () => {
    const { container } = render(
      <ShellDesktopPanelDock
        defaultView="details"
        panelOpen
        width={320}
        onWidthChange={() => {}}
        renderPanel={({ className }) => <div className={className}>panel</div>}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ShellScrollableContent has no axe violations', async () => {
    const { container } = render(
      <ShellScrollableContent layout="workspace">
        <p>content</p>
      </ShellScrollableContent>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('WorkbenchLayout has no axe violations', async () => {
    const { container } = render(
      <WorkbenchLayout viewportBand="desktop" main={<div>main</div>} aside={<div>aside</div>} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ShellFrame has no axe violations', async () => {
    const { container } = render(
      <ShellFrame
        header={<div>header</div>}
        navigation={<nav aria-label="primary">nav</nav>}
        content={<main>main</main>}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
