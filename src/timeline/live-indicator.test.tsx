import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LiveIndicator } from './live-indicator.js';

describe('LiveIndicator', () => {
  it('renders LIVE label', () => {
    render(<LiveIndicator now={new Date('2026-04-26T15:24:09Z')} />);
    expect(screen.getByText(/live/i)).toBeInTheDocument();
  });

  it('formats now as HH:MM:SS', () => {
    render(<LiveIndicator now={new Date('2026-04-26T15:24:09Z')} tz="UTC" />);
    expect(screen.getByText('15:24:09')).toBeInTheDocument();
  });

  it('exposes role="status" for accessibility', () => {
    const { container } = render(<LiveIndicator now={new Date()} />);
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });
});
