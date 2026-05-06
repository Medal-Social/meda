import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Textarea } from '../../../../src/post-preview/internal/textarea.js';

describe('Textarea (post-preview internal)', () => {
  it('renders a textarea element', () => {
    render(<Textarea aria-label="content" />);
    expect(screen.getByRole('textbox', { name: 'content' })).toBeInTheDocument();
  });

  it('forwards ref to the underlying element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="content" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('fires onChange when the user types', () => {
    const onChange = vi.fn();
    render(<Textarea aria-label="content" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'content' }), {
      target: { value: 'hi' },
    });
    expect(onChange).toHaveBeenCalled();
  });

  it('merges className with defaults', () => {
    render(<Textarea aria-label="content" className="custom" />);
    expect(screen.getByRole('textbox', { name: 'content' })).toHaveClass('custom');
  });
});
