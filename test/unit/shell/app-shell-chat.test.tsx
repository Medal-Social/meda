import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn().mockReturnValue('desktop'),
}));

import { AppShellChat } from '../../../src/shell/app-shell-chat.js';

describe('AppShellChat', () => {
  it('renders the chat scaffolding and global actions slot', () => {
    render(
      <AppShellChat globalActions={<button type="button">New chat</button>}>
        <div data-testid="transcript">messages</div>
      </AppShellChat>
    );
    expect(screen.getByTestId('app-shell-chat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New chat' })).toBeInTheDocument();
    expect(screen.getByTestId('transcript')).toBeInTheDocument();
  });
});
