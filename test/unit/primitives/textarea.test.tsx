import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Textarea } from '../../../src/primitives/textarea.js';

describe('Textarea', () => {
  it('renders a textarea with the data-slot hook', () => {
    render(<Textarea aria-label="Note" />);
    const box = screen.getByRole('textbox', { name: 'Note' });
    expect(box.tagName).toBe('TEXTAREA');
    expect(box).toHaveAttribute('data-slot', 'textarea');
    expect(box).toHaveClass('field-sizing-content', 'min-h-16', 'border-input');
    expect(box).not.toHaveAttribute('aria-invalid');
  });

  it('invalid sets aria-invalid and data-invalid; explicit aria-invalid wins', () => {
    const { rerender } = render(<Textarea aria-label="N" invalid />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute('data-invalid', '');
    rerender(<Textarea aria-label="N" invalid aria-invalid={false} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
  });

  it('passes rows, maxLength, className and refs through', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea aria-label="N" rows={2} maxLength={500} className="custom" ref={ref} />);
    const box = screen.getByRole('textbox');
    expect(box).toHaveAttribute('rows', '2');
    expect(box).toHaveAttribute('maxlength', '500');
    expect(box).toHaveClass('custom');
    expect(ref.current).toBe(box);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <label htmlFor="t1">Note to the stylist</label>
        <Textarea id="t1" />
      </div>
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
