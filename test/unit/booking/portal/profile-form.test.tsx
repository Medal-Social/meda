import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { profileFormLabelsNb as L } from '../../../../src/booking/__stories__/labels.portal-forms.js';
import {
  ProfileForm,
  type ProfileFormProps,
  type ProfileSaveResult,
} from '../../../../src/booking/portal/profile-form.js';

/**
 * The profile form against mocked callbacks. What is asserted is the SHAPE
 * of the patch — a cleared name is omitted, not sent blank; a kept name is
 * trimmed; the phone always travels — and that every sentence the form shows
 * is pinned to the input it is about. The marketing box shows what was
 * stored, not what was clicked.
 */

const PROFILE: ProfileFormProps['profile'] = {
  email: 'kari@example.com',
  firstName: 'Kari',
  lastName: 'Nordmann',
  phone: '40000000',
  marketingConsent: false,
};

const STORED = { firstName: 'Kari', lastName: 'Nordmann', phone: '40000000' };

const onSave = vi.fn<ProfileFormProps['onSave']>();
const onConsentChange = vi.fn<ProfileFormProps['onConsentChange']>();
const onSessionExpired = vi.fn();

function renderForm(props: Partial<ProfileFormProps> = {}) {
  return render(
    <ProfileForm
      labels={L}
      profile={PROFILE}
      onSave={onSave}
      onConsentChange={onConsentChange}
      onSessionExpired={onSessionExpired}
      {...props}
    />
  );
}

