import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Swatch } from './Swatch';

describe('Swatch', () => {
  it('renders the token name and CSS variable', () => {
    render(<Swatch name="brand-500" cssVar="--color-brand-500" />);
    expect(screen.getByText('brand-500')).toBeInTheDocument();
    expect(screen.getByText('--color-brand-500')).toBeInTheDocument();
  });

  it('applies the css var as the swatch background', () => {
    const { container } = render(<Swatch name="brand-500" cssVar="--color-brand-500" />);
    const tile = container.querySelector('[data-swatch-tile]');
    expect(tile).toHaveStyle('background: var(--color-brand-500)');
  });

  it('shows a hex value when provided', () => {
    render(<Swatch name="brand-500" cssVar="--color-brand-500" hex="#7e3fac" />);
    expect(screen.getByText('#7e3fac')).toBeInTheDocument();
  });
});
