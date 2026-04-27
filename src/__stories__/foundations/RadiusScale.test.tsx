import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RadiusScale } from './RadiusScale';

describe('RadiusScale', () => {
  it('renders sample squares for every radius token including full', () => {
    render(<RadiusScale />);
    expect(screen.getByText('sm')).toBeInTheDocument();
    expect(screen.getByText('full')).toBeInTheDocument();
    expect(screen.getByText('9999px')).toBeInTheDocument();
  });
});
