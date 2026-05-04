import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BuilderDndWrapper } from '../dnd-wrapper.js';

describe('BuilderDndWrapper', () => {
  it('renders children', () => {
    render(
      <BuilderDndWrapper blockIds={['a', 'b']} onDragEnd={vi.fn()}>
        <div data-testid="child">child content</div>
      </BuilderDndWrapper>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('renders without blockIds', () => {
    render(
      <BuilderDndWrapper blockIds={[]} onDragEnd={vi.fn()}>
        <span data-testid="empty-child">empty</span>
      </BuilderDndWrapper>
    );
    expect(screen.getByTestId('empty-child')).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <BuilderDndWrapper blockIds={['x', 'y', 'z']} onDragEnd={vi.fn()}>
        <div data-testid="first">first</div>
        <div data-testid="second">second</div>
      </BuilderDndWrapper>
    );
    expect(screen.getByTestId('first')).toBeInTheDocument();
    expect(screen.getByTestId('second')).toBeInTheDocument();
  });
});
