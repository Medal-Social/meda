import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Sheet, type SheetProps } from '../../../src/primitives/sheet.js';

function Demo(props: Omit<SheetProps, 'children'>) {
  return (
    <>
      <button type="button">Before</button>
      <Sheet {...props}>
        <Sheet.Trigger>Add child</Sheet.Trigger>
        <Sheet.Content data-testid="sheet">
          <Sheet.Title>Add child</Sheet.Title>
          <Sheet.Description>Only for this booking.</Sheet.Description>
          <label htmlFor="child-name">Name</label>
          <input id="child-name" />
          <Sheet.Close aria-label="Close">×</Sheet.Close>
        </Sheet.Content>
      </Sheet>
    </>
  );
}

afterEach(() => {
  document.documentElement.style.overflow = '';
});

describe('Sheet', () => {
  it('is closed until the trigger is pressed, then renders a labelled modal dialog', () => {
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: 'Add child' });
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Add child' });
    expect(dialog.tagName).toBe('DIALOG');
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Only for this booking.');
    expect(dialog).toHaveAttribute('data-side', 'responsive');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus into the sheet and returns it to the trigger on close', () => {
    render(<Demo />);
    const trigger = screen.getByRole('button', { name: 'Add child' });
    trigger.focus();
    fireEvent.click(trigger);
    expect(screen.getByLabelText('Name')).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('focuses an [autofocus] element first when there is one', () => {
    render(
      <Sheet defaultOpen>
        <Sheet.Content>
          <Sheet.Title>Code</Sheet.Title>
          <button type="button">First</button>
          {/* biome-ignore lint/a11y/noAutofocus: exercising the autofocus path */}
          <input aria-label="Code" autoFocus />
        </Sheet.Content>
      </Sheet>
    );
    expect(screen.getByRole('textbox', { name: 'Code' })).toHaveFocus();
  });

  it('Escape closes it (keyboard)', () => {
    const onOpenChange = vi.fn();
    render(<Demo onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add child' }));
    fireEvent.keyDown(screen.getByLabelText('Name'), { key: 'Escape' });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('the native cancel event closes it too', () => {
    render(<Demo defaultOpen />);
    fireEvent(screen.getByRole('dialog'), new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('a click on the backdrop (the dialog itself) closes; a click inside does not', () => {
    render(<Demo defaultOpen />);
    fireEvent.click(screen.getByLabelText('Name'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('sheet'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('dismissible={false} ignores Escape, backdrop and Close', () => {
    const onOpenChange = vi.fn();
    render(<Demo defaultOpen dismissible={false} onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByLabelText('Name'), { key: 'Escape' });
    fireEvent.click(screen.getByTestId('sheet'));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('works controlled', () => {
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <Sheet open={open} onOpenChange={setOpen}>
            <Sheet.Trigger>Open</Sheet.Trigger>
            <Sheet.Content>
              <Sheet.Title>T</Sheet.Title>
              <Sheet.Close>Done</Sheet.Close>
            </Sheet.Content>
          </Sheet>
        </>
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByTestId('state')).toHaveTextContent('true');
    fireEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByTestId('state')).toHaveTextContent('false');
  });

  it('locks page scroll while open and restores it', () => {
    document.documentElement.style.overflow = 'auto';
    render(<Demo />);
    fireEvent.click(screen.getByRole('button', { name: 'Add child' }));
    expect(document.documentElement.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(document.documentElement.style.overflow).toBe('auto');
  });

  it('uses showModal()/close() where the engine has them', () => {
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    const close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
    const proto = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
    proto.showModal = showModal;
    proto.close = close;
    try {
      render(<Demo />);
      fireEvent.click(screen.getByRole('button', { name: 'Add child' }));
      expect(showModal).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(close).toHaveBeenCalledTimes(1);
    } finally {
      delete proto.showModal;
      delete proto.close;
    }
  });

  it('side variants and render props for Trigger / Close', () => {
    render(
      <Sheet defaultOpen>
        <Sheet.Trigger render={<a href="#x">Open link</a>} />
        <Sheet.Content side="bottom">
          <Sheet.Title>Bottom</Sheet.Title>
          <Sheet.Close render={<button type="button" className="ghost" />}>Done</Sheet.Close>
          <Sheet.Close render={<button type="button">Own label</button>} />
        </Sheet.Content>
      </Sheet>
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'bottom');
    expect(screen.getByRole('link', { name: 'Open link' })).toHaveAttribute(
      'data-slot',
      'sheet-trigger'
    );
    expect(screen.getByRole('button', { name: 'Done' })).toHaveClass('ghost');
    expect(screen.getByRole('button', { name: 'Own label' })).toHaveAttribute(
      'data-slot',
      'sheet-close'
    );
  });

  it('throws a clear error when a part is used outside <Sheet>', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Sheet.Title>x</Sheet.Title>)).toThrow(/inside <Sheet>/);
    spy.mockRestore();
  });

  it('has no axe violations when open', async () => {
    const { container } = render(<Demo defaultOpen />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
