import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MotionScale } from './MotionScale';

describe('MotionScale', () => {
  it('renders a row per motion duration token', () => {
    render(<MotionScale />);
    for (const name of ['fast', 'default', 'panel', 'fullscreen']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getByText('140ms')).toBeInTheDocument();
    expect(screen.getByText('280ms')).toBeInTheDocument();
  });
});
