import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb } from '../../../../src/booking/__stories__/fixtures.js';
import { familyEditorLabelsNb as L } from '../../../../src/booking/__stories__/labels.portal-forms.js';
import {
  DefaultFamilyMemberCard,
  FamilyEditor,
  type FamilyEditorProps,
  type FamilyMemberCardProps,
  type PersonSaveResult,
} from '../../../../src/booking/portal/family-editor.js';
import type { PortalFamilyMemberDto } from '../../../../src/booking/types.js';

/**
 * The family editor, one child at a time. What matters is the WIRING: that a
 * row saves through the person callback with the child's id (so a rename
 * edits the same child), that the details are offered only where the backend
 * keeps them, and that the save is optimistic and locked.
 */

const YEAR = 2026;

function member(overrides: Partial<PortalFamilyMemberDto> = {}): PortalFamilyMemberDto {
  return {
    personId: 'p-ola',
    name: 'Ola',
    birthYear: 2018,
    birthMonth: null,
    notes: null,
    preferredResourceId: null,
    ...overrides,
  };
}

const OLA = member();
const STYLISTS = [
  { id: 'res-anna', name: 'Anna' },
  { id: 'res-erik', name: 'Erik' },
];

function ok(
  family: PortalFamilyMemberDto[],
  extra: Partial<Extract<PersonSaveResult, { ok: true }>> = {}
): PersonSaveResult {
  return { ok: true, family, personId: null, fallback: false, ...extra };
}

function deferred<T>() {
  let settle: (value: T) => void = () => {};
  const promise = new Promise<T>((resolve) => {
    settle = resolve;
  });
  return { promise, settle };
}

const onSavePerson = vi.fn<FamilyEditorProps['onSavePerson']>();
const onRemovePerson = vi.fn<FamilyEditorProps['onRemovePerson']>();
const onSessionExpired = vi.fn();

function renderEditor(props: Partial<FamilyEditorProps> = {}) {
  return render(
    <FamilyEditor
      labels={L}
      format={demoFormatNb}
      family={[OLA]}
      currentYear={YEAR}
      onSavePerson={onSavePerson}
      onRemovePerson={onRemovePerson}
      onSessionExpired={onSessionExpired}
      {...props}
    />
  );
}

function rowFor(name: string) {
  return screen.getByRole('form', { name });
}

beforeEach(() => {
  vi.clearAllMocks();
  onSavePerson.mockResolvedValue(ok([OLA]));
  onRemovePerson.mockResolvedValue(ok([]));
});

