import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb } from '../../../../src/booking/__stories__/fixtures.js';
import {
  ageConfirmLabelsNb as A,
  familyEditorLabelsNb as L,
} from '../../../../src/booking/__stories__/labels.portal-forms.js';
import { AgeConfirmCard } from '../../../../src/booking/portal/age-confirm-card.js';
import {
  FamilyEditor,
  type FamilyEditorProps,
  type PersonSaveResult,
} from '../../../../src/booking/portal/family-editor.js';
import type { PortalFamilyMemberDto } from '../../../../src/booking/types.js';

/**
 * The age prompt in the family editor. A child whose month the backend does
 * not know gets one small card; confirming saves through the same person
 * callback as the editor, and both confirming and «later» are reported
 * through `onAgeAnswered` for the caller to remember.
 */

const YEAR = 2026;

function member(overrides: Partial<PortalFamilyMemberDto> = {}): PortalFamilyMemberDto {
  return {
    personId: 'p-nora',
    name: 'Nora',
    birthYear: 2022,
    birthMonth: null,
    notes: 'Likes films',
    preferredResourceId: 'res-anna',
    ...overrides,
  };
}

function ok(family: PortalFamilyMemberDto[]): PersonSaveResult {
  return { ok: true, family, personId: 'p-nora', fallback: false };
}

const onSavePerson = vi.fn<FamilyEditorProps['onSavePerson']>();
const onAgeAnswered = vi.fn();
const onSessionExpired = vi.fn();

function renderEditor(props: Partial<FamilyEditorProps> = {}) {
  return render(
    <FamilyEditor
      labels={L}
      format={demoFormatNb}
      family={[member()]}
      currentYear={YEAR}
      personDetails
      agePrompt={{ dismissed: [] }}
      onSavePerson={onSavePerson}
      onRemovePerson={vi.fn()}
      onSessionExpired={onSessionExpired}
      onAgeAnswered={onAgeAnswered}
      {...props}
    />
  );
}

const HEADING = /Stemmer alderen til/;

