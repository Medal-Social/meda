import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton.js';

describe('Skeleton', () => {
  it('renders a hidden loading placeholder with Meda token classes', () => {
    render(<Skeleton data-testid="loading-title" className="h-4 w-32" />);

    const skeleton = screen.getByTestId('loading-title');
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-muted');
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('w-32');
  });

  it('allows consumers to override aria-hidden when the placeholder has an accessible role', () => {
    render(<Skeleton aria-hidden={false} role="status" aria-label="Loading account" />);

    const skeleton = screen.getByRole('status', { name: 'Loading account' });
    expect(skeleton).toHaveAttribute('aria-hidden', 'false');
  });
});
