import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BookingButton, bookingButtonClass } from '../../../src/booking/index.js';

describe('BookingButton radius', () => {
  it('keeps booking’s near-square corners by default', () => {
    render(<BookingButton>Neste</BookingButton>);
    const button = screen.getByRole('button', { name: 'Neste' });
    expect(button).toHaveClass('rounded-[3px]');
    expect(button).not.toHaveClass('rounded-full');
    expect(bookingButtonClass()).toBe(bookingButtonClass({ radius: 'default' }));
  });

  it('draws a pill with `radius="full"`, whatever the size', () => {
    render(
      <BookingButton radius="full" size="sm">
        Neste
      </BookingButton>
    );
    const button = screen.getByRole('button', { name: 'Neste' });
    expect(button).toHaveClass('rounded-full');
    expect(button).not.toHaveClass('rounded-[3px]');
    expect(button.className).not.toContain('rounded-[min(');
  });

  it('lets a className still win over the radius', () => {
    expect(bookingButtonClass({ radius: 'full', className: 'rounded-none' })).toContain(
      'rounded-none'
    );
    expect(bookingButtonClass({ radius: 'full', className: 'rounded-none' })).not.toContain(
      'rounded-full'
    );
  });
});
