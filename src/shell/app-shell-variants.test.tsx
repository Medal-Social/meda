import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './app-shell.js';
import { MedaShellProvider } from './shell-provider.js';

const baseProvider = (children: React.ReactNode) => (
  <MedaShellProvider
    workspace={{ id: 'w', name: 'W', icon: null }}
    workspaces={[{ id: 'w', name: 'W', icon: null }]}
    apps={[{ id: 'a', label: 'A', icon: () => null as unknown as JSX.Element }]}
    storage={{ load: () => null, save: () => {} }}
    themeAdapter="default"
  >
    {children}
  </MedaShellProvider>
);

describe('AppShell variant', () => {
  it('renders the auth variant when variant="auth"', () => {
    render(
      baseProvider(
        <AppShell variant="auth" auth={{ title: 'Sign in' }}>
          <input aria-label="email" />
        </AppShell>
      )
    );
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText('email')).toBeInTheDocument();
  });

  it('renders the workspace variant when variant="workspace"', () => {
    render(
      baseProvider(
        <AppShell
          variant="workspace"
          iconRail={{
            mainItems: [
              { id: 'i', label: 'Inbox', to: '/i', icon: () => null as unknown as JSX.Element },
            ],
          }}
        >
          <main aria-label="content">hi</main>
        </AppShell>
      )
    );
    expect(screen.getByLabelText('content')).toBeInTheDocument();
  });

  it('renders the chat variant when variant="chat"', () => {
    render(
      baseProvider(
        <AppShell variant="chat">
          <div data-testid="transcript">…</div>
        </AppShell>
      )
    );
    expect(screen.getByTestId('transcript')).toBeInTheDocument();
  });
});
