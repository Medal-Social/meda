import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../../../src/shell/app-shell.js';
import { MedaShellProvider } from '../../../src/shell/shell-provider.js';

const baseProvider = (children: React.ReactNode) => (
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

  it('renders the auth variant with branding shorthand', () => {
    render(
      baseProvider(
        <AppShell
          variant="auth"
          branding={{
            brandName: 'Housebets',
            brandMark: <span data-testid="brand-mark">HB</span>,
            appName: 'Auto',
            tagline: 'by Housebets',
          }}
          preview={<div data-testid="auth-preview">Preview</div>}
        >
          <input aria-label="email" />
        </AppShell>
      )
    );

    expect(screen.getByRole('heading', { name: 'Auto' })).toBeInTheDocument();
    expect(screen.getByText('by Housebets')).toBeInTheDocument();
    expect(screen.getAllByTestId('brand-mark')).toHaveLength(2);
    expect(screen.getByTestId('auth-preview')).toBeInTheDocument();
    expect(screen.getByLabelText('email')).toBeInTheDocument();
  });

  it('lets auth config override branding shorthand fields', () => {
    render(
      baseProvider(
        <AppShell
          variant="auth"
          auth={{ title: 'Admin sign in', brandName: 'Meda Admin' }}
          branding={{ brandName: 'Housebets', appName: 'Auto' }}
        >
          <input aria-label="email" />
        </AppShell>
      )
    );

    expect(screen.getByRole('heading', { name: 'Admin sign in' })).toBeInTheDocument();
    expect(screen.getByText('Meda Admin')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Auto' })).not.toBeInTheDocument();
  });

  it('renders the workspace variant when variant="workspace"', () => {
    render(
      baseProvider(
        <AppShell
          variant="workspace"
          iconRail={{
            mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: Inbox }],
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
