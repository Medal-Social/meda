import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Field } from '../../../src/primitives/field.js';
import { Input } from '../../../src/primitives/input.js';

describe('Field', () => {
  it('lays out label, control, description and error with data-slot hooks', () => {
    render(
      <Field data-testid="field">
        <Field.Label htmlFor="email">E-mail</Field.Label>
        <Input id="email" aria-describedby="email-hint email-error" invalid />
        <Field.Description id="email-hint">We send the confirmation here.</Field.Description>
        <Field.Error id="email-error">Enter a valid e-mail address.</Field.Error>
      </Field>
    );
    const field = screen.getByTestId('field');
    expect(field).toHaveAttribute('data-slot', 'field');
    expect(field).toHaveAttribute('data-orientation', 'vertical');
    expect(field).toHaveClass('grid', 'gap-2', 'group/field');
    expect(screen.getByText('E-mail')).toHaveAttribute('data-slot', 'field-label');
    expect(screen.getByText('We send the confirmation here.')).toHaveClass('text-muted-foreground');
    expect(screen.getByText('Enter a valid e-mail address.')).toHaveClass('text-destructive');
    expect(screen.getByRole('textbox', { name: 'E-mail' })).toHaveAccessibleDescription(
      'We send the confirmation here. Enter a valid e-mail address.'
    );
  });

  it('horizontal orientation puts the control beside the label', () => {
    render(<Field data-testid="f" orientation="horizontal" />);
    expect(screen.getByTestId('f')).toHaveClass('grid-cols-[auto_1fr]', 'items-center');
  });

  it('Field.Error renders nothing when empty and each unique message from errors', () => {
    const { container, rerender } = render(<Field.Error />);
    expect(container).toBeEmptyDOMElement();
    rerender(<Field.Error id="errs" errors={['Too short', 'Too short', 'Missing @']} />);
    expect(screen.getAllByText(/Too short|Missing @/)).toHaveLength(2);
    for (const node of screen.getAllByText(/Too short|Missing @/)) {
      expect(node).toHaveAttribute('data-slot', 'field-error');
      expect(node).not.toHaveAttribute('id');
    }
    expect(container.querySelectorAll('#errs')).toHaveLength(1);
    expect(container.querySelector('#errs')).toHaveTextContent('Too shortMissing @');
  });

  it('a disabled field (prop or disabled control) carries the dimming hooks', () => {
    render(
      <Field data-testid="f" disabled>
        <Field.Label htmlFor="x">X</Field.Label>
        <Input id="x" disabled />
      </Field>
    );
    expect(screen.getByTestId('f')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByText('X')).toHaveClass(
      'group-has-disabled/field:opacity-50',
      'group-data-[disabled=true]/field:opacity-50'
    );
  });

  it('Field.Set and Field.Legend group related controls', () => {
    render(
      <Field.Set>
        <Field.Legend>Consent</Field.Legend>
      </Field.Set>
    );
    expect(screen.getByRole('group', { name: 'Consent' })).toHaveAttribute(
      'data-slot',
      'field-set'
    );
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Field>
        <Field.Label htmlFor="n">Name</Field.Label>
        <Input id="n" />
        <Field.Description>As on your ID.</Field.Description>
      </Field>
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
