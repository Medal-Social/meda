import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import { detailsScreenLabelsNb as L } from '../../../src/booking/__stories__/labels.details.js';
import {
  DETAILS_ERROR_LABEL_KEYS,
  DETAILS_SCREEN_LABEL_KEYS,
  DetailsScreen,
  type DetailsScreenProps,
  type FamilyChipProps,
  looksLikeEmail,
} from '../../../src/booking/details-screen.js';
import type { WizardError, WizardService, WizardState } from '../../../src/booking/types.js';

const KIDS: WizardService = {
  id: 'svc-kids',
  name: 'Barneklipp',
  category: 'kids',
  durationMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  priceOre: 39_000,
  maxPerBooking: 3,
  weekendSurchargePct: 10,
};
const WASH: WizardService = { ...KIDS, id: 'svc-wash', name: 'Barneklipp med vask' };

/** Thursday 17 September 2026, 15:00 Oslo. */
const THURSDAY_15 = Date.UTC(2026, 8, 17, 13);
const HALF_HOUR = 30 * 60_000;

/** A test phone rule: eight national digits, an optional +47 in front. */
const normalisePhone = (value: string) =>
  value.replace(/[\s()-]/g, '').replace(/^(?:\+47|0047)/, '');
const phoneLooksValid = (value: string) => /^\d{8}$/.test(normalisePhone(value));

function readyState(overrides: Partial<WizardState> = {}): WizardState {
  return {
    step: 'details',
    people: [],
    choices: [],
    items: [{ service: KIDS }],
    resourceId: null,
    stylistAnswered: true,
    partyMode: 'sequential',
    startTs: THURSDAY_15,
    resolvedResourceId: 'res-ada',
    partyResourceIds: null,
    contact: { phone: '40000000', name: '', email: '' },
    notes: '',
    consentTerms: true,
    consentMarketing: false,
    pendingService: null,
    error: null,
    ...overrides,
  };
}

function setup(props: Partial<DetailsScreenProps> = {}) {
  const state = props.state ?? readyState();
  const onChange = props.onChange ?? vi.fn();
  const onSubmit = props.onSubmit ?? vi.fn();
  const lines =
    props.lines ??
    state.items.map((_, index) => ({
      startTs: THURSDAY_15 + index * HALF_HOUR,
      resourceId: 'res-ada',
    }));
  const utils = render(
    <DetailsScreen
      state={state}
      onChange={onChange}
      onSubmit={onSubmit}
      lines={lines}
      totalOre={39_000 * state.items.length}
      phoneLooksValid={phoneLooksValid}
      normalisePhone={normalisePhone}
      marketingConsent
      format={demoFormatNb}
      labels={L}
      {...props}
    />
  );
  return {
    ...utils,
    onChange: onChange as ReturnType<typeof vi.fn>,
    onSubmit: onSubmit as ReturnType<typeof vi.fn>,
  };
}

