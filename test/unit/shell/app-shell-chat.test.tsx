import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/shell/use-shell-viewport.js', () => ({
  useShellViewport: vi.fn().mockReturnValue('desktop'),
}));

import { AppShellChat } from '../../../src/shell/app-shell-chat.js';
import { useShellViewport } from '../../../src/shell/use-shell-viewport.js';

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

  it('applies mobile padding when viewport is mobile', () => {
    // biome-ignore lint/suspicious/noExplicitAny: test mock
    (useShellViewport as any).mockReturnValue('mobile');
    const { container } = render(
      <AppShellChat>
        <div>content</div>
      </AppShellChat>
    );
    // On mobile the scroll area gets px-2 py-3 instead of px-6 py-4
    const scrollArea = container.querySelector('[class*="overflow-y-auto"]');
    expect(scrollArea?.className).toContain('px-2');
    expect(scrollArea?.className).toContain('py-3');
  });
});