function type(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function save() {
  fireEvent.click(screen.getByRole('button', { name: L['profileForm.save'] }));
}

const FIRST = L['profileForm.firstName'];
const LAST = L['profileForm.lastName'];
const PHONE = L['profileForm.phone'];
const SAVED = L['profileForm.saved'];
const RESTORED = L['profileForm.restored'];
const UNREACHABLE = L['profileForm.unreachable'];

beforeEach(() => {
  vi.clearAllMocks();
  onSave.mockResolvedValue({ ok: true, profile: STORED });
  onConsentChange.mockResolvedValue({ ok: true, marketingConsent: true });
});

describe('ProfileForm', () => {
  it('shows the profile, with the e-mail read-only', () => {
    renderForm();

    expect(screen.getByLabelText(FIRST)).toHaveValue('Kari');
    expect(screen.getByLabelText(LAST)).toHaveValue('Nordmann');
    expect(screen.getByLabelText(PHONE)).toHaveValue('40000000');
    const email = screen.getByLabelText(L['profileForm.email']);
    expect(email).toHaveValue('kari@example.com');
    expect(email).toHaveAttribute('readonly');
    expect(screen.getByRole('checkbox', { name: L['profileForm.marketing'] })).not.toBeChecked();
  });

  it('sends trimmed names and the phone as typed, and says «saved»', async () => {
    renderForm();

    type(FIRST, '  Kari ');
    type(LAST, ' Nordmann  ');
    type(PHONE, '400 00 000');
    save();

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        firstName: 'Kari',
        lastName: 'Nordmann',
        phone: '400 00 000',
      })
    );
    expect(await screen.findByText(SAVED)).toBeInTheDocument();
    expect(screen.queryByText(RESTORED)).not.toBeInTheDocument();
  });

  it('omits cleared names from the patch, re-fills them, and says they were kept', async () => {
    renderForm();

    type(FIRST, '   ');
    type(LAST, '');
    type(PHONE, '');
    save();

    await waitFor(() => expect(onSave).toHaveBeenCalledWith({ phone: '' }));
    const notice = await screen.findByText(RESTORED);
    expect(screen.queryByText(SAVED)).not.toBeInTheDocument();
    const first = screen.getByLabelText(FIRST);
    const last = screen.getByLabelText(LAST);
    // The stored values land in the transition that follows the notice.
    await waitFor(() => expect(screen.getByLabelText(PHONE)).toHaveValue('40000000'));
    expect(first).toHaveValue('Kari');
    expect(last).toHaveValue('Nordmann');
    expect(first.getAttribute('aria-describedby')).toContain(notice.id);
    expect(last.getAttribute('aria-describedby')).toContain(notice.id);
    expect(first).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText(PHONE)).not.toHaveAttribute('aria-describedby');
  });

  it('pins the notice to just the name that was cleared', async () => {
    renderForm();

    type(LAST, '');
    save();

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({ firstName: 'Kari', phone: '40000000' })
    );
    const notice = await screen.findByText(RESTORED);
    expect(screen.getByLabelText(LAST).getAttribute('aria-describedby')).toContain(notice.id);
    expect(screen.getByLabelText(FIRST)).not.toHaveAttribute('aria-describedby');
  });

  it('says «saved» when a cleared name was genuinely cleared on file too', async () => {
    onSave.mockResolvedValue({ ok: true, profile: { ...STORED, lastName: null } });
    renderForm();

    type(LAST, '');
    save();

    expect(await screen.findByText(SAVED)).toBeInTheDocument();
    expect(screen.getByLabelText(LAST)).toHaveValue('');
  });

  it('wires a rejected phone to the phone field', async () => {
    onSave.mockResolvedValue({
      ok: false,
      kind: 'error',
      message: 'The number needs eight digits.',
      field: 'phone',
    });
    renderForm();

    type(PHONE, '1234');
    save();

    const error = await screen.findByText('The number needs eight digits.');
    const phone = screen.getByLabelText(PHONE);
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(phone.getAttribute('aria-describedby')).toContain(error.id);
    expect(screen.getByLabelText(FIRST)).not.toHaveAttribute('aria-invalid');

    // Typing again withdraws the complaint.
    type(PHONE, '12345678');
    expect(screen.queryByText('The number needs eight digits.')).not.toBeInTheDocument();
    expect(phone).not.toHaveAttribute('aria-invalid');
  });

  it('shows a request failure without blaming a field', async () => {
    onSave.mockResolvedValue({ ok: false, kind: 'error' });
    renderForm();

    save();

    expect(await screen.findByText(UNREACHABLE)).toBeInTheDocument();
    expect(screen.getByLabelText(PHONE)).not.toHaveAttribute('aria-invalid');
    expect(screen.getByLabelText(PHONE)).not.toHaveAttribute('aria-describedby');
  });

  it("shows the backend's own sentence when it rejects the edit", async () => {
    onSave.mockResolvedValue({ ok: false, kind: 'error', message: 'Number not in use.' });
    renderForm();

    save();

    expect(await screen.findByText('Number not in use.')).toBeInTheDocument();
  });

  it('reports a dead session and says nothing', async () => {
    onSave.mockResolvedValue({ ok: false, kind: 'session' });
    renderForm();

    save();

    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
    expect(screen.queryByText(UNREACHABLE)).not.toBeInTheDocument();
  });

  describe('marketing consent', () => {
    it('flips at once and stays flipped when the change is taken', async () => {
      renderForm();

      const box = screen.getByRole('checkbox');
      fireEvent.click(box);

      expect(box).toBeChecked();
      await waitFor(() => expect(onConsentChange).toHaveBeenCalledWith(true));
      await waitFor(() => expect(box).not.toBeDisabled());
      expect(box).toBeChecked();
      expect(onSave).not.toHaveBeenCalled();
    });

    it('shows what was stored, not what was clicked', async () => {
      onConsentChange.mockResolvedValue({ ok: true, marketingConsent: false });
      renderForm();

      fireEvent.click(screen.getByRole('checkbox'));

      await waitFor(() => expect(onConsentChange).toHaveBeenCalled());
      await waitFor(() => expect(screen.getByRole('checkbox')).not.toBeChecked());
    });

    it('rolls back and says so when the call failed', async () => {
      onConsentChange.mockRejectedValue(new Error('boom'));
      renderForm();

      const box = screen.getByRole('checkbox');
      fireEvent.click(box);
      expect(box).toBeChecked();

      expect(await screen.findByText(UNREACHABLE)).toBeInTheDocument();
      expect(box).not.toBeChecked();
    });

    it('reports a dead session', async () => {
      onConsentChange.mockResolvedValue({ ok: false, kind: 'session' });
      renderForm();

      const box = screen.getByRole('checkbox');
      const before = (box as HTMLInputElement).checked;
      fireEvent.click(box);

      await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
      // The unsaved change does not linger behind the expired session.
      await waitFor(() => expect((box as HTMLInputElement).checked).toBe(before));
      expect(screen.queryByText(UNREACHABLE)).not.toBeInTheDocument();
    });
  });

  describe('optimistic save', () => {
    function deferred() {
      let settle: (value: ProfileSaveResult) => void = () => {};
      const promise = new Promise<ProfileSaveResult>((resolve) => {
        settle = resolve;
      });
      return { promise, settle };
    }

    it('shows «saved» and the trimmed names before the callback answers', async () => {
      const call = deferred();
      onSave.mockReturnValue(call.promise);
      renderForm();

      type(FIRST, '  Kari ');
      save();

      expect(await screen.findByText(SAVED)).toBeInTheDocument();
      expect(screen.getByLabelText(FIRST)).toHaveValue('Kari');
      expect(screen.getByLabelText(FIRST)).toBeDisabled();
      expect(screen.getByLabelText(PHONE)).toBeDisabled();

      call.settle({ ok: true, profile: STORED });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: L['profileForm.save'] })).toBeEnabled()
      );
      expect(screen.getByText(SAVED)).toBeInTheDocument();
      expect(screen.getByLabelText(FIRST)).toBeEnabled();
    });

    it('predicts a kept name from the profile on file', async () => {
      const call = deferred();
      onSave.mockReturnValue(call.promise);
      renderForm();

      type(FIRST, '');
      save();

      expect(await screen.findByText(RESTORED)).toBeInTheDocument();
      expect(screen.getByLabelText(FIRST)).toHaveValue('Kari');
      call.settle({ ok: true, profile: STORED });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: L['profileForm.save'] })).toBeEnabled()
      );
      expect(screen.getByText(RESTORED)).toBeInTheDocument();
    });

    it('rolls back to what the parent typed, with the reason, when the save fails', async () => {
      const call = deferred();
      onSave.mockReturnValue(call.promise);
      renderForm();

      type(FIRST, '  Kari ');
      save();
      expect(await screen.findByText(SAVED)).toBeInTheDocument();

      call.settle({ ok: false, kind: 'error' });

      expect(await screen.findByText(UNREACHABLE)).toBeInTheDocument();
      expect(screen.queryByText(SAVED)).not.toBeInTheDocument();
      expect(screen.getByLabelText(FIRST)).toHaveValue('  Kari ');
    });
  });

  describe('override ladder', () => {
    it('takes a label override', () => {
      renderForm({ labels: { ...L, 'profileForm.heading': 'About you' } });
      expect(screen.getByRole('heading', { name: 'About you' })).toBeInTheDocument();
    });

    it('puts slot classes on their elements', () => {
      const { container } = renderForm({
        classNames: { root: 'slot-root', save: 'slot-save', consent: 'slot-consent' },
      });
      expect(container.querySelector('section')).toHaveClass('slot-root');
      expect(screen.getByRole('button', { name: L['profileForm.save'] })).toHaveClass('slot-save');
      expect(container.querySelector('[data-orientation="horizontal"]')).toHaveClass(
        'slot-consent'
      );
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderForm();
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
