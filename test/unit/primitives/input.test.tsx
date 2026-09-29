import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Input } from '../../../src/primitives/input.js';

describe('Input', () => {
  it('renders a text input with the data-slot hook', () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('data-slot', 'input');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('invalid sets aria-invalid and the data-invalid hook', () => {
    render(<Input aria-label="Email" invalid aria-describedby="err" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('data-invalid', '');
    expect(input).toHaveAttribute('aria-describedby', 'err');
    expect(input).toHaveClass('aria-invalid:border-destructive');
  });

  it('an explicit aria-invalid wins over the invalid prop', () => {
    render(<Input aria-label="Email" invalid aria-invalid={false} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('textbox')).not.toHaveAttribute('data-invalid');
  });

  it('passes through type, disabled, className and refs', () => {
    let node: HTMLInputElement | null = null;
    render(
      <Input
        aria-label="Phone"
        type="tel"
        disabled
        className="custom"
        ref={(el) => {
          node = el;
        }}
      />
    );
    const input = screen.getByLabelText('Phone');
    expect(input).toHaveAttribute('type', 'tel');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('custom');
    expect(node).toBe(input);
  });

  it('has no axe violations (labelled, invalid with description)', async () => {
    const { container } = render(
      <div>
        <label htmlFor="email">Email</label>
        <Input id="email" invalid aria-describedby="email-error" />
        <p id="email-error">Enter a valid e-mail address.</p>
      </div>
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
