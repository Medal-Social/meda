import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TypographyRamp } from './TypographyRamp';

describe('TypographyRamp', () => {
  it('renders sample text for each font size token', () => {
    render(<TypographyRamp />);
    for (const name of ['display', 'h1', 'h2', 'h3', 'body', 'caption', 'overline']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('renders pixel value next to each token', () => {
    render(<TypographyRamp />);
    expect(screen.getByText('36px')).toBeInTheDocument();
    expect(screen.getByText('14px')).toBeInTheDocument();
  });
});