function card() {
  return screen.queryByRole('region', { name: HEADING });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Age prompt in the family editor', () => {
  it('asks about the first child with no birth month, year prefilled', () => {
    renderEditor({
      family: [member({ personId: 'p-ola', name: 'Ola', birthMonth: 5 }), member()],
    });

    const region = card() as HTMLElement;
    expect(region).not.toBeNull();
    expect(
      within(region).getByRole('heading', { name: 'Stemmer alderen til Nora?' })
    ).toBeInTheDocument();
    expect(within(region).getByText(A['ageConfirm.lead'])).toBeInTheDocument();
    expect(within(region).getByLabelText(A['ageConfirm.birthYear'])).toHaveValue('2022');
    expect(within(region).getByLabelText(A['ageConfirm.birthMonth'])).toHaveValue('');
  });

  it('is not drawn without the prop, for a dismissed child, or where no month is kept', () => {
    const first = renderEditor({ agePrompt: undefined });
    expect(card()).toBeNull();
    first.unmount();

    const second = renderEditor({ agePrompt: { dismissed: ['p-nora'] } });
    expect(card()).toBeNull();
    second.unmount();

    renderEditor({ personDetails: false });
    expect(card()).toBeNull();
  });

  it('saves the year and month for that child only, leaving notes and stylist alone', async () => {
    onSavePerson.mockResolvedValue(ok([member({ birthYear: 2021, birthMonth: 9 })]));
    renderEditor();

    const region = card() as HTMLElement;
    fireEvent.change(within(region).getByLabelText(A['ageConfirm.birthYear']), {
      target: { value: '2021' },
    });
    fireEvent.change(within(region).getByLabelText(A['ageConfirm.birthMonth']), {
      target: { value: '9' },
    });
    fireEvent.click(within(region).getByRole('button', { name: A['ageConfirm.confirm'] }));

    await waitFor(() =>
      expect(onSavePerson).toHaveBeenCalledWith({
        create: false,
        target: { personId: 'p-nora' },
        person: { name: 'Nora', birthYear: 2021, birthMonth: 9 },
      })
    );
    expect(await screen.findByText('Takk, alderen til Nora er lagret.')).toBeInTheDocument();
    expect(card()).toBeNull();
    expect(onAgeAnswered).toHaveBeenCalledWith(['p-nora']);
    // The editor row below took what was stored.
    expect(
      within(screen.getByRole('form', { name: 'Nora' })).getByLabelText(
        L['familyEditor.birthMonth']
      )
    ).toHaveValue('9');
  });

  it("keeps unsaved typing in that child's editor row, taking only the fields it sent", async () => {
    onSavePerson.mockResolvedValue(ok([member({ birthYear: 2021, birthMonth: 9 })]));
    renderEditor();

    const row = screen.getByRole('form', { name: 'Nora' });
    fireEvent.change(within(row).getByLabelText(L['familyEditor.name']), {
      target: { value: 'Nora Sofie' },
    });
    fireEvent.change(within(row).getByLabelText(L['familyEditor.notes']), {
      target: { value: 'Likes films and music' },
    });
    const region = card() as HTMLElement;
    fireEvent.change(within(region).getByLabelText(A['ageConfirm.birthYear']), {
      target: { value: '2021' },
    });
    fireEvent.change(within(region).getByLabelText(A['ageConfirm.birthMonth']), {
      target: { value: '9' },
    });
    fireEvent.click(within(region).getByRole('button', { name: A['ageConfirm.confirm'] }));

    expect(await screen.findByText('Takk, alderen til Nora er lagret.')).toBeInTheDocument();
    // The card sent the stored name, not the draft.
    expect(onSavePerson).toHaveBeenCalledWith(
      expect.objectContaining({ person: { name: 'Nora', birthYear: 2021, birthMonth: 9 } })
    );
    const after = screen.getByRole('form', { name: 'Nora Sofie' });
    expect(within(after).getByLabelText(L['familyEditor.name'])).toHaveValue('Nora Sofie');
    expect(within(after).getByLabelText(L['familyEditor.notes'])).toHaveValue(
      'Likes films and music'
    );
    expect(within(after).getByLabelText(L['familyEditor.birthYear'])).toHaveValue('2021');
    expect(within(after).getByLabelText(L['familyEditor.birthMonth'])).toHaveValue('9');
  });

  it('confirms an unchanged year without calling back, and remembers it', async () => {
    renderEditor();

    fireEvent.click(
      within(card() as HTMLElement).getByRole('button', { name: A['ageConfirm.confirm'] })
    );

    expect(await screen.findByText('Takk, alderen til Nora er bekreftet.')).toBeInTheDocument();
    expect(onSavePerson).not.toHaveBeenCalled();
    expect(card()).toBeNull();
    expect(onAgeAnswered).toHaveBeenCalledWith(['p-nora']);
  });

  it('«later» hides it and remembers, then the next child is asked about', () => {
    renderEditor({
      family: [member(), member({ personId: 'p-theo', name: 'Theo' })],
      agePrompt: { dismissed: ['p-old'] },
    });

    fireEvent.click(
      within(card() as HTMLElement).getByRole('button', { name: A['ageConfirm.dismiss'] })
    );

    expect(onAgeAnswered).toHaveBeenCalledWith(['p-old', 'p-nora']);
    expect(
      within(card() as HTMLElement).getByRole('heading', { name: 'Stemmer alderen til Theo?' })
    ).toBeInTheDocument();
    expect(onSavePerson).not.toHaveBeenCalled();
  });

  it('keeps the card and says why when the save fails', async () => {
    onSavePerson.mockResolvedValue({ ok: false, kind: 'error', message: 'Check the month.' });
    renderEditor();

    const region = card() as HTMLElement;
    fireEvent.change(within(region).getByLabelText(A['ageConfirm.birthMonth']), {
      target: { value: '3' },
    });
    fireEvent.click(within(region).getByRole('button', { name: A['ageConfirm.confirm'] }));

    expect(await within(region).findByText('Check the month.')).toBeInTheDocument();
    expect(card()).not.toBeNull();
    expect(onAgeAnswered).not.toHaveBeenCalled();
  });

  it('reports a dead session', async () => {
    onSavePerson.mockResolvedValue({ ok: false, kind: 'session' });
    renderEditor();

    const region = card() as HTMLElement;
    fireEvent.change(within(region).getByLabelText(A['ageConfirm.birthMonth']), {
      target: { value: '3' },
    });
    fireEvent.click(within(region).getByRole('button', { name: A['ageConfirm.confirm'] }));

    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
  });
});

describe('AgeConfirmCard on its own', () => {
  const months = Array.from({ length: 12 }, (_, i) => demoFormatNb.clock.monthName(i + 1));

  function renderCard(props: Partial<Parameters<typeof AgeConfirmCard>[0]> = {}) {
    return render(
      <AgeConfirmCard
        labels={A}
        name="Nora"
        birthYear="2022"
        years={[2023, 2022, 2021]}
        months={months}
        busy={false}
        error={null}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
        {...props}
      />
    );
  }

  it('answers with the chosen year and month', () => {
    const onConfirm = vi.fn();
    renderCard({ onConfirm });
    fireEvent.change(screen.getByLabelText(A['ageConfirm.birthMonth']), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: A['ageConfirm.confirm'] }));
    expect(onConfirm).toHaveBeenCalledWith({ birthYear: '2022', birthMonth: '2' });
  });

  it('locks while busy and wires the error to the form', () => {
    const { container } = renderCard({ busy: true, error: 'Nope.' });
    expect(screen.getByRole('button', { name: A['ageConfirm.confirm'] })).toBeDisabled();
    expect(screen.getByLabelText(A['ageConfirm.birthYear'])).toBeDisabled();
    const error = screen.getByText('Nope.');
    expect(container.querySelector('form')).toHaveAttribute('aria-describedby', error.id);
    expect(screen.getByRole('region')).toHaveAttribute('aria-busy', 'true');
  });

  it('takes label and slot overrides', () => {
    renderCard({
      labels: { ...A, 'ageConfirm.dismiss': 'Not now' },
      classNames: { root: 'slot-root', actions: 'slot-actions' },
    });
    expect(screen.getByRole('button', { name: 'Not now' })).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveClass('slot-root', 'bg-secondary/10');
    expect(screen.getByRole('button', { name: 'Not now' }).parentElement).toHaveClass(
      'slot-actions'
    );
  });

  it('has no axe violations', async () => {
    const { container } = renderCard({ error: 'Nope.' });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
