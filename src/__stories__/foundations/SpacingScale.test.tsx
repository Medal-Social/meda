import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpacingScale } from './SpacingScale';

describe('SpacingScale', () => {
  it('renders all 8 spacing tokens with their pixel values', () => {
    render(<SpacingScale />);
    expect(screen.getByText('xs')).toBeInTheDocument();
    expect(screen.getByText('4xl')).toBeInTheDocument();
    expect(screen.getByText('4px')).toBeInTheDocument();
    expect(screen.getByText('64px')).toBeInTheDocument();
  });
});
