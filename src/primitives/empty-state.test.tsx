import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state.js';

describe('EmptyState', () => {
  it('renders title, description, Lucide icon, and action', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No messages"
        description="New conversations will appear here."
        action={<button type="button">Compose</button>}
      />
    );

    expect(screen.getByRole('heading', { name: 'No messages' })).toBeInTheDocument();
    expect(screen.getByText('New conversations will appear here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a custom icon node', () => {
    render(
      <EmptyState
        icon={<span data-testid="custom-icon">!</span>}
        title="Could not load records"
        description="Refresh the page and try again."
      />
    );

    expect(screen.getByTestId('custom-icon')).toHaveTextContent('!');
    expect(screen.getByRole('heading', { name: 'Could not load records' })).toBeInTheDocument();
  });

  it('applies variant classes for default, panel, and inline density', () => {
    const { rerender } = render(<EmptyState title="Default empty" data-testid="state" />);
    expect(screen.getByTestId('state')).toHaveAttribute('data-variant', 'default');
    expect(screen.getByTestId('state')).toHaveClass('py-16');

    rerender(<EmptyState title="Panel empty" variant="panel" data-testid="state" />);
    expect(screen.getByTestId('state')).toHaveAttribute('data-variant', 'panel');
    expect(screen.getByTestId('state')).toHaveClass('py-10');

    rerender(<EmptyState title="Inline empty" variant="inline" data-testid="state" />);
    expect(screen.getByTestId('state')).toHaveAttribute('data-variant', 'inline');
    expect(screen.getByTestId('state')).toHaveClass('py-6');
  });
});
