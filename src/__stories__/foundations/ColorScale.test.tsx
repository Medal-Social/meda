import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColorScale } from './ColorScale';

describe('ColorScale', () => {
  it('renders all 11 stops for the brand ramp', () => {
    render(<ColorScale ramp="brand" />);
    for (const stop of [
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
    ]) {
      expect(screen.getByText(`brand-${stop}`)).toBeInTheDocument();
    }
  });

  it('renders the ramp label', () => {
    render(<ColorScale ramp="success" />);
    expect(screen.getByRole('heading', { name: /success/i })).toBeInTheDocument();
  });

  it('omits 950 for ramps that only go to 900', () => {
    render(<ColorScale ramp="error" />);
    expect(screen.queryByText('error-950')).not.toBeInTheDocument();
    expect(screen.getByText('error-900')).toBeInTheDocument();
  });
});
