import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { DEMO_NOW, demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import { confirmationLabelsNb as L } from '../../../src/booking/__stories__/labels.details.js';
import {
  Confirmation,
  type ConfirmationLine,
  type ConfirmationProps,
  type PartyLineProps,
} from '../../../src/booking/confirmation.js';
import type { WizardItem, WizardService } from '../../../src/booking/types.js';

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

/** Monday 14 September 2026, 15:00 Oslo — the same day as DEMO_NOW. */
const MONDAY_15 = Date.UTC(2026, 8, 14, 13);
const HALF_HOUR = 30 * 60_000;

/** Off where a price is asserted: the demo format joins «kr» with U+00A0. */
const exactly = (text: string) => text;

const JONAS: WizardItem = { service: KIDS, bookedForName: 'Jonas' };
const EMMA: WizardItem = { service: WASH, bookedForName: 'Emma' };

function line(
  item: WizardItem,
  overrides: Partial<Omit<ConfirmationLine, 'item'>> = {}
): ConfirmationLine {
  return {
    item,
    bookingId: 'bk_1',
    stylistName: 'Ada',
    manageHref: null,
    startTs: MONDAY_15,
    priceOre: 39_000,
    ...overrides,
  };
}

function setup(props: Partial<ConfirmationProps> = {}) {
  const lines = props.lines ?? [line(JONAS)];
  return render(
    <Confirmation
      lines={lines}
      startTs={MONDAY_15}
      totalOre={lines.reduce((sum, entry) => sum + entry.priceOre, 0)}
      calendarHref="data:text/calendar;charset=utf-8,BEGIN%3AVCALENDAR"
      calendarFileName="salong-demo.ics"
      portalHref="/account"
      now={DEMO_NOW}
      format={demoFormatNb}
      labels={L}
      {...props}
    />
  );
}

/** Every «390 kr» in a piece of text, as numbers. */
function kroner(text: string): number[] {
  return [...text.matchAll(/(\d[\d\u00A0]*)\u00A0kr/g)].map((match) =>
    Number((match[1] ?? '').replace(/\u00A0/g, ''))
  );
}

describe('Confirmation', () => {
  it('says the thing the visitor came to hear', () => {
    setup();
    expect(screen.getByRole('heading', { name: L['confirmation.heading'] })).toBeInTheDocument();
  });

  it('reads the booking back on the business’s clock', () => {
    setup();
    expect(
      screen.getByText('Barneklipp for Jonas · Ada · i dag kl. 15:00 · 390 kr')
    ).toBeInTheDocument();
  });

  it('cleans a stylist name it was handed raw', () => {
    setup({
      lines: [line(JONAS, { stylistName: 'bo (Demo)' }), line(EMMA, { stylistName: 'cleo' })],
    });
    expect(screen.getByText('15:00 Jonas – Barneklipp hos Bo – 390 kr')).toBeInTheDocument();
    expect(
      screen.getByText('15:00 Emma – Barneklipp med vask hos Cleo – 390 kr')
    ).toBeInTheDocument();
  });

  it('leaves out the parts of the line it was not told', () => {
    setup({ lines: [line({ service: KIDS }, { stylistName: null })] });
    expect(screen.getByText('Barneklipp · i dag kl. 15:00 · 390 kr')).toBeInTheDocument();
  });

  it('collapses the blank parts of a family line too', () => {
    setup({
      lines: [
        line({ service: KIDS }, { stylistName: null }),
        line(EMMA, { startTs: MONDAY_15 + HALF_HOUR }),
      ],
    });
    expect(
      screen.getByText('15:00 – Barneklipp – 390\u00A0kr', { normalizer: exactly })
    ).toBeInTheDocument();
  });

  it('lays a family out line by line, in the order they sit down', () => {
    setup({ lines: [line(JONAS), line(EMMA, { startTs: MONDAY_15 + HALF_HOUR })] });
    expect(screen.getByText('Felles besøk · i dag')).toBeInTheDocument();
    expect(screen.getByText('15:00 Jonas – Barneklipp hos Ada – 390 kr')).toBeInTheDocument();
    expect(
      screen.getByText('15:30 Emma – Barneklipp med vask hos Ada – 390 kr')
    ).toBeInTheDocument();
    expect(screen.getByText('Til sammen 780 kr · betales i salongen')).toBeInTheDocument();
  });

  it('prints each line’s own price, and a total the lines add up to', () => {
    setup({
      lines: [
        line(JONAS, { priceOre: 42_900 }),
        line(EMMA, { priceOre: 42_900, startTs: MONDAY_15 + HALF_HOUR }),
      ],
    });
    expect(
      screen.getByText('15:00 Jonas – Barneklipp hos Ada – 429\u00A0kr', { normalizer: exactly })
    ).toBeInTheDocument();
    const totalLine = screen.getByText('Til sammen 858\u00A0kr · betales i salongen', {
      normalizer: exactly,
    });
    const perLine = screen.getAllByRole('listitem').flatMap((row) => kroner(row.textContent ?? ''));
    expect(perLine).toEqual([429, 429]);
    expect(perLine.reduce((sum, amount) => sum + amount, 0)).toBe(
      kroner(totalLine.textContent ?? '')[0]
    );
  });

  it('names the right stylist on each line when the party was split', () => {
    setup({
      lines: [line(JONAS, { stylistName: 'Bo' }), line(EMMA, { stylistName: 'Ada' })],
    });
    expect(screen.getByText('15:00 Jonas – Barneklipp hos Bo – 390 kr')).toBeInTheDocument();
    expect(
      screen.getByText('15:00 Emma – Barneklipp med vask hos Ada – 390 kr')
    ).toBeInTheDocument();
  });

  it('offers the calendar file as a download, and only when given one', () => {
    const { unmount } = setup();
    const link = screen.getByRole('link', { name: L['confirmation.calendar'] });
    expect(link).toHaveAttribute('download', 'salong-demo.ics');
    expect(link.getAttribute('href')).toMatch(/^data:text\/calendar;charset=utf-8,/);
    unmount();
    setup({ calendarHref: null });
    expect(screen.queryByRole('link', { name: L['confirmation.calendar'] })).toBeNull();
  });

  it('draws the address only when given one', () => {
    const { unmount } = setup({ address: 'Demogata 1, 0150 Oslo' });
    expect(screen.getByText('Demogata 1, 0150 Oslo')).toBeInTheDocument();
    unmount();
    const { container } = setup({ address: null });
    expect(container.querySelector('.text-muted-foreground')).toBeNull();
  });

  it('offers the manage link only when there is somewhere to send them', () => {
    const { unmount } = setup({ lines: [line(JONAS, { manageHref: '/manage/mt_1' })] });
    expect(screen.getByRole('link', { name: L['confirmation.manage'] })).toHaveAttribute(
      'href',
      '/manage/mt_1'
    );
    unmount();
    setup();
    expect(screen.queryByRole('link', { name: L['confirmation.manage'] })).toBeNull();
  });

  it('gives every line in a party its own named way back into its own booking', () => {
    setup({
      lines: [
        line(JONAS, { bookingId: 'bk_jonas', manageHref: '/manage/mt_jonas' }),
        line(EMMA, {
          bookingId: 'bk_emma',
          manageHref: '/manage/mt_emma',
          startTs: MONDAY_15 + HALF_HOUR,
        }),
      ],
    });
    expect(
      screen.getByRole('link', { name: 'Flytt eller avbestill Jonas kl. 15:00' })
    ).toHaveAttribute('href', '/manage/mt_jonas');
    expect(
      screen.getByRole('link', { name: 'Flytt eller avbestill Emma kl. 15:30' })
    ).toHaveAttribute('href', '/manage/mt_emma');
  });

  it('does not lend one line’s manage link to a sibling that had none', () => {
    setup({
      lines: [
        line(JONAS, { manageHref: '/manage/mt_jonas' }),
        line(EMMA, { startTs: MONDAY_15 + HALF_HOUR }),
      ],
    });
    expect(screen.getAllByRole('link', { name: /Flytt eller avbestill/ })).toHaveLength(1);
    expect(screen.queryByRole('link', { name: 'Flytt eller avbestill Emma kl. 15:30' })).toBeNull();
  });

  it('offers one portal link for a single line and for a party, and none without a href', () => {
    const single = setup({ lines: [line(JONAS, { manageHref: '/manage/mt_1' })] });
    expect(screen.getByRole('link', { name: L['confirmation.portal'] })).toHaveAttribute(
      'href',
      '/account'
    );
    single.unmount();

    const party = setup({
      lines: [
        line(JONAS, { manageHref: '/manage/mt_jonas' }),
        line(EMMA, { manageHref: '/manage/mt_emma' }),
      ],
    });
    expect(screen.getAllByRole('link', { name: L['confirmation.portal'] })).toHaveLength(1);
    party.unmount();

    setup({ portalHref: null });
    expect(screen.queryByRole('link', { name: L['confirmation.portal'] })).toBeNull();
  });

  it('offers a fresh start only when given a way to start over', () => {
    const onStartOver = vi.fn();
    const { unmount } = setup();
    expect(screen.queryByRole('button', { name: L['confirmation.startOver'] })).toBeNull();
    unmount();
    setup({ onStartOver });
    fireEvent.click(screen.getByRole('button', { name: L['confirmation.startOver'] }));
    expect(onStartOver).toHaveBeenCalledTimes(1);
  });

  describe('override ladder', () => {
    it('takes a labels override', () => {
      setup({ labels: { ...L, 'confirmation.heading': 'All set' } });
      expect(screen.getByRole('heading', { name: 'All set' })).toBeInTheDocument();
    });

    it('lands classNames on their slots', () => {
      setup({
        classNames: { root: 'x-root', card: 'x-card', link: 'x-link' },
      });
      expect(screen.getByRole('region')).toHaveClass('x-root', 'space-y-6');
      expect(screen.getByText(/Barneklipp for Jonas/)).toHaveClass('x-card', 'bg-card');
      expect(screen.getByRole('link', { name: L['confirmation.calendar'] })).toHaveClass('x-link');
    });

    it('replaces the party line with components.PartyLine', () => {
      function Row({ text }: PartyLineProps) {
        return <li data-testid="row">[{text}]</li>;
      }
      setup({ lines: [line(JONAS), line(EMMA)], components: { PartyLine: Row } });
      expect(screen.getAllByTestId('row')).toHaveLength(2);
      expect(screen.getByText('[15:00 Jonas – Barneklipp hos Ada – 390 kr]')).toBeInTheDocument();
    });
  });

  it('has no axe violations', async () => {
    const { container } = setup({
      lines: [
        line(JONAS, { manageHref: '/manage/mt_jonas' }),
        line(EMMA, { manageHref: '/manage/mt_emma', startTs: MONDAY_15 + HALF_HOUR }),
      ],
      address: 'Demogata 1, 0150 Oslo',
      onStartOver: vi.fn(),
    });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});

/** The text nodes directly under `element`, in order. */
function textNodes(element: Element): string[] {
  return Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '');
}

describe('Confirmation — text nodes', () => {
  const party = () => [line(JONAS), line(EMMA, { startTs: MONDAY_15 + HALF_HOUR })];

  it('renders a string party total as ONE text node', () => {
    setup({ lines: party() });
    const total = demoFormatNb.price(78_000);
    const text = (L['confirmation.party.total'] as string).replace('{total}', total);
    expect(textNodes(screen.getByText(text, { normalizer: exactly }))).toEqual([text]);
  });

  it('renders an array party total as one text node per element', () => {
    setup({
      lines: party(),
      labels: { ...L, 'confirmation.party.total': ['Til sammen ', '{total}', ' · ', 'betales'] },
    });
    const total = demoFormatNb.price(78_000);
    const node = screen.getByText(`Til sammen ${total} · betales`, { normalizer: exactly });
    expect(textNodes(node)).toEqual(['Til sammen ', total, ' · ', 'betales']);
  });

  it('renders the party heading in the form its label is written', () => {
    const { unmount } = setup({ lines: party() });
    expect(textNodes(screen.getByText('Felles besøk · i dag'))).toEqual(['Felles besøk · i dag']);
    unmount();
    setup({
      lines: party(),
      labels: { ...L, 'confirmation.party.heading': ['Felles besøk · ', '{day}'] },
    });
    expect(textNodes(screen.getByText('Felles besøk · i dag'))).toEqual([
      'Felles besøk · ',
      'i dag',
    ]);
  });

  it('joins the single card into ONE text node when its labels are strings', () => {
    setup();
    const text = `Barneklipp for Jonas · Ada · i dag kl. 15:00 · ${demoFormatNb.price(39_000)}`;
    expect(textNodes(screen.getByText(text, { normalizer: exactly }))).toEqual([text]);
  });

  it('renders the single card in pieces once one of its labels is an array', () => {
    setup({
      labels: { ...L, 'confirmation.serviceFor': ['{service}', ' for ', '{name}'] },
    });
    const price = demoFormatNb.price(39_000);
    const node = screen.getByText(`Barneklipp for Jonas · Ada · i dag kl. 15:00 · ${price}`, {
      normalizer: exactly,
    });
    expect(textNodes(node)).toEqual([
      'Barneklipp',
      ' for ',
      'Jonas',
      ' · ',
      'Ada',
      ' · ',
      'i dag kl. 15:00',
      ' · ',
      price,
    ]);
  });

  it('flattens an array label wherever it is text only', () => {
    setup({
      lines: [line(JONAS, { manageHref: '/m/1' }), line(EMMA, { manageHref: '/m/2' })],
      labels: {
        ...L,
        'confirmation.manageFor': ['Endre ', '{who}', ' kl. ', '{time}'],
        'confirmation.party.line': ['{time} ', '{name}', ' – ', '{service}'],
      },
    });
    expect(screen.getByRole('link', { name: 'Endre Jonas kl. 15:00' })).toBeInTheDocument();
    expect(screen.getByText('15:00 Jonas – Barneklipp')).toBeInTheDocument();
  });
});
