import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Checkbox } from '../../../src/primitives/checkbox.js';

describe('Checkbox', () => {
  it('is a native checkbox with the data-slot hook', () => {
    render(<Checkbox aria-label="Accept terms" />);
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(box.tagName).toBe('INPUT');
    expect(box).toHaveAttribute('type', 'checkbox');
    expect(box).toHaveAttribute('data-slot', 'checkbox');
    expect(box).toHaveClass('size-4', 'rounded-[4px]', 'border-input', 'checked:bg-primary');
    expect(box).not.toBeChecked();
  });

  it('reports the next state through onCheckedChange and onChange', () => {
    const onCheckedChange = vi.fn();
    const onChange = vi.fn();
    render(<Checkbox aria-label="News" onCheckedChange={onCheckedChange} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it('supports controlled and defaultChecked usage', () => {
    const { rerender } = render(<Checkbox aria-label="A" checked onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).toBeChecked();
    rerender(<Checkbox aria-label="A" checked={false} onChange={() => {}} />);
    expect(screen.getByRole('checkbox')).not.toBeChecked();
    rerender(<Checkbox aria-label="B" key="b" defaultChecked />);
    expect(screen.getByRole('checkbox', { name: 'B' })).toBeChecked();
  });

  it('toggles from its label', () => {
    render(
      <>
        <Checkbox id="terms" />
        <label htmlFor="terms">I accept</label>
      </>
    );
    fireEvent.click(screen.getByText('I accept'));
    expect(screen.getByRole('checkbox', { name: 'I accept' })).toBeChecked();
  });

  it('invalid sets aria-invalid and data-invalid; explicit aria-invalid wins', () => {
    const { rerender } = render(<Checkbox aria-label="T" invalid />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('checkbox')).toHaveAttribute('data-invalid', '');
    rerender(<Checkbox aria-label="T" invalid aria-invalid={false} />);
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('checkbox')).not.toHaveAttribute('data-invalid');
  });

  it('passes disabled, className, rootClassName and refs through', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox aria-label="D" disabled className="x" rootClassName="y" ref={ref} />);
    const box = screen.getByRole('checkbox');
    expect(box).toBeDisabled();
    expect(box).toHaveClass('x');
    expect(box.parentElement).toHaveClass('y');
    expect(ref.current).toBe(box);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Checkbox id="c1" />
        <label htmlFor="c1">Send me news</label>
      </div>
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
