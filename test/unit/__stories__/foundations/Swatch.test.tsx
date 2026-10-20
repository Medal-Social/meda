import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Swatch } from '../../../../src/__stories__/foundations/Swatch';

describe('Swatch', () => {
  it('renders the token name and CSS variable', () => {
    render(<Swatch name="brand-500" cssVar="--color-brand-500" />);
    expect(screen.getByText('brand-500')).toBeInTheDocument();
    expect(screen.getByText('--color-brand-500')).toBeInTheDocument();
  });

  it('applies the css var as the swatch background', () => {
    const { container } = render(<Swatch name="brand-500" cssVar="--color-brand-500" />);
    const tile = container.querySelector<HTMLElement>('[data-swatch-tile]');
    // Specified inline value, not getComputedStyle(). jsdom 30.1.3 serializes a
    // computed `background` shorthand that contains a custom property as the
    // initial value, so `toHaveStyle` no longer observes the variable.
    expect(tile).not.toBeNull();
    expect(tile?.style.background).toBe('var(--color-brand-500)');
  });

  it('shows a hex value when provided', () => {
    render(<Swatch name="brand-500" cssVar="--color-brand-500" hex="#7e3fac" />);
    expect(screen.getByText('#7e3fac')).toBeInTheDocument();
  });
});