const badPhoneState = () => readyState({ contact: { phone: '4000000', name: '', email: '' } });
const submitButton = () => screen.getByRole('button', { name: /^Bestill –/ });
function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe('DetailsScreen', () => {
  it('asks the last question the wizard has', () => {
    setup();
    expect(screen.getByRole('heading', { name: L['details.heading'] })).toBeInTheDocument();
  });

  it('asks for what it needs in order, in the labels it was given', () => {
    const { container } = setup();
    expect([...container.querySelectorAll('label')].map((label) => label.textContent)).toEqual([
      L['details.phone.label'],
      L['details.name.label'],
      L['details.child.name'],
      L['details.child.year'],
      L['details.email.label'],
      L['details.notes.label'],
      L['details.terms.text'],
      L['details.marketing.text'],
    ]);
    expect(screen.getByText(L['details.email.help'])).toBeInTheDocument();
    expect(screen.getByText('+47')).toBeInTheDocument();
  });

  it('leaves the marketing consent unchecked, and away unless asked for', () => {
    const { unmount } = setup();
    expect(screen.getByRole('checkbox', { name: L['details.marketing.text'] })).not.toBeChecked();
    unmount();
    setup({ marketingConsent: false });
    expect(screen.queryByRole('checkbox', { name: L['details.marketing.text'] })).toBeNull();
  });

  it('links the full terms only when given somewhere to link to', () => {
    const { unmount } = setup();
    expect(screen.queryByRole('link', { name: L['details.terms.link'] })).toBeNull();
    unmount();
    setup({ termsHref: '/terms' });
    expect(screen.getByRole('link', { name: L['details.terms.link'] })).toHaveAttribute(
      'href',
      '/terms'
    );
  });

  it('keeps submit enabled and shows the error inline, so nothing looks broken', () => {
    setup({ state: badPhoneState() });
    expect(submitButton()).toBeEnabled();
    expect(screen.getByText(L['details.phone.error'])).toBeInTheDocument();
  });

  it('holds its tongue while the visitor is still typing the number', () => {
    setup({ state: badPhoneState() });
    const field = screen.getByLabelText(L['details.phone.label']);
    fireEvent.focus(field);
    expect(screen.queryByText(L['details.phone.error'])).toBeNull();
    fireEvent.blur(field);
    expect(screen.getByText(L['details.phone.error'])).toBeInTheDocument();
  });

  it('says nothing about a phone number nobody has typed yet', () => {
    setup({ state: readyState({ contact: { phone: '', name: '', email: '' } }) });
    expect(screen.queryByText(L['details.phone.error'])).toBeNull();
  });

  it('shows a locked e-mail and still submits it', () => {
    const { onSubmit } = setup({
      emailReadOnly: true,
      state: readyState({ contact: { phone: '40000000', name: '', email: 'kari@example.com' } }),
    });
    const input = screen.getByLabelText(L['details.email.label']);
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveAttribute('aria-readonly', 'true');
    expect(screen.getByText(L['details.email.lockedHelp'])).toBeInTheDocument();
    expect(screen.queryByText(L['details.email.help'])).toBeNull();
    fireEvent.click(submitButton());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        contact: expect.objectContaining({ email: 'kari@example.com' }),
      })
    );
  });

  it('keeps a blank e-mail editable even when emailReadOnly is set', () => {
    setup({
      emailReadOnly: true,
      state: readyState({ contact: { phone: '40000000', name: '', email: '' } }),
    });
    const input = screen.getByLabelText(L['details.email.label']);
    expect(input).not.toHaveAttribute('readonly');
    expect(input).not.toHaveAttribute('aria-readonly');
    fireEvent.focus(input);
    fireEvent.blur(input);
    fireEvent.change(input, { target: { value: 'kari@example.com' } });
    expect(screen.getByText(L['details.email.help'])).toBeInTheDocument();
    expect(screen.queryByText(L['details.email.lockedHelp'])).toBeNull();
  });

  it('keeps a malformed e-mail editable under emailReadOnly and focuses it on submit', () => {
    const { onSubmit } = setup({
      emailReadOnly: true,
      state: readyState({ contact: { phone: '40000000', name: '', email: 'not-an-email' } }),
    });
    const input = screen.getByLabelText(L['details.email.label']);
    expect(input).not.toHaveAttribute('readonly');
    expect(screen.getByText(L['details.email.help'])).toBeInTheDocument();
    fireEvent.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
  });

  it('sends the optional birth year on the line item, not on the contact', () => {
    const { onSubmit } = setup();
    fill(L['details.child.year'], '2017');
    fireEvent.click(submitButton());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ items: [expect.objectContaining({ bookedForBirthYear: 2017 })] })
    );
  });

  it.each([['201x'], ['20a7'], ['20 17'], ['201'], ['2o17'], ['12017'], ['1899'], ['2201']])(
    'sends no birth year at all for %s',
    (typed) => {
      const { onSubmit, onChange } = setup();
      fill(L['details.child.year'], typed);
      fireEvent.click(submitButton());
      expect(onSubmit.mock.calls[0]?.[0].items[0]).not.toHaveProperty('bookedForBirthYear');
      expect(onChange).toHaveBeenCalledWith({
        type: 'setItemField',
        index: 0,
        field: 'bookedForBirthYear',
        value: null,
      });
    }
  );

  it('still takes a year at each end of the bookable range, trimmed', () => {
    const { onSubmit } = setup();
    fill(L['details.child.year'], ' 1900 ');
    fireEvent.click(submitButton());
    expect(onSubmit.mock.calls[0]?.[0].items[0].bookedForBirthYear).toBe(1900);
    fill(L['details.child.year'], '2200');
    fireEvent.click(submitButton());
    expect(onSubmit.mock.calls[1]?.[0].items[0].bookedForBirthYear).toBe(2200);
  });

  it('omits every optional field left blank, rather than sending an empty one', () => {
    const { onSubmit } = setup({
      lines: [{ startTs: THURSDAY_15, resourceId: null }],
    });
    fill(L['details.child.year'], '2017');
    fill(L['details.child.year'], '');
    fill(L['details.child.name'], '   ');
    fireEvent.click(submitButton());
    const submission = onSubmit.mock.calls[0]?.[0];
    expect(Object.keys(submission.items[0]).sort()).toEqual(['serviceId', 'startTs']);
    expect('name' in submission.contact).toBe(false);
    expect('email' in submission.contact).toBe(false);
    expect('notes' in submission).toBe(false);
  });

  it('submits the phone through normalisePhone', () => {
    const { onSubmit } = setup({
      state: readyState({ contact: { phone: '+47 400 00 000', name: '', email: '' } }),
    });
    fireEvent.click(submitButton());
    expect(onSubmit.mock.calls[0]?.[0].contact.phone).toBe('40000000');
  });

  it('carries the resolved resource each line was given', () => {
    const { onSubmit } = setup({ lines: [{ startTs: THURSDAY_15, resourceId: 'res-bo' }] });
    fireEvent.click(submitButton());
    expect(onSubmit.mock.calls[0]?.[0].items[0].resourceId).toBe('res-bo');
  });

  it('prices the button with the total it was given, through format.price', () => {
    setup({ totalOre: 42_900 });
    expect(submitButton()).toHaveAccessibleName('Bestill – 429\u00A0kr betales i salongen');
  });

  it('asks each line by name when there is more than one', () => {
    setup({ state: readyState({ items: [{ service: KIDS }, { service: WASH }] }) });
    expect(screen.getByRole('group', { name: 'Barneklipp' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Barneklipp med vask' })).toBeInTheDocument();
  });

  it('raises the contact fields as actions rather than answering them itself', () => {
    const { onChange } = setup();
    fill(L['details.name.label'], 'Kari');
    fill(L['details.notes.label'], 'Liker ikke maskin');
    fireEvent.click(screen.getByRole('checkbox', { name: L['details.marketing.text'] }));
    expect(onChange).toHaveBeenCalledWith({ type: 'setContact', field: 'name', value: 'Kari' });
    expect(onChange).toHaveBeenCalledWith({ type: 'setNotes', value: 'Liker ikke maskin' });
    expect(onChange).toHaveBeenCalledWith({
      type: 'setConsent',
      which: 'marketing',
      accepted: true,
    });
  });

  it('submits a resource per line for a party split across two resources', () => {
    const { onSubmit } = setup({
      state: readyState({
        items: [{ service: KIDS }, { service: WASH }],
        partyMode: 'parallel',
        resolvedResourceId: null,
        partyResourceIds: ['res-bo', 'res-ada'],
      }),
      lines: [
        { startTs: THURSDAY_15, resourceId: 'res-bo' },
        { startTs: THURSDAY_15, resourceId: 'res-ada' },
      ],
    });
    fireEvent.click(submitButton());
    const { items } = onSubmit.mock.calls[0]?.[0] ?? { items: [] };
    expect(items.map((item: { resourceId?: string }) => item.resourceId)).toEqual([
      'res-bo',
      'res-ada',
    ]);
    expect(items.map((item: { startTs: number }) => item.startTs)).toEqual([
      THURSDAY_15,
      THURSDAY_15,
    ]);
  });

  it('submits one resource twice for a party taken back to back', () => {
    const { onSubmit } = setup({
      state: readyState({ items: [{ service: KIDS }, { service: WASH }] }),
    });
    fireEvent.click(submitButton());
    expect(onSubmit.mock.calls[0]?.[0].items).toEqual([
      { serviceId: 'svc-kids', resourceId: 'res-ada', startTs: THURSDAY_15 },
      { serviceId: 'svc-wash', resourceId: 'res-ada', startTs: THURSDAY_15 + HALF_HOUR },
    ]);
  });

  it('carries the marketing opt-in on the submission', () => {
    const { onSubmit } = setup({ state: readyState({ consentMarketing: true }) });
    fireEvent.click(submitButton());
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      consentTerms: true,
      consentMarketing: true,
    });
  });

  it('refuses a number that cannot be a number, and focuses that field', () => {
    const { onSubmit } = setup({ state: badPhoneState() });
    fireEvent.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    const phone = screen.getByLabelText(L['details.phone.label']);
    expect(phone).toHaveAttribute('aria-invalid', 'true');
    expect(phone).toHaveFocus();
  });

  it('refuses an address that cannot receive anything, and focuses it', () => {
    const { onSubmit } = setup({
      state: readyState({ contact: { phone: '40000000', name: '', email: 'kari@' } }),
    });
    fireEvent.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    const email = screen.getByLabelText(L['details.email.label']);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveFocus();
  });

  it('still books without an address, and with an ordinary one', () => {
    const blank = setup({
      state: readyState({ contact: { phone: '40000000', name: '', email: '  ' } }),
    });
    fireEvent.click(submitButton());
    expect(blank.onSubmit).toHaveBeenCalled();
    blank.unmount();

    const ordinary = setup({
      state: readyState({ contact: { phone: '40000000', name: '', email: 'kari@example.no' } }),
    });
    fireEvent.click(submitButton());
    expect(ordinary.onSubmit).toHaveBeenCalled();
  });

  it('refuses an unaccepted terms box, and focuses that box', () => {
    const { onSubmit } = setup({ state: readyState({ consentTerms: false }) });
    fireEvent.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
    const terms = screen.getByRole('checkbox', { name: L['details.terms.text'] });
    expect(terms).toHaveAttribute('aria-invalid', 'true');
    expect(terms).toHaveFocus();
  });

  it('renders a submit failure from the wizard’s error, with a way to call', () => {
    setup({ state: readyState({ error: 'unconfigured' }), phone: '22 33 44 55' });
    expect(screen.getByRole('alert')).toHaveTextContent(L['details.error.unconfigured']);
    expect(screen.getByRole('link', { name: 'Ring 22 33 44 55' })).toHaveAttribute(
      'href',
      'tel:22334455'
    );
  });

  it('says the same thing unlinked when there is no number', () => {
    setup({ state: readyState({ error: 'unconfigured' }), phone: null });
    expect(screen.getByRole('alert')).toHaveTextContent(L['details.call.none']);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('says nothing when nothing has failed', () => {
    setup();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('tells the visitor when the booking system did not answer', () => {
    setup({ state: readyState({ error: 'upstreamError' }), phone: '22 33 44 55' });
    expect(screen.getByRole('alert')).toHaveTextContent(L['details.error.upstreamError']);
    expect(screen.getByRole('link', { name: /Ring/ })).toBeInTheDocument();
  });

  it('has a label key for every wizard error', () => {
    const errors: WizardError[] = [
      'maxParty',
      'slotTaken',
      'conflict',
      'invalidInput',
      'unconfigured',
      'upstreamError',
      'inProgress',
    ];
    for (const error of errors) {
      expect(DETAILS_SCREEN_LABEL_KEYS).toContain(DETAILS_ERROR_LABEL_KEYS[error]);
    }
  });

  it('takes one submission per press, not one per tap', () => {
    const { onSubmit } = setup({ submitting: true });
    expect(submitButton()).toBeDisabled();
    expect(submitButton()).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(submitButton());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('carries one nonce for the whole submission, not one per press', () => {
    const { onSubmit } = setup();
    fireEvent.click(submitButton());
    fireEvent.click(submitButton());
    const first = onSubmit.mock.calls[0]?.[0].submissionNonce;
    expect(first).toEqual(expect.any(String));
    expect(first).not.toHaveLength(0);
    expect(onSubmit.mock.calls[1]?.[0].submissionNonce).toBe(first);
  });

  it('mints a new nonce per mount, and uses the caller’s when given', () => {
    const onSubmit = vi.fn();
    const press = (nth: number) =>
      fireEvent.click(screen.getAllByRole('button', { name: /^Bestill –/ })[nth] as HTMLElement);
    setup({ onSubmit });
    press(0);
    setup({ onSubmit });
    press(1);
    setup({ onSubmit, submissionNonce: 'held-by-shell' });
    press(2);
    expect(onSubmit.mock.calls[1]?.[0].submissionNonce).not.toBe(
      onSubmit.mock.calls[0]?.[0].submissionNonce
    );
    expect(onSubmit.mock.calls[2]?.[0].submissionNonce).toBe('held-by-shell');
  });

  it('mints a v4-shaped nonce outside secure contexts (no crypto.randomUUID)', () => {
    const original = crypto.randomUUID;
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
    try {
      const { onSubmit } = setup();
      fireEvent.click(submitButton());
      expect(onSubmit.mock.calls[0]?.[0].submissionNonce).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      );
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true });
    }
  });

  it('raises the child fields as actions, so the machine owns the answers too', () => {
    const { onChange } = setup({
      state: readyState({ items: [{ service: KIDS }, { service: WASH }] }),
    });
    const year = (nth: number) =>
      screen.getAllByLabelText(L['details.child.year'])[nth] as HTMLElement;
    fireEvent.change(year(0), { target: { value: '2017' } });
    expect(onChange).toHaveBeenCalledWith({
      type: 'setItemField',
      index: 0,
      field: 'bookedForBirthYear',
      value: 2017,
    });
    fireEvent.change(year(0), { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith({
      type: 'setItemField',
      index: 0,
      field: 'bookedForBirthYear',
      value: null,
    });
    fireEvent.change(screen.getAllByLabelText(L['details.child.name'])[1] as HTMLElement, {
      target: { value: 'Emma' },
    });
    expect(onChange).toHaveBeenCalledWith({
      type: 'setItemField',
      index: 1,
      field: 'bookedForName',
      value: 'Emma',
    });
  });

  it('shows the answers the machine already holds, so stepping back loses nothing', () => {
    const { onSubmit } = setup({
      state: readyState({
        items: [{ service: KIDS, bookedForName: 'Jonas', bookedForBirthYear: 2017 }],
      }),
    });
    expect(screen.getByLabelText(L['details.child.name'])).toHaveValue('Jonas');
    expect(screen.getByLabelText(L['details.child.year'])).toHaveValue('2017');
    fireEvent.click(submitButton());
    expect(onSubmit.mock.calls[0]?.[0].items[0]).toMatchObject({
      bookedForName: 'Jonas',
      bookedForBirthYear: 2017,
    });
  });

  describe('the profile suggestions', () => {
    const FAMILY = [
      { name: 'Jonas', birthYear: 2017 },
      { name: 'Emma', birthYear: 2020 },
    ];

    it('renders nothing at all when there is no profile', () => {
      setup();
      expect(screen.queryByRole('button', { name: 'Jonas' })).toBeNull();
    });

    it('fills both fields from one tap', () => {
      const { onChange } = setup({ family: FAMILY });
      fireEvent.click(screen.getByRole('button', { name: 'Emma' }));
      expect(screen.getByLabelText(L['details.child.name'])).toHaveValue('Emma');
      expect(screen.getByLabelText(L['details.child.year'])).toHaveValue('2020');
      expect(onChange).toHaveBeenCalledWith({
        type: 'setItemField',
        index: 0,
        field: 'bookedForName',
        value: 'Emma',
      });
    });

    it('stops announcing itself as chosen once the year is corrected', () => {
      setup({ family: FAMILY });
      fireEvent.click(screen.getByRole('button', { name: 'Jonas' }));
      expect(screen.getByRole('button', { name: 'Jonas' })).toHaveAttribute('aria-pressed', 'true');
      fill(L['details.child.year'], '2018');
      expect(screen.getByRole('button', { name: 'Jonas' })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });
  });

  describe('for a saved person named on step 1', () => {
    function jonasState(phone = '40000000'): WizardState {
      return readyState({
        people: [{ key: 'p:p-jonas', personId: 'p-jonas', name: 'Jonas', birthYear: 2018 }],
        choices: [KIDS],
        items: [
          {
            service: KIDS,
            bookedForName: 'Jonas',
            bookedForBirthYear: 2018,
            bookedForPersonId: 'p-jonas',
          },
        ],
        contact: { phone, name: 'Kari', email: '' },
      });
    }

    it('names the person rather than asking, and sends the id under the guardian’s own number', () => {
      const { onSubmit } = setup({ state: jonasState(), guardianPhone: '+47 400 00 000' });
      expect(screen.queryByLabelText(L['details.child.name'])).toBeNull();
      expect(screen.getByRole('list', { name: L['details.known.label'] })).toHaveTextContent(
        'Barneklipp til Jonas'
      );
      fireEvent.click(submitButton());
      expect(onSubmit.mock.calls[0]?.[0].items[0]).toMatchObject({
        bookedForName: 'Jonas',
        bookedForBirthYear: 2018,
        bookedForPersonId: 'p-jonas',
      });
    });

    it('names a guardian booking for themselves, and a guest adult', () => {
      setup({
        state: readyState({
          people: [
            { key: 'self', adult: true },
            { key: 'adult', adult: true },
          ],
          items: [
            { service: KIDS, adult: true },
            { service: WASH, adult: true },
          ],
        }),
      });
      const list = screen.getByRole('list', { name: L['details.known.label'] });
      expect(list).toHaveTextContent('Barneklipp til deg');
      expect(list).toHaveTextContent('Barneklipp med vask til en voksen');
    });

    it('keeps the id back under another number, or with no guardian to compare to', () => {
      const other = setup({ state: jonasState('99887766'), guardianPhone: '+47 400 00 000' });
      fireEvent.click(submitButton());
      expect(other.onSubmit.mock.calls[0]?.[0].items[0]).not.toHaveProperty('bookedForPersonId');
      expect(other.onSubmit.mock.calls[0]?.[0].items[0]).toMatchObject({ bookedForName: 'Jonas' });
      other.unmount();

      const nobody = setup({ state: jonasState() });
      fireEvent.click(submitButton());
      expect(nobody.onSubmit.mock.calls[0]?.[0].items[0]).not.toHaveProperty('bookedForPersonId');
    });

    it('attaches the saved person a chip names on a guest line, and detaches on typing', () => {
      const { onChange } = setup({
        family: [{ name: 'Jonas', birthYear: 2018, personId: 'p-jonas' }],
      });
      fireEvent.click(screen.getByRole('button', { name: 'Jonas' }));
      expect(onChange).toHaveBeenCalledWith({
        type: 'setItemField',
        index: 0,
        field: 'bookedForPersonId',
        value: 'p-jonas',
      });
      fill(L['details.child.name'], 'Jonas E');
      expect(onChange).toHaveBeenLastCalledWith({
        type: 'setItemField',
        index: 0,
        field: 'bookedForPersonId',
        value: null,
      });
    });
  });

  describe('override ladder', () => {
    it('takes a labels override', () => {
      setup({ labels: { ...L, 'details.heading': 'Last step' } });
      expect(screen.getByRole('heading', { name: 'Last step' })).toBeInTheDocument();
    });

    it('lands classNames on their slots', () => {
      setup({
        classNames: { root: 'x-root', submit: 'x-submit', heading: 'x-heading' },
      });
      expect(screen.getByRole('region')).toHaveClass('x-root', 'space-y-6');
      expect(submitButton()).toHaveClass('x-submit', 'w-full');
      expect(screen.getByRole('heading')).toHaveClass('x-heading');
    });

    it('replaces the family chip with components.FamilyChip', () => {
      function Chip({ member, onPick }: FamilyChipProps) {
        return (
          <button type="button" data-testid="custom-chip" onClick={onPick}>
            Pick {member.name}
          </button>
        );
      }
      setup({ family: [{ name: 'Emma', birthYear: 2020 }], components: { FamilyChip: Chip } });
      fireEvent.click(screen.getByRole('button', { name: 'Pick Emma' }));
      expect(screen.getByLabelText(L['details.child.name'])).toHaveValue('Emma');
    });
  });

  it('has no axe violations', async () => {
    const { container } = setup({
      state: readyState({ items: [{ service: KIDS }, { service: WASH }], error: 'conflict' }),
      family: [{ name: 'Emma', birthYear: 2020 }],
      phone: '22 00 00 00',
      termsHref: '/terms',
    });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});

describe('looksLikeEmail', () => {
  it('accepts blank and ordinary addresses, and refuses what cannot receive mail', () => {
    expect(looksLikeEmail('')).toBe(true);
    expect(looksLikeEmail('  ')).toBe(true);
    expect(looksLikeEmail('kari@example.no')).toBe(true);
    expect(looksLikeEmail('kari@')).toBe(false);
    expect(looksLikeEmail('kari example.no')).toBe(false);
    expect(looksLikeEmail('kari@example')).toBe(false);
  });

  it('matches the loose one-@-and-a-dot rule at the edges', () => {
    for (const ok of ['a@b.c', 'a@b..c', 'a.b@c.d.e', ' a@b.c '])
      expect(looksLikeEmail(ok), ok).toBe(true);
    for (const bad of ['@b.c', 'a@.b', 'a@b.', 'a@b@c.d', 'a b@c.d', 'a@b .c']) {
      expect(looksLikeEmail(bad), bad).toBe(false);
    }
  });

  it('stays linear on pathological input', () => {
    const started = performance.now();
    looksLikeEmail(`!@!${'.!'.repeat(50_000)}`);
    looksLikeEmail(`a@${'.'.repeat(100_000)}`);
    expect(performance.now() - started).toBeLessThan(200);
  });
});

describe('DetailsScreen — text nodes', () => {
  const nodes = (element: Element) =>
    Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent);

  it('renders a string submit label as ONE text node', () => {
    setup();
    expect(nodes(submitButton())).toHaveLength(1);
  });

  it('renders an array submit label one text node per element', () => {
    setup({ labels: { ...L, 'details.submit': ['Bestill – ', '{price}', ' betales i salongen'] } });
    expect(nodes(submitButton())).toEqual([
      'Bestill – ',
      demoFormatNb.price(39_000),
      ' betales i salongen',
    ]);
  });
});

describe('DetailsScreen — phone prefix forms', () => {
  it('draws no prefix box and no description for a prefix the pack left blank', () => {
    setup({ labels: { ...L, 'details.phone.prefix': [''] } });
    const phone = screen.getByLabelText(L['details.phone.label'] as string);
    expect(phone).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText('+47')).toBeNull();
  });

  it('draws an array prefix one text node per element', () => {
    setup({ labels: { ...L, 'details.phone.prefix': ['+', '47'] } });
    const phone = screen.getByLabelText(L['details.phone.label'] as string);
    const prefix = document.getElementById(phone.getAttribute('aria-describedby') ?? '');
    expect(Array.from(prefix?.childNodes ?? [], (node) => node.textContent)).toEqual(['+', '47']);
  });
});
