import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShadowScale } from './ShadowScale';

describe('ShadowScale', () => {
  it('renders a tile per shadow token with usage notes', () => {
    render(<ShadowScale />);
    expect(screen.getByText('shell-shadow')).toBeInTheDocument();
    expect(screen.getByText(/default shell-region elevation/i)).toBeInTheDocument();
  });
});
