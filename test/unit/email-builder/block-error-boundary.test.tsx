import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BlockErrorBoundary } from '../block-error-boundary.js';

function ThrowOnce({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('block render failed');
  }
  return <span>child content</span>;
}

describe('BlockErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <BlockErrorBoundary blockId="b1">
        <span>child content</span>
      </BlockErrorBoundary>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('renders the error UI when a child throws', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <BlockErrorBoundary blockId="b1">
        <ThrowOnce shouldThrow />
      </BlockErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/block failed to render/i)).toBeInTheDocument();
    expect(screen.getByText(/block render failed/)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('shows the block error message in the alert', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <BlockErrorBoundary blockId="b2">
        <ThrowOnce shouldThrow />
      </BlockErrorBoundary>
    );
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('block render failed');
    consoleSpy.mockRestore();
  });
});
