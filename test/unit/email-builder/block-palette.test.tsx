import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BlockPalette } from '../../../src/email-builder/block-palette.js';

describe('BlockPalette', () => {
  it('lists all block kinds', () => {
    render(<BlockPalette onPick={() => {}} />);
    expect(screen.getByText('Heading')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('fires onPick with the block kind', () => {
    const onPick = vi.fn();
    render(<BlockPalette onPick={onPick} />);
    fireEvent.click(screen.getByText('Heading'));
    expect(onPick).toHaveBeenCalledWith('heading');
  });
});
