import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusPill } from '../../../src/primitives/status-pill.js';

describe('StatusPill', () => {
  it('renders the label and a leading dot by default', () => {
    render(<StatusPill data-testid="pill">In flight</StatusPill>);

    const pill = screen.getByTestId('pill');
    expect(pill).toHaveTextContent('In flight');
    expect(pill).toHaveAttribute('data-tone', 'neutral');
    expect(pill).toHaveAttribute('data-size', 'sm');
    expect(pill.querySelector('[data-slot="status-pill-dot"]')).not.toBeNull();
  });

  it('omits the dot when dot={false}', () => {
    render(
      <StatusPill data-testid="pill" dot={false}>
        Connected
      </StatusPill>
    );
    expect(screen.getByTestId('pill').querySelector('[data-slot="status-pill-dot"]')).toBeNull();
  });

  it('reflects tone and size in data-attributes', () => {
    const { rerender } = render(
      <StatusPill data-testid="pill" tone="success" size="md">
        Done
      </StatusPill>
    );
    expect(screen.getByTestId('pill')).toHaveAttribute('data-tone', 'success');
    expect(screen.getByTestId('pill')).toHaveAttribute('data-size', 'md');

    rerender(
      <StatusPill data-testid="pill" tone="danger" size="sm">
        Failed
      </StatusPill>
    );
    expect(screen.getByTestId('pill')).toHaveAttribute('data-tone', 'danger');
    expect(screen.getByTestId('pill')).toHaveAttribute('data-size', 'sm');
  });

  it('marks the dot as decorative for assistive tech', () => {
    render(<StatusPill data-testid="pill">Idle</StatusPill>);
    const dot = screen.getByTestId('pill').querySelector('[data-slot="status-pill-dot"]');
    expect(dot).toHaveAttribute('aria-hidden', 'true');
  });

  it('forwards className and arbitrary HTML attributes', () => {
    render(
      <StatusPill data-testid="pill" className="custom-pill" role="status" aria-label="Online">
        Online
      </StatusPill>
    );

    const pill = screen.getByTestId('pill');
    expect(pill).toHaveClass('custom-pill');
    expect(screen.getByRole('status', { name: 'Online' })).toBe(pill);
  });
});
