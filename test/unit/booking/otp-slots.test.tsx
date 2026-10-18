import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { otpSlotsLabelsNb as labels } from '../../../src/booking/__stories__/labels.portal.js';
import { OtpSlots, type OtpSlotsProps } from '../../../src/booking/otp-slots.js';

const LABEL = labels['otp.label'];

function Controlled({ initial, ...rest }: { initial: string } & Partial<OtpSlotsProps>) {
  const [value, setValue] = useState(initial);
  return <OtpSlots labels={labels} {...rest} value={value} onChange={setValue} />;
}

function activeSlot() {
  const slots = Array.from(document.querySelectorAll('[data-slot=otp-slot]'));
  return slots.findIndex((slot) => slot.hasAttribute('data-active'));
}

function input() {
  return screen.getByLabelText(LABEL) as HTMLInputElement;
}

describe('OtpSlots', () => {
  it('is one six-digit one-time-code field, not six form fields', () => {
    render(<OtpSlots labels={labels} value="" onChange={() => {}} />);

    const field = input();
    expect(field).toHaveAttribute('autocomplete', 'one-time-code');
    expect(field).toHaveAttribute('inputmode', 'numeric');
    expect(field).toHaveAttribute('pattern', '\\d*');
    expect(field).toHaveAttribute('minlength', '6');
    expect(field).toHaveAttribute('maxlength', '6');
    expect(field).toBeRequired();
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
    expect(document.querySelectorAll('[data-slot=otp-slot]')).toHaveLength(6);
  });

  it('keeps only digits, strips spaces, and caps at six', () => {
    const onChange = vi.fn();
    render(<OtpSlots labels={labels} value="" onChange={onChange} />);
    fireEvent.change(input(), { target: { value: '49 21 55 extra' } });
    expect(onChange).toHaveBeenCalledWith('492155');
  });

  it('calls onComplete once the sixth digit lands', () => {
    const onComplete = vi.fn();
    render(<OtpSlots labels={labels} value="49215" onChange={() => {}} onComplete={onComplete} />);
    fireEvent.change(input(), { target: { value: '492155' } });
    expect(onComplete).toHaveBeenCalledWith('492155');
  });

  it('pastes a formatted code into the single value', () => {
    const onChange = vi.fn();
    render(<OtpSlots labels={labels} value="" onChange={onChange} />);
    fireEvent.paste(input(), { clipboardData: { getData: () => '492 155' } });
    expect(onChange).toHaveBeenCalledWith('492155');
  });

  it('ignores input while read-only', () => {
    const onChange = vi.fn();
    render(<OtpSlots labels={labels} value="" readOnly onChange={onChange} />);
    fireEvent.paste(input(), { clipboardData: { getData: () => '492155' } });
    expect(onChange).not.toHaveBeenCalled();
    expect(input()).toHaveAttribute('aria-busy', 'true');
  });

  it('lets the six boxes shrink instead of overflowing the row', () => {
    const { container } = render(<OtpSlots labels={labels} value="" onChange={() => {}} />);
    const row = container.querySelector('[data-slot=otp-row]');
    const slot = container.querySelector('[data-slot=otp-slot]');
    expect(row).toHaveClass('grid', 'grid-cols-6');
    expect(slot).toHaveClass('min-w-0', 'w-full');
    expect(slot).not.toHaveClass('size-12');
  });

  it('marks every box when invalid', () => {
    render(<OtpSlots labels={labels} value="12" invalid onChange={() => {}} />);
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    for (const slot of document.querySelectorAll('[data-slot=otp-slot]')) {
      expect(slot).toHaveClass('border-destructive');
    }
  });

  describe('keyboard', () => {
    it('lets ArrowLeft reach an earlier digit so Backspace can delete it', () => {
      const onChange = vi.fn();
      render(<OtpSlots labels={labels} value="492155" onChange={onChange} />);
      const field = input();
      field.setSelectionRange(3, 3);
      fireEvent.keyDown(field, { key: 'ArrowLeft' });
      expect(field.selectionStart).toBe(3);

      field.setSelectionRange(3, 3);
      fireEvent.keyDown(field, { key: 'Backspace' });
      expect(onChange).toHaveBeenCalledWith('49155');
    });

    it('highlights the box after the last digit while typing in order', () => {
      render(<Controlled initial="" />);
      const field = input();
      expect(activeSlot()).toBe(0);
      fireEvent.change(field, { target: { value: '4' } });
      fireEvent.keyUp(field, { key: '4' });
      expect(activeSlot()).toBe(1);
      fireEvent.change(field, { target: { value: '49' } });
      fireEvent.keyUp(field, { key: '9' });
      expect(activeSlot()).toBe(2);
    });

    it('moves the highlight with the caret after ArrowLeft, and types there', () => {
      render(<Controlled initial="492" />);
      const field = input();
      expect(activeSlot()).toBe(3);

      // The browser moves the caret on ArrowLeft; the component only observes it.
      field.setSelectionRange(1, 1);
      fireEvent.keyUp(field, { key: 'ArrowLeft' });
      expect(activeSlot()).toBe(1);

      fireEvent.change(field, { target: { value: '4192', selectionStart: 2, selectionEnd: 2 } });
      expect(field.value).toBe('4192');
      expect(activeSlot()).toBe(2);
    });

    it('moves the highlight right with ArrowRight', () => {
      render(<Controlled initial="4921" />);
      const field = input();
      field.setSelectionRange(1, 1);
      fireEvent.keyUp(field, { key: 'ArrowLeft' });
      expect(activeSlot()).toBe(1);
      field.setSelectionRange(2, 2);
      fireEvent.keyUp(field, { key: 'ArrowRight' });
      expect(activeSlot()).toBe(2);
    });

    it('highlights the slot Backspace will delete from next', () => {
      render(<Controlled initial="492155" />);
      const field = input();

      field.setSelectionRange(3, 3);
      fireEvent.click(field);
      expect(activeSlot()).toBe(3);

      fireEvent.keyDown(field, { key: 'Backspace' });
      expect(field.value).toBe('49155');
      expect(activeSlot()).toBe(2);

      // The keydown was prevented, so the component moves the caret itself;
      // the keyup that follows must not drag the highlight back.
      expect(field.selectionStart).toBe(2);
      fireEvent.keyUp(field, { key: 'Backspace' });
      expect(activeSlot()).toBe(2);

      fireEvent.keyDown(field, { key: 'Backspace' });
      fireEvent.keyUp(field, { key: 'Backspace' });
      expect(field.value).toBe('4155');
      expect(field.selectionStart).toBe(1);
      expect(activeSlot()).toBe(1);
    });

    it('deletes a selected range with one Backspace', () => {
      render(<Controlled initial="492155" />);
      const field = input();
      field.setSelectionRange(1, 4);
      fireEvent.keyDown(field, { key: 'Backspace' });
      expect(field.value).toBe('455');
      expect(field.selectionStart).toBe(1);
    });

    it('leaves Backspace at the start to the browser', () => {
      const onChange = vi.fn();
      render(<OtpSlots labels={labels} value="492" onChange={onChange} />);
      const field = input();
      field.setSelectionRange(0, 0);
      fireEvent.keyDown(field, { key: 'Backspace' });
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('overrides', () => {
    it('takes its accessible name from labels', () => {
      render(<OtpSlots labels={{ 'otp.label': 'Your code' }} value="" onChange={() => {}} />);
      expect(screen.getByLabelText('Your code')).toBeInTheDocument();
    });

    it('lands classNames on their slots', () => {
      const { container } = render(
        <Controlled
          initial="12"
          classNames={{
            root: 'x-root',
            row: 'x-row',
            slot: 'x-slot',
            slotActive: 'x-active',
            slotFilled: 'x-filled',
          }}
        />
      );
      expect(container.firstElementChild).toHaveClass('x-root');
      expect(container.querySelector('[data-slot=otp-row]')).toHaveClass('x-row');
      const slots = container.querySelectorAll('[data-slot=otp-slot]');
      expect(slots[0]).toHaveClass('x-slot', 'x-filled');
      expect(slots[2]).toHaveClass('x-slot', 'x-active');
      expect(slots[3]).not.toHaveClass('x-active');
    });
  });

  it('has no axe violations', async () => {
    const { container } = render(<OtpSlots labels={labels} value="49" onChange={() => {}} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
