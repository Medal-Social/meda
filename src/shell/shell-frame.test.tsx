import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ShellFrame } from './shell-frame';

afterEach(() => {
  cleanup();
});

describe('ShellFrame', () => {
  it('renders the full shell scaffold with all slots', () => {
    render(
      <ShellFrame
        header={<header>Header</header>}
        navigation={<nav>Navigation</nav>}
        mobileSidebar={<aside>Mobile Sidebar</aside>}
        mobileHeader={<div>Mobile Header</div>}
        tabBar={<div>Tab Bar</div>}
        content={<main>Main Content</main>}
        desktopDock={<aside>Desktop Dock</aside>}
        tabletPanel={<div>Tablet Panel</div>}
        mobileBottomNav={<div>Mobile Bottom Nav</div>}
        commandPalette={<div>Command Palette</div>}
      />
    );

    expect(screen.getByTestId('shell-frame')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Mobile Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Mobile Header')).toBeInTheDocument();
    expect(screen.getByText('Tab Bar')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
    expect(screen.getByText('Desktop Dock')).toBeInTheDocument();
    expect(screen.getByText('Tablet Panel')).toBeInTheDocument();
    expect(screen.getByText('Mobile Bottom Nav')).toBeInTheDocument();
    expect(screen.getByText('Command Palette')).toBeInTheDocument();
  });

  it('works when optional chrome slots are omitted', () => {
    render(
      <ShellFrame
        header={<header>Header</header>}
        navigation={<nav>Navigation</nav>}
        content={<main>Main Content</main>}
      />
    );

    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });
});
