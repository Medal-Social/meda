import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatEn, demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import {
  addChildSheetLabelsEn,
  addChildSheetLabelsNb as labels,
} from '../../../src/booking/__stories__/labels.steps.js';
import { AddChildSheet, type AddChildSheetProps } from '../../../src/booking/add-child-sheet.js';
import type { SaveResult } from '../../../src/booking/types.js';

function renderSheet(props: Partial<AddChildSheetProps> = {}) {
  const onSave = vi.fn(async (): Promise<SaveResult> => ({ ok: true }));
  const view = render(
    <AddChildSheet
      labels={labels}
      format={demoFormatNb}
      saveNotes={false}
      disabled={false}
      currentYear={2026}
      onSave={onSave}
      {...props}
    />
  );
  return { ...view, onSave: (props.onSave as typeof onSave | undefined) ?? onSave };
}

function openSheet() {
  fireEvent.click(screen.getByRole('button', { name: labels['addChild.trigger'] }));
  return screen.getByRole('dialog', { name: labels['addChild.title'] });
}

afterEach(() => {
  document.documentElement.style.overflow = '';
});

describe('AddChildSheet', () => {
  it('is a dashed card of fixed height until pressed', () => {
    renderSheet();
    const trigger = screen.getByRole('button', { name: labels['addChild.trigger'] });
    expect(trigger).toHaveClass('h-[4.5rem]', 'border-dashed');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens a labelled sheet with name, year and month — and no note for a guest', () => {
    renderSheet();
    const dialog = openSheet();
    expect(dialog).toHaveAccessibleDescription(labels['addChild.description.local']);
    expect(within(dialog).getByLabelText(labels['addChild.name'])).toBeInTheDocument();
    expect(within(dialog).queryByLabelText(labels['addChild.notes'])).toBeNull();

    // Years count back from `currentYear`; the first option asks.
    const year = within(dialog).getByLabelText(labels['addChild.birthYear']);
    const years = within(year)
      .getAllByRole('option')
      .map((option) => option.textContent);
    expect(years[0]).toBe(labels['addChild.birthYearPlaceholder']);
    expect(years[1]).toBe('2026');
    expect(years).toHaveLength(20);

    // Month names come from the clock, not from the component.
    const month = within(dialog).getByLabelText(labels['addChild.birthMonth']);
    expect(within(month).getAllByRole('option')[3]).toHaveTextContent(
      demoFormatNb.clock.monthName(3)
    );
  });

  it('offers the note where there is somewhere to keep it', () => {
    renderSheet({ saveNotes: true });
    const dialog = openSheet();
    expect(dialog).toHaveAccessibleDescription(labels['addChild.description.saved']);
    expect(within(dialog).getByLabelText(labels['addChild.notes'])).toBeInTheDocument();
  });

  it('saves what was typed, then closes and hands focus back to the card', async () => {
    const onSave = vi.fn(async (): Promise<SaveResult> => ({ ok: true }));
    renderSheet({ saveNotes: true, onSave });
    const trigger = screen.getByRole('button', { name: labels['addChild.trigger'] });
    trigger.focus();
    const dialog = openSheet();
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.name']), {
      target: { value: '  Theo ' },
    });
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.birthYear']), {
      target: { value: '2019' },
    });
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.birthMonth']), {
      target: { value: '3' },
    });
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.notes']), {
      target: { value: 'Liker å se på film' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: labels['addChild.submit'] }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        name: 'Theo',
        birthYear: 2019,
        birthMonth: 3,
        notes: 'Liker å se på film',
      })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(trigger).toHaveFocus();
  });

  it('leaves the month out when it is unknown, and never sends a note for a guest', async () => {
    const onSave = vi.fn(async (): Promise<SaveResult> => ({ ok: true }));
    renderSheet({ onSave });
    const dialog = openSheet();
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.name']), {
      target: { value: 'Mia' },
    });
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.birthYear']), {
      target: { value: '2022' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: labels['addChild.submit'] }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ name: 'Mia', birthYear: 2022 }));
  });

  it('asks for a name and a year before it saves anything', () => {
    const { onSave } = renderSheet();
    const dialog = openSheet();
    fireEvent.click(within(dialog).getByRole('button', { name: labels['addChild.submit'] }));
    expect(within(dialog).getByText(labels['addChild.missing'])).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('stays open, locked, until the save answers — and shows the sentence it answers with', async () => {
    let answer: (result: SaveResult) => void = () => {};
    const onSave = vi.fn(
      () =>
        new Promise<SaveResult>((resolve) => {
          answer = resolve;
        })
    );
    renderSheet({ onSave });
    const dialog = openSheet();
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.name']), {
      target: { value: 'Theo' },
    });
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.birthYear']), {
      target: { value: '2019' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: labels['addChild.submit'] }));

    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: labels['addChild.submit'] })).toBeDisabled()
    );
    expect(within(dialog).getByLabelText(labels['addChild.name'])).toBeDisabled();
    // Escape cannot take the sheet away while the save is in flight.
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      answer({ ok: false, message: 'Kunne ikke lagre akkurat nå.' });
    });
    expect(await within(dialog).findByText('Kunne ikke lagre akkurat nå.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes on Escape and returns focus to the card', () => {
    renderSheet();
    const trigger = screen.getByRole('button', { name: labels['addChild.trigger'] });
    trigger.focus();
    const dialog = openSheet();
    // Focus moves into the sheet.
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('closes from its close button and forgets an error', () => {
    renderSheet();
    let dialog = openSheet();
    fireEvent.click(within(dialog).getByRole('button', { name: labels['addChild.submit'] }));
    expect(within(dialog).getByText(labels['addChild.missing'])).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: labels['addChild.close'] }));
    expect(screen.queryByRole('dialog')).toBeNull();
    dialog = openSheet();
    expect(within(dialog).queryByText(labels['addChild.missing'])).toBeNull();
  });

  it('cannot be opened when disabled', () => {
    renderSheet({ disabled: true });
    const trigger = screen.getByRole('button', { name: labels['addChild.trigger'] });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('takes labels, formats and slot classes from its props', () => {
    renderSheet({
      labels: { ...addChildSheetLabelsEn, 'addChild.trigger': 'Add another child' },
      format: demoFormatEn,
      classNames: { root: 'custom-root', submit: 'custom-submit', title: 'custom-title' },
    });
    const trigger = screen.getByRole('button', { name: 'Add another child' });
    expect(trigger).toHaveClass('custom-root');
    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: addChildSheetLabelsEn['addChild.title'] });
    expect(within(dialog).getByRole('heading')).toHaveClass('custom-title');
    expect(within(dialog).getByRole('button', { name: 'Add' })).toHaveClass('custom-submit');
    expect(within(dialog).getByRole('option', { name: 'March' })).toBeInTheDocument();
  });

  it('has no axe violations, closed or open', async () => {
    const { container } = renderSheet({ saveNotes: true });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
    openSheet();
    expect(
      await axe(document.body, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
