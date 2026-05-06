import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FloatingBar } from '../../../src/email-builder/floating-bar.js';
import { defaultEmailBuilderLabels } from '../../../src/email-builder/types.js';

const labels = defaultEmailBuilderLabels;

describe('FloatingBar', () => {
  it('renders all four action buttons', () => {
    render(
      <FloatingBar
        labels={labels}
        canMoveUp
        canMoveDown
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: labels.moveUp })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.moveDown })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.duplicateBlock })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: labels.deleteBlock })).toBeInTheDocument();
  });

  it('disables move-up when canMoveUp is false', () => {
    render(
      <FloatingBar
        labels={labels}
        canMoveUp={false}
        canMoveDown
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: labels.moveUp })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.moveDown })).not.toBeDisabled();
  });

  it('disables move-down when canMoveDown is false', () => {
    render(
      <FloatingBar
        labels={labels}
        canMoveUp
        canMoveDown={false}
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    expect(screen.getByRole('button', { name: labels.moveDown })).toBeDisabled();
    expect(screen.getByRole('button', { name: labels.moveUp })).not.toBeDisabled();
  });

  it('calls onMoveUp when move-up button is clicked', () => {
    const onMoveUp = vi.fn();
    render(
      <FloatingBar
        labels={labels}
        canMoveUp
        canMoveDown
        onMoveUp={onMoveUp}
        onMoveDown={() => {}}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: labels.moveUp }));
    expect(onMoveUp).toHaveBeenCalledTimes(1);
  });

  it('calls onMoveDown when move-down button is clicked', () => {
    const onMoveDown = vi.fn();
    render(
      <FloatingBar
        labels={labels}
        canMoveUp
        canMoveDown
        onMoveUp={() => {}}
        onMoveDown={onMoveDown}
        onDuplicate={() => {}}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: labels.moveDown }));
    expect(onMoveDown).toHaveBeenCalledTimes(1);
  });

  it('calls onDuplicate when duplicate button is clicked', () => {
    const onDuplicate = vi.fn();
    render(
      <FloatingBar
        labels={labels}
        canMoveUp
        canMoveDown
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDuplicate={onDuplicate}
        onDelete={() => {}}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: labels.duplicateBlock }));
    expect(onDuplicate).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(
      <FloatingBar
        labels={labels}
        canMoveUp
        canMoveDown
        onMoveUp={() => {}}
        onMoveDown={() => {}}
        onDuplicate={() => {}}
        onDelete={onDelete}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: labels.deleteBlock }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
