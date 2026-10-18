import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { ToggleGroup } from '../../../src/primitives/toggle-group.js';

function Slots(props: { defaultValue?: string; onValueChange?: (v: string) => void }) {
  return (
    <ToggleGroup aria-label="Time" {...props}>
      <ToggleGroup.Item value="09:00">09:00</ToggleGroup.Item>
      <ToggleGroup.Item value="10:00" disabled>
        10:00
      </ToggleGroup.Item>
      <ToggleGroup.Item value="11:00">11:00</ToggleGroup.Item>
      <ToggleGroup.Item value="12:00">12:00</ToggleGroup.Item>
    </ToggleGroup>
  );
}

describe('ToggleGroup (single)', () => {
  it('is a radiogroup of radios with aria-checked', () => {
    render(<Slots defaultValue="11:00" />);
    expect(screen.getByRole('radiogroup', { name: 'Time' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '11:00' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '09:00' })).toHaveAttribute('aria-checked', 'false');
  });

  it('selects on click and cannot be deselected by clicking again', () => {
    const onValueChange = vi.fn();
    render(<Slots onValueChange={onValueChange} />);
    const nine = screen.getByRole('radio', { name: '09:00' });
    fireEvent.click(nine);
    expect(nine).toHaveAttribute('aria-checked', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith('09:00');

    fireEvent.click(nine);
    expect(nine).toHaveAttribute('aria-checked', 'true');
    expect(onValueChange).toHaveBeenCalledTimes(1);
  });

  it('uses a roving tabindex anchored on the checked item', () => {
    render(<Slots defaultValue="11:00" />);
    const tabbable = screen.getAllByRole('radio').filter((r) => r.tabIndex === 0);
    expect(tabbable.map((r) => r.textContent)).toEqual(['11:00']);
  });

  it('puts the first enabled item in the tab order when nothing is checked', () => {
    render(<Slots />);
    const tabbable = screen.getAllByRole('radio').filter((r) => r.tabIndex === 0);
    expect(tabbable.map((r) => r.textContent)).toEqual(['09:00']);
  });

  it('arrow keys move focus AND selection, skipping disabled items and wrapping', () => {
    const onValueChange = vi.fn();
    render(<Slots defaultValue="09:00" onValueChange={onValueChange} />);
    const nine = screen.getByRole('radio', { name: '09:00' });
    nine.focus();

    fireEvent.keyDown(nine, { key: 'ArrowRight' });
    const eleven = screen.getByRole('radio', { name: '11:00' });
    expect(eleven).toHaveFocus();
    expect(eleven).toHaveAttribute('aria-checked', 'true');
    expect(onValueChange).toHaveBeenLastCalledWith('11:00');

    fireEvent.keyDown(eleven, { key: 'End' });
    expect(screen.getByRole('radio', { name: '12:00' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('radio', { name: '12:00' }), { key: 'ArrowRight' });
    expect(nine).toHaveFocus();

    fireEvent.keyDown(nine, { key: 'ArrowLeft' });
    expect(screen.getByRole('radio', { name: '12:00' })).toHaveFocus();

    fireEvent.keyDown(screen.getByRole('radio', { name: '12:00' }), { key: 'Home' });
    expect(nine).toHaveFocus();
    expect(nine.tabIndex).toBe(0);
  });

  it('supports controlled usage', () => {
    function Controlled() {
      const [value, setValue] = useState<string | null>('12:00');
      return (
        <>
          <ToggleGroup aria-label="Time" value={value} onValueChange={setValue}>
            <ToggleGroup.Item value="09:00">09:00</ToggleGroup.Item>
            <ToggleGroup.Item value="12:00">12:00</ToggleGroup.Item>
          </ToggleGroup>
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('radio', { name: '09:00' }));
    expect(screen.getByRole('status')).toHaveTextContent('09:00');
    expect(screen.getByRole('radio', { name: '09:00' })).toHaveAttribute('aria-checked', 'true');
  });
});

describe('ToggleGroup (multiple)', () => {
  function Filters(props: { onValueChange?: (v: string[]) => void }) {
    return (
      <ToggleGroup type="multiple" aria-label="Age" defaultValue={['kids']} {...props}>
        <ToggleGroup.Item value="baby">Baby</ToggleGroup.Item>
        <ToggleGroup.Item value="kids">Kids</ToggleGroup.Item>
        <ToggleGroup.Item value="teens">Teens</ToggleGroup.Item>
      </ToggleGroup>
    );
  }

  it('is a group of aria-pressed buttons', () => {
    render(<Filters />);
    expect(screen.getByRole('group', { name: 'Age' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kids' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Baby' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles items independently', () => {
    const onValueChange = vi.fn();
    render(<Filters onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Baby' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['kids', 'baby']);
    fireEvent.click(screen.getByRole('button', { name: 'Kids' }));
    expect(onValueChange).toHaveBeenLastCalledWith(['baby']);
    expect(screen.getByRole('button', { name: 'Kids' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('arrow keys move focus without changing the selection', () => {
    const onValueChange = vi.fn();
    render(<Filters onValueChange={onValueChange} />);
    const kids = screen.getByRole('button', { name: 'Kids' });
    kids.focus();
    fireEvent.keyDown(kids, { key: 'ArrowRight' });
    expect(screen.getByRole('button', { name: 'Teens' })).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('disables every item when the group is disabled', () => {
    render(
      <ToggleGroup type="multiple" aria-label="Age" disabled>
        <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        <ToggleGroup.Item value="b">B</ToggleGroup.Item>
      </ToggleGroup>
    );
    for (const button of screen.getAllByRole('button')) expect(button).toBeDisabled();
  });
});

describe('ToggleGroup a11y', () => {
  it('has no axe violations in either mode', async () => {
    const { container } = render(
      <div>
        <Slots defaultValue="09:00" />
        <ToggleGroup type="multiple" aria-label="Age">
          <ToggleGroup.Item value="a">A</ToggleGroup.Item>
        </ToggleGroup>
      </div>
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });

  it('throws a helpful error when an item is rendered outside a group', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ToggleGroup.Item value="x">X</ToggleGroup.Item>)).toThrow(
      /inside <ToggleGroup>/
    );
    spy.mockRestore();
  });
});
