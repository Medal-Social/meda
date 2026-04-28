import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(),
}));

import { AppShellWorkspace } from './app-shell-workspace.js';
import { MedaShellProvider } from './shell-provider.js';
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
});