describe('FamilyEditor', () => {
  it('shows the children on file with a year range of eighteen years', () => {
    renderEditor();

    expect(screen.getByRole('heading', { name: L['familyEditor.heading'] })).toBeInTheDocument();
    expect(screen.getByLabelText(L['familyEditor.name'])).toHaveValue('Ola');
    const year = screen.getByLabelText(L['familyEditor.birthYear']);
    expect(year).toHaveValue('2018');
    const options = Array.from((year as HTMLSelectElement).options).map((o) => o.value);
    expect(options[0]).toBe('');
    expect(options[1]).toBe('2026');
    expect(options.at(-1)).toBe('2008');
  });

  it('derives the current year from the business clock when not given', () => {
    renderEditor({ currentYear: undefined, now: Date.UTC(2030, 5, 1) });
    const year = screen.getByLabelText(L['familyEditor.birthYear']) as HTMLSelectElement;
    expect(year.options[1]?.value).toBe('2030');
  });

  it('heads the list with the business nouns when given', () => {
    renderEditor({ nouns: { person: 'Kid', persons: 'Kids' } });
    expect(screen.getByRole('heading', { name: 'Kids' })).toBeInTheDocument();
  });

  it('keeps a birth year that has aged out of the range on the list, and selected', () => {
    renderEditor({ family: [member({ birthYear: 2000 })] });

    expect(screen.getByLabelText(L['familyEditor.birthYear'])).toHaveValue('2000');
  });

  it('offers month, stylist and note only where the backend keeps them', () => {
    const { unmount } = renderEditor({ stylists: STYLISTS });
    expect(screen.queryByLabelText(L['familyEditor.birthMonth'])).toBeNull();
    expect(screen.queryByLabelText(L['familyEditor.stylist'])).toBeNull();
    unmount();

    renderEditor({
      family: [
        member({ birthMonth: 4, notes: 'Scared of clippers', preferredResourceId: 'res-anna' }),
      ],
      personDetails: true,
      stylists: STYLISTS,
    });
    const month = screen.getByLabelText(L['familyEditor.birthMonth']);
    expect(month).toHaveValue('4');
    // Month names come from the business clock.
    expect(within(month).getByRole('option', { name: 'april' })).toBeInTheDocument();
    expect(screen.getByLabelText(L['familyEditor.stylist'])).toHaveValue('res-anna');
    expect(screen.getByLabelText(L['familyEditor.notes'])).toHaveValue('Scared of clippers');
    const stylists = within(screen.getByLabelText(L['familyEditor.stylist'])).getAllByRole(
      'option'
    );
    expect(stylists.map((option) => option.textContent)).toEqual([
      L['familyEditor.stylistNone'],
      'Anna',
      'Erik',
    ]);
  });

  it('keeps a stylist no longer on the roster as its own option', () => {
    renderEditor({
      family: [member({ preferredResourceId: 'res-gone' })],
      personDetails: true,
      stylists: STYLISTS,
    });
    const select = screen.getByLabelText(L['familyEditor.stylist']);
    expect(select).toHaveValue('res-gone');
    expect(
      within(select).getByRole('option', { name: L['familyEditor.stylistFormer'] })
    ).toBeInTheDocument();
  });

  it('renames a child IN PLACE, by id, with the details', async () => {
    onSavePerson.mockResolvedValue(
      ok([member({ name: 'Ola Emil', birthMonth: 4, preferredResourceId: 'res-anna' })], {
        personId: 'p-ola',
      })
    );
    renderEditor({ personDetails: true, stylists: STYLISTS });

    fireEvent.change(screen.getByLabelText(L['familyEditor.name']), {
      target: { value: ' Ola Emil ' },
    });
    fireEvent.change(screen.getByLabelText(L['familyEditor.birthMonth']), {
      target: { value: '4' },
    });
    fireEvent.change(screen.getByLabelText(L['familyEditor.stylist']), {
      target: { value: 'res-anna' },
    });
    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.save'] }));

    await waitFor(() => expect(onSavePerson).toHaveBeenCalledTimes(1));
    expect(onSavePerson).toHaveBeenCalledWith({
      create: false,
      target: { personId: 'p-ola' },
      person: {
        name: 'Ola Emil',
        birthYear: 2018,
        birthMonth: 4,
        notes: null,
        preferredResourceId: 'res-anna',
      },
    });
    expect(await screen.findByText(L['familyEditor.saved'])).toBeInTheDocument();
    expect(screen.getByLabelText(L['familyEditor.name'])).toHaveValue('Ola Emil');
  });

  it('creates a new child and keeps the details fields for the first one', async () => {
    const created = member({ personId: 'p-mia', name: 'Mia', birthYear: 2021 });
    onSavePerson.mockResolvedValue(ok([created], { personId: 'p-mia' }));
    renderEditor({ family: [], stylists: STYLISTS });

    expect(screen.getByText(L['familyEditor.empty'])).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.add'] }));
    const row = rowFor(L['familyEditor.newRow']);
    fireEvent.change(within(row).getByLabelText(L['familyEditor.name']), {
      target: { value: 'Mia' },
    });
    fireEvent.change(within(row).getByLabelText(L['familyEditor.birthYear']), {
      target: { value: '2021' },
    });
    fireEvent.change(within(row).getByLabelText(L['familyEditor.notes']), {
      target: { value: 'First cut' },
    });
    fireEvent.click(within(row).getByRole('button', { name: L['familyEditor.save'] }));

    await waitFor(() =>
      expect(onSavePerson).toHaveBeenCalledWith({
        create: true,
        target: { personId: null },
        person: {
          name: 'Mia',
          birthYear: 2021,
          birthMonth: null,
          notes: 'First cut',
          preferredResourceId: null,
        },
      })
    );
    expect(await within(rowFor('Mia')).findByText(L['familyEditor.saved'])).toBeInTheDocument();
  });

  it('says so when the backend could only keep the name and year', async () => {
    onSavePerson.mockResolvedValue(
      ok([member({ personId: null, name: 'Mia', birthYear: 2021 })], { fallback: true })
    );
    renderEditor({ family: [], stylists: STYLISTS });

    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.add'] }));
    const row = rowFor(L['familyEditor.newRow']);
    fireEvent.change(within(row).getByLabelText(L['familyEditor.name']), {
      target: { value: 'Mia' },
    });
    fireEvent.change(within(row).getByLabelText(L['familyEditor.birthYear']), {
      target: { value: '2021' },
    });
    fireEvent.change(within(row).getByLabelText(L['familyEditor.stylist']), {
      target: { value: 'res-anna' },
    });
    fireEvent.click(within(row).getByRole('button', { name: L['familyEditor.save'] }));

    expect(await screen.findByText(L['familyEditor.savedNoDetails'])).toBeVisible();
  });

  it('addresses a child the profile could not name by its index', async () => {
    renderEditor({ family: [member({ personId: null })] });

    fireEvent.change(screen.getByLabelText(L['familyEditor.name']), {
      target: { value: 'Ola E' },
    });
    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.save'] }));

    await waitFor(() =>
      expect(onSavePerson).toHaveBeenCalledWith({
        create: false,
        target: { personId: null, index: 0 },
        person: { name: 'Ola E', birthYear: 2018 },
      })
    );
  });

  it('removes one child by id', async () => {
    renderEditor();

    fireEvent.click(screen.getByRole('button', { name: 'Fjern Ola' }));

    await waitFor(() => expect(onRemovePerson).toHaveBeenCalledWith({ personId: 'p-ola' }));
    expect(await screen.findByText(L['familyEditor.removed'])).toBeInTheDocument();
    expect(screen.queryByLabelText(L['familyEditor.name'])).toBeNull();
  });

  it('drops a new row that was never saved without calling back', () => {
    renderEditor();

    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.add'] }));
    expect(screen.getAllByLabelText(L['familyEditor.name'])).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.removeRow'] }));

    expect(screen.getAllByLabelText(L['familyEditor.name'])).toHaveLength(1);
    expect(onRemovePerson).not.toHaveBeenCalled();
  });

  it('stops adding at ten children', () => {
    const ten = Array.from({ length: 10 }, (_, i) =>
      member({ personId: `p-${i}`, name: `Child ${i}`, birthYear: 2015 })
    );
    renderEditor({ family: ten });

    expect(screen.queryByRole('button', { name: L['familyEditor.add'] })).not.toBeInTheDocument();
  });

  it('refuses a half-filled row instead of guessing, and marks only that field', () => {
    renderEditor();

    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.add'] }));
    const row = rowFor(L['familyEditor.newRow']);
    fireEvent.change(within(row).getByLabelText(L['familyEditor.name']), {
      target: { value: 'Mia' },
    });
    fireEvent.click(within(row).getByRole('button', { name: L['familyEditor.save'] }));

    expect(within(row).getByText(L['familyEditor.partial'])).toBeInTheDocument();
    expect(within(row).getByLabelText(L['familyEditor.birthYear'])).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(within(row).getByLabelText(L['familyEditor.name'])).not.toHaveAttribute('aria-invalid');
    expect(within(rowFor('Ola')).getByLabelText(L['familyEditor.birthYear'])).not.toHaveAttribute(
      'aria-invalid'
    );
    expect(onSavePerson).not.toHaveBeenCalled();
  });

  it('shows the callback’s sentence when the backend rejects the edit', async () => {
    onSavePerson.mockResolvedValue({ ok: false, kind: 'error', message: 'Already on file.' });
    renderEditor();

    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.save'] }));

    expect(await screen.findByText('Already on file.')).toBeInTheDocument();
  });

  it('reports a dead session instead of showing a sentence', async () => {
    onSavePerson.mockResolvedValue({ ok: false, kind: 'session' });
    renderEditor();

    fireEvent.click(screen.getByRole('button', { name: L['familyEditor.save'] }));

    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(L['familyEditor.unreachable'])).toBeNull();
  });

  it('keeps another child’s unsaved typing when one child is saved', async () => {
    const theo = member({ personId: 'p-theo', name: 'Theo', birthYear: 2020 });
    onSavePerson.mockResolvedValue(ok([member({ name: 'Ola E' }), theo], { personId: 'p-ola' }));
    renderEditor({ family: [OLA, theo] });

    fireEvent.change(within(rowFor('Theo')).getByLabelText(L['familyEditor.name']), {
      target: { value: 'Theodor' },
    });
    fireEvent.change(within(rowFor('Ola')).getByLabelText(L['familyEditor.name']), {
      target: { value: 'Ola E' },
    });
    fireEvent.click(within(rowFor('Ola E')).getByRole('button', { name: L['familyEditor.save'] }));

    expect(await within(rowFor('Ola E')).findByText(L['familyEditor.saved'])).toBeInTheDocument();
    expect(within(rowFor('Theodor')).getByLabelText(L['familyEditor.name'])).toHaveValue('Theodor');
  });

  describe('optimistic save', () => {
    it('shows «saved» before the callback answers, with the rows locked', async () => {
      const call = deferred<PersonSaveResult>();
      onSavePerson.mockReturnValue(call.promise);
      renderEditor();

      fireEvent.change(screen.getByLabelText(L['familyEditor.name']), {
        target: { value: ' Ola ' },
      });
      fireEvent.click(screen.getByRole('button', { name: L['familyEditor.save'] }));

      expect(await screen.findByText(L['familyEditor.saved'])).toBeInTheDocument();
      expect(screen.getByLabelText(L['familyEditor.name'])).toHaveValue('Ola');
      expect(screen.getByLabelText(L['familyEditor.name'])).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Fjern Ola' })).toBeDisabled();

      call.settle(ok([OLA], { personId: 'p-ola' }));
      await waitFor(() => expect(screen.getByLabelText(L['familyEditor.name'])).toBeEnabled());
      expect(screen.getByText(L['familyEditor.saved'])).toBeInTheDocument();
    });

    it('rolls back to what the parent had, with the reason, when the save fails', async () => {
      const call = deferred<PersonSaveResult>();
      onSavePerson.mockReturnValue(call.promise);
      renderEditor();

      fireEvent.change(screen.getByLabelText(L['familyEditor.name']), {
        target: { value: 'Ola Emil' },
      });
      fireEvent.click(screen.getByRole('button', { name: L['familyEditor.save'] }));
      expect(await screen.findByText(L['familyEditor.saved'])).toBeInTheDocument();

      call.settle({ ok: false, kind: 'error' });

      expect(await screen.findByText(L['familyEditor.unreachable'])).toBeInTheDocument();
      expect(screen.queryByText(L['familyEditor.saved'])).not.toBeInTheDocument();
      expect(screen.getByLabelText(L['familyEditor.name'])).toHaveValue('Ola Emil');
    });

    it('treats a callback that throws as unreachable', async () => {
      onSavePerson.mockRejectedValue(new Error('boom'));
      renderEditor();

      fireEvent.click(screen.getByRole('button', { name: L['familyEditor.save'] }));

      expect(await screen.findByText(L['familyEditor.unreachable'])).toBeInTheDocument();
      expect(screen.getByLabelText(L['familyEditor.name'])).toBeEnabled();
    });

    it('hides a removed child at once and puts them back when the removal fails', async () => {
      const call = deferred<PersonSaveResult>();
      onRemovePerson.mockReturnValue(call.promise);
      renderEditor();

      fireEvent.click(screen.getByRole('button', { name: 'Fjern Ola' }));
      await waitFor(() => expect(screen.queryByLabelText(L['familyEditor.name'])).toBeNull());

      call.settle({ ok: false, kind: 'error' });

      expect(await screen.findByLabelText(L['familyEditor.name'])).toHaveValue('Ola');
      expect(screen.getByText(L['familyEditor.unreachable'])).toBeInTheDocument();
    });
  });

  describe('override ladder', () => {
    it('takes a label override', () => {
      renderEditor({ labels: { ...L, 'familyEditor.add': 'Add someone' } });
      expect(screen.getByRole('button', { name: 'Add someone' })).toBeInTheDocument();
    });

    it('puts slot classes on their elements', () => {
      const { container } = renderEditor({
        classNames: { root: 'slot-root', card: 'slot-card', add: 'slot-add', list: 'slot-list' },
      });
      expect(container.querySelector('section')).toHaveClass('slot-root', 'space-y-4');
      expect(rowFor('Ola')).toHaveClass('slot-card', 'bg-card');
      expect(screen.getByRole('button', { name: L['familyEditor.add'] })).toHaveClass('slot-add');
      expect(container.querySelector('ul')).toHaveClass('slot-list');
    });

    it('replaces the row renderer, which can wrap the default', () => {
      function Card(props: FamilyMemberCardProps) {
        return (
          <div data-testid="custom-card" data-person={props.row.personId ?? ''}>
            <DefaultFamilyMemberCard {...props} />
          </div>
        );
      }
      renderEditor({ components: { FamilyMemberCard: Card } });
      expect(screen.getByTestId('custom-card')).toHaveAttribute('data-person', 'p-ola');
      expect(rowFor('Ola')).toBeInTheDocument();
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderEditor({ personDetails: true, stylists: STYLISTS });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
