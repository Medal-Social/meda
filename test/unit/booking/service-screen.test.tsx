import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import {
  demoCategoriesNb as categories,
  serviceScreenLabelsNb as labels,
} from '../../../src/booking/__stories__/labels.steps.js';
import {
  DefaultServiceCard,
  type ServiceCardProps,
  ServiceScreen,
  type ServiceScreenProps,
  type ServiceSelection,
} from '../../../src/booking/service-screen.js';
import type { BookingServiceDto } from '../../../src/booking/types.js';

/**
 * A catalogue shaped like a real one: the phone-only service sits in the
 * group furthest from the children's, so the tests prove it is still on the
 * page when the visitor lands with the children's pill marked.
 */
const KIDS_CUT: BookingServiceDto = {
  id: 'svc-kids',
  name: 'Barneklipp',
  category: 'kids',
  durationMinutes: 30,
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  priceOre: 49_000,
  maxPerBooking: 3,
  weekendSurchargePct: 10,
  bookableOnline: true,
};
const PIERCING: BookingServiceDto = {
  ...KIDS_CUT,
  id: 'svc-piercing',
  name: 'Hull i ørene',
  category: 'other',
  durationMinutes: 15,
  priceOre: 30_000,
  maxPerBooking: 1,
  bookableOnline: false,
};
const KIDS_WASH: BookingServiceDto = { ...KIDS_CUT, id: 'svc-kids-wash', name: 'Klipp og vask' };
const ADULT_CUT: BookingServiceDto = {
  ...KIDS_CUT,
  id: 'svc-adult',
  name: 'Voksenklipp',
  category: 'adults',
  durationMinutes: 60,
  priceOre: 79_000,
  maxPerBooking: 1,
};
const TODDLER_CUT: BookingServiceDto = {
  ...KIDS_CUT,
  id: 'svc-toddler',
  name: 'Småbarnsklipp',
  ageMaxYears: 6,
};

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');

function renderService(props: Partial<ServiceScreenProps> = {}) {
  const onPick = vi.fn();
  const view = render(
    <ServiceScreen
      labels={labels}
      format={demoFormatNb}
      services={[KIDS_CUT]}
      categories={categories}
      childCategory="kids"
      onPick={onPick}
      {...props}
    />
  );
  return { ...view, onPick: (props.onPick as typeof onPick | undefined) ?? onPick };
}

describe('ServiceScreen', () => {
  it('asks the question as its heading', () => {
    renderService();
    expect(
      screen.getByRole('heading', { level: 2, name: labels['service.heading'] })
    ).toBeInTheDocument();
  });

  it('shows a phone-only service instead of hiding it', () => {
    renderService({ services: [KIDS_CUT, PIERCING], phone: '22334455' });
    expect(screen.getByText('Hull i ørene')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(labels['service.phoneOnly']))).toBeInTheDocument();
  });

  it('offers the number to call instead of a price, and no button to press', () => {
    renderService({ services: [PIERCING], phone: '22 33 44 55' });
    expect(screen.queryByRole('button', { name: /Hull i ørene/ })).toBeNull();
    // Spaces are typography, not part of the number a phone can dial.
    const link = screen.getByRole('link', {
      name: fill(labels['service.phoneOnlyLinkLabel'], { phone: '22 33 44 55' }),
    });
    expect(link).toHaveAttribute('href', 'tel:22334455');
    expect(link).toHaveTextContent('22 33 44 55');
  });

  it('says the same sentence without a link when there is no number yet', () => {
    renderService({ services: [PIERCING], phone: null });
    expect(screen.getByText(labels['service.phoneOnly'])).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('books on the first tap, with the whole card as the target', () => {
    const { onPick } = renderService();
    const card = screen.getByRole('button', { name: /Barneklipp/ });
    // Name, duration and price are one target.
    expect(card).toHaveAccessibleName(/Barneklipp.*30 min.*490/s);
    fireEvent.click(card);
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith(KIDS_CUT);
  });

  it('keeps every service on the page, in category order, with the first pill marked', () => {
    renderService({ services: [ADULT_CUT, PIERCING, KIDS_CUT] });

    expect(screen.getByRole('button', { name: 'Barn' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Voksne' })).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('group', { name: labels['service.categoriesLegend'] })
    ).toBeInTheDocument();
    for (const name of ['Barneklipp', 'Voksenklipp', 'Hull i ørene']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    // The categories' order, whatever order the source returned.
    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(['Barn', 'Voksne', 'Annet']);
  });

  it('moves the marker to the pill you tap, and still shortens nothing', () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    renderService({ services: [ADULT_CUT, KIDS_CUT, PIERCING] });

    fireEvent.click(screen.getByRole('button', { name: 'Voksne' }));
    expect(screen.getByRole('button', { name: 'Voksne' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Barn' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Barneklipp')).toBeInTheDocument();
    expect(screen.getByText('Hull i ørene')).toBeInTheDocument();
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  });

  it('opens on the initial category when that group exists, and ignores one that does not', () => {
    const { unmount } = renderService({
      services: [ADULT_CUT, KIDS_CUT],
      initialCategory: 'adults',
    });
    expect(screen.getByRole('button', { name: 'Voksne' })).toHaveAttribute('aria-pressed', 'true');
    unmount();
    renderService({ services: [ADULT_CUT, KIDS_CUT], initialCategory: 'colour' });
    expect(screen.getByRole('button', { name: 'Barn' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('draws no pills for a single group', () => {
    renderService({ services: [KIDS_CUT, KIDS_WASH] });
    expect(screen.queryByRole('group')).toBeNull();
  });

  it('files a service from a category nobody planned for under the last category', () => {
    renderService({ services: [{ ...KIDS_CUT, category: 'lashes' }] });
    expect(screen.getByRole('heading', { level: 3, name: 'Annet' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Barneklipp/ })).toBeInTheDocument();
  });

  it('files through `categoryOf` when given one', () => {
    renderService({ services: [KIDS_CUT], categoryOf: () => 'colour' });
    expect(screen.getByRole('heading', { level: 3, name: 'Farge' })).toBeInTheDocument();
  });

  describe('for a family', () => {
    const PEOPLE = [
      { key: 'p:theo', label: 'Theo · 7 år', adult: false },
      { key: 'guest:2', label: 'Barn 2', adult: false },
    ];

    it('asks each child on their own, from the children’s menu the party can have', () => {
      const onPickFor = vi.fn();
      renderService({
        services: [
          KIDS_CUT,
          KIDS_WASH,
          ADULT_CUT,
          PIERCING,
          { ...KIDS_WASH, id: 'off', name: 'Stengt', bookableOnline: false },
        ],
        party: { people: PEOPLE, choices: [null, null], onPickFor },
      });

      expect(screen.getByRole('heading', { level: 3, name: 'Theo · 7 år' })).toBeInTheDocument();
      const theo = within(
        screen.getByRole('list', {
          name: fill(labels['service.party.listLabel'], { label: 'Theo · 7 år' }),
        })
      );
      expect(theo.getAllByRole('button').map((option) => option.textContent)).toEqual([
        'Barneklipp30 min490\u00A0kr',
        'Klipp og vask30 min490\u00A0kr',
      ]);

      fireEvent.click(
        within(
          screen.getByRole('list', {
            name: fill(labels['service.party.listLabel'], { label: 'Barn 2' }),
          })
        ).getByRole('button', { name: /Klipp og vask/ })
      );
      expect(onPickFor).toHaveBeenCalledWith(1, KIDS_WASH);
    });

    it('marks each child’s current answer', () => {
      renderService({
        services: [KIDS_CUT, KIDS_WASH],
        party: { people: PEOPLE, choices: [KIDS_CUT, null], onPickFor: vi.fn() },
      });
      const theo = within(
        screen.getByRole('list', {
          name: fill(labels['service.party.listLabel'], { label: 'Theo · 7 år' }),
        })
      );
      expect(theo.getByRole('button', { name: /Barneklipp/ })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
      expect(theo.getByRole('button', { name: /Klipp og vask/ })).toHaveAttribute(
        'aria-pressed',
        'false'
      );
    });

    it('says in one line when nothing can ride along, and offers to take that person out', () => {
      const onRemove = vi.fn();
      renderService({
        // An adult cut is 1 per booking: it cannot join a party of two.
        services: [KIDS_CUT, ADULT_CUT],
        party: {
          people: [
            PEOPLE[0] as (typeof PEOPLE)[number],
            { key: 'self', label: 'Meg selv', adult: true },
          ],
          choices: [null, null],
          onPickFor: vi.fn(),
          onRemove,
        },
      });
      expect(
        screen.getByText(fill(labels['service.party.adultAlone'], { label: 'Meg selv' }))
      ).toBeInTheDocument();
      fireEvent.click(
        screen.getByRole('button', {
          name: fill(labels['service.party.remove'], { label: 'Meg selv' }),
        })
      );
      expect(onRemove).toHaveBeenCalledWith(1);
    });

    it('says so for a child too, without calling them a grown-up', () => {
      renderService({
        services: [ADULT_CUT],
        party: { people: PEOPLE, choices: [null, null], onPickFor: vi.fn() },
      });
      expect(
        screen.getByText(fill(labels['service.party.nothingFits'], { label: 'Theo · 7 år' }))
      ).toBeInTheDocument();
      expect(
        screen.getByText(fill(labels['service.party.nothingFits'], { label: 'Barn 2' }))
      ).toBeInTheDocument();
      expect(
        screen.queryByText(fill(labels['service.party.adultAlone'], { label: 'Barn 2' }))
      ).toBeNull();
      // No remove offer without `onRemove`.
      expect(screen.queryByRole('button')).toBeNull();
    });

    it('offers a person’s suggestion first, with the rest behind «choose something else»', () => {
      const onPickFor = vi.fn();
      renderService({
        services: [KIDS_CUT, KIDS_WASH],
        party: {
          people: [
            { ...PEOPLE[0], suggestion: { service: KIDS_WASH } } as (typeof PEOPLE)[number],
            PEOPLE[1] as (typeof PEOPLE)[number],
          ],
          choices: [null, null],
          onPickFor,
        },
      });
      const same = screen.getByRole('button', { name: new RegExp(labels['service.sameAsLast']) });
      fireEvent.click(same);
      expect(onPickFor).toHaveBeenCalledWith(0, KIDS_WASH);

      const other = screen.getByRole('button', { name: labels['service.chooseOther'] });
      expect(other).toHaveAttribute('aria-expanded', 'false');
      fireEvent.click(other);
      expect(other).toHaveAttribute('aria-expanded', 'true');
      const list = screen.getByRole('list', {
        name: fill(labels['service.party.listLabel'], { label: 'Theo · 7 år' }),
      });
      expect(within(list).getByRole('button', { name: /Barneklipp/ })).toBeInTheDocument();
    });
  });

  describe('«same as last time»', () => {
    it('offers a party of one their last service first, and keeps the whole catalogue below', () => {
      const { onPick } = renderService({
        services: [KIDS_CUT, KIDS_WASH, ADULT_CUT],
        suggestion: { service: KIDS_WASH },
        chosenId: KIDS_WASH.id,
      });
      const same = screen.getByRole('button', { name: new RegExp(labels['service.sameAsLast']) });
      expect(same).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText(labels['service.chooseOther'])).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Voksenklipp/ })).toBeInTheDocument();
      fireEvent.click(same);
      expect(onPick).toHaveBeenCalledWith(KIDS_WASH);
    });

    it('says why, in one line, when the suggestion was swapped', () => {
      renderService({
        suggestion: { service: KIDS_CUT, note: 'Sist: Småbarnsklipp – nå er det Barneklipp.' },
      });
      expect(screen.getByText('Sist: Småbarnsklipp – nå er det Barneklipp.')).toBeInTheDocument();
    });
  });
});

describe('ServiceScreen and fit', () => {
  const fitsNine = (service: BookingServiceDto) =>
    service.ageMaxYears === undefined || service.ageMaxYears >= 9;

  it('keeps an unlikely service for one person below the divider, and pickable', () => {
    const { onPick } = renderService({
      services: [KIDS_CUT, TODDLER_CUT],
      serviceFits: (service) => fitsNine(service),
      childName: 'Theo',
    });
    const below = screen.getByRole('list', {
      name: fill(labels['service.ageDivider.named'], { name: 'Theo' }),
    });
    expect(within(below).queryByRole('button', { name: /Barneklipp/ })).toBeNull();
    fireEvent.click(within(below).getByRole('button', { name: /Småbarnsklipp/ }));
    expect(onPick).toHaveBeenCalledWith(TODDLER_CUT);
  });

  it('names the divider through `possessive`, or without a name', () => {
    const { unmount } = renderService({
      labels: { ...labels, 'service.ageDivider.named': 'Ikke for {nameGenitive} alder' },
      services: [KIDS_CUT, TODDLER_CUT],
      serviceFits: fitsNine,
      childName: 'Jonas',
      possessive: (name) => (/[sxz]$/i.test(name) ? `${name}'` : `${name}s`),
    });
    expect(screen.getByText("Ikke for Jonas' alder")).toBeInTheDocument();
    unmount();
    renderService({ services: [KIDS_CUT, TODDLER_CUT], serviceFits: fitsNine });
    expect(screen.getByText(labels['service.ageDivider.unnamed'])).toBeInTheDocument();
  });

  it('draws no divider when everything fits', () => {
    renderService({ services: [KIDS_CUT, TODDLER_CUT] });
    expect(screen.queryByText(labels['service.ageDivider.unnamed'])).toBeNull();
  });

  it('never moves a phone-only card below the divider', () => {
    renderService({ services: [KIDS_CUT, PIERCING], serviceFits: () => false, childName: 'Theo' });
    const below = screen.getByRole('list', {
      name: fill(labels['service.ageDivider.named'], { name: 'Theo' }),
    });
    expect(within(below).queryByText('Hull i ørene')).toBeNull();
    expect(within(below).getByRole('button', { name: /Barneklipp/ })).toBeInTheDocument();
  });

  it('does the same per person in a family', () => {
    const onPickFor = vi.fn();
    renderService({
      services: [KIDS_CUT, TODDLER_CUT],
      serviceFits: (service, index) => (index === 0 ? fitsNine(service) : true),
      party: {
        people: [
          { key: 'p:theo', label: 'Theo · 9 år', name: 'Theo', adult: false },
          { key: 'p:mia', label: 'Mia · 4 år', name: 'Mia', adult: false },
        ],
        choices: [null, null],
        onPickFor,
      },
    });
    const below = screen.getByRole('list', {
      name: fill(labels['service.ageDivider.named'], { name: 'Theo' }),
    });
    fireEvent.click(within(below).getByRole('button', { name: /Småbarnsklipp/ }));
    expect(onPickFor).toHaveBeenCalledWith(0, TODDLER_CUT);
    expect(
      screen.queryByText(fill(labels['service.ageDivider.named'], { name: 'Mia' }))
    ).toBeNull();
    expect(
      within(
        screen.getByRole('list', {
          name: fill(labels['service.party.listLabel'], { label: 'Mia · 4 år' }),
        })
      ).getByRole('button', { name: /Småbarnsklipp/ })
    ).toBeInTheDocument();
  });
});

describe('ServiceScreen — overrides and a11y', () => {
  it('takes a label override, slot classes and a ServiceCard renderer', () => {
    function MyCard(props: ServiceCardProps) {
      return (
        <div data-testid={`my-${props.kind}`}>
          <DefaultServiceCard {...props} />
        </div>
      );
    }
    renderService({
      labels: { ...labels, 'service.heading': 'Velg behandling' },
      services: [KIDS_CUT, ADULT_CUT, PIERCING],
      classNames: {
        root: 'custom-root',
        card: 'custom-card',
        pill: 'custom-pill',
        pillSelected: 'custom-pill-on',
        groupHeading: 'custom-h3',
      },
      components: { ServiceCard: MyCard },
    });
    expect(screen.getByRole('heading', { level: 2, name: 'Velg behandling' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Velg behandling' })).toHaveClass('custom-root');
    expect(screen.getAllByTestId('my-book')).toHaveLength(2);
    expect(screen.getByTestId('my-phone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Barneklipp/ })).toHaveClass('custom-card');
    expect(screen.getByRole('button', { name: 'Barn' })).toHaveClass(
      'custom-pill',
      'custom-pill-on'
    );
    expect(screen.getByRole('button', { name: 'Voksne' })).not.toHaveClass('custom-pill-on');
    expect(screen.getByRole('heading', { level: 3, name: 'Barn' })).toHaveClass('custom-h3');
  });

  it('has no axe violations, alone or as a family', async () => {
    const { container, unmount } = renderService({
      services: [KIDS_CUT, ADULT_CUT, PIERCING, TODDLER_CUT],
      phone: '22 00 00 00',
      serviceFits: (service) => service.ageMaxYears === undefined,
      suggestion: { service: KIDS_CUT },
    });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
    unmount();
    const family = renderService({
      services: [KIDS_CUT, ADULT_CUT],
      party: {
        people: [
          { key: 'a', label: 'Theo', adult: false },
          { key: 'b', label: 'Meg selv', adult: true },
        ],
        choices: [null, null],
        onPickFor: vi.fn(),
        onRemove: vi.fn(),
      },
    });
    expect(
      await axe(family.container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});

describe('ServiceScreen — price slot', () => {
  it('merges classNames.price onto every card price, and changes nothing without it', () => {
    const price = demoFormatNb.price(KIDS_CUT.priceOre);
    const { unmount } = renderService();
    expect(screen.getByText(price, { normalizer: (text) => text }).className).toBe(
      'whitespace-nowrap font-semibold text-foreground tabular-nums'
    );
    unmount();

    renderService({ classNames: { price: 'text-primary' } });
    const node = screen.getByText(price, { normalizer: (text) => text });
    expect(node).toHaveClass('text-primary', 'font-semibold');
    expect(node).not.toHaveClass('text-foreground');
  });

  it('reaches the «same as last time» card too', () => {
    renderService({
      services: [KIDS_CUT, KIDS_WASH],
      suggestion: { service: KIDS_WASH },
      classNames: { price: 'text-primary' },
    });
    const sameAsLast = screen.getByText(labels['service.sameAsLast']).closest('button');
    const price = sameAsLast?.querySelector('.tabular-nums.font-semibold');
    expect(price).toHaveClass('text-primary');
  });

  it('renders the duration in the form its label is written', () => {
    const minutes = String(KIDS_CUT.durationMinutes);
    const { unmount } = renderService();
    const text = (labels['service.duration'] as string).replace('{minutes}', minutes);
    for (const node of screen.getAllByText(text)) {
      expect(Array.from(node.childNodes).map((child) => child.textContent)).toEqual([text]);
    }
    unmount();
    renderService({ labels: { ...labels, 'service.duration': ['{minutes}', ' min'] } });
    for (const node of screen.getAllByText(`${minutes} min`)) {
      expect(Array.from(node.childNodes).map((child) => child.textContent)).toEqual([
        minutes,
        ' min',
      ]);
    }
  });
});

describe('ServiceScreen — multi-select (`selection`)', () => {
  function selection(overrides: Partial<ServiceSelection> = {}): ServiceSelection {
    return {
      lists: [[]],
      onToggle: vi.fn(),
      onContinue: vi.fn(),
      total: null,
      canContinue: false,
      ...overrides,
    };
  }

  it('ticks a service for the one person instead of booking it', () => {
    const sel = selection();
    const { onPick } = renderService({ services: [KIDS_CUT, KIDS_WASH], selection: sel });
    const box = screen.getByRole('checkbox', { name: /Klipp og vask/ });
    expect(box).not.toBeChecked();
    fireEvent.click(box);
    expect(sel.onToggle).toHaveBeenCalledWith(0, KIDS_WASH);
    expect(onPick).not.toHaveBeenCalled();
    expect(sel.onContinue).not.toHaveBeenCalled();
  });

  it('marks what the person has ticked, from `lists`', () => {
    renderService({
      services: [KIDS_CUT, KIDS_WASH],
      selection: selection({ lists: [[{ id: 'svc-kids-wash' }]] }),
    });
    expect(screen.getByRole('checkbox', { name: /Klipp og vask/ })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /Barneklipp/ })).not.toBeChecked();
  });

  it('toggles from the keyboard with Enter as well as Space', () => {
    const sel = selection();
    renderService({ services: [KIDS_CUT], selection: sel });
    fireEvent.keyDown(screen.getByRole('checkbox', { name: /Barneklipp/ }), { key: 'Enter' });
    expect(sel.onToggle).toHaveBeenCalledWith(0, KIDS_CUT);
  });

  it('keeps a phone-only service as it was: no checkbox', () => {
    renderService({ services: [KIDS_CUT, PIERCING], selection: selection() });
    expect(screen.getByText('Hull i ørene')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  });

  it('says more than one is fine, under the heading', () => {
    renderService({ selection: selection() });
    expect(screen.getByText(labels['service.multiHint'] as string)).toBeInTheDocument();
  });

  it('shows the running total and «Next», which continues', () => {
    const sel = selection({
      lists: [[{ id: 'svc-kids' }]],
      total: { minutes: 45, priceOre: 96_000 },
      canContinue: true,
    });
    renderService({ selection: sel });
    expect(screen.getByText('45 min · 960 kr')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: labels['service.continue'] as string }));
    expect(sel.onContinue).toHaveBeenCalledTimes(1);
  });

  it('says what is missing instead of a total, and «Next» stays enabled', () => {
    const sel = selection({ total: { minutes: 30, priceOre: 49_000 }, canContinue: false });
    renderService({ selection: sel });
    expect(screen.getByText(labels['service.chooseFirst'] as string)).toBeInTheDocument();
    expect(screen.queryByText(/30 min · /)).toBeNull();
    const next = screen.getByRole('button', { name: labels['service.continue'] as string });
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(sel.onContinue).toHaveBeenCalledTimes(1);
  });

  it('announces a refusal politely', async () => {
    renderService({ selection: selection({ notice: 'Maks tre tjenester per person.' }) });
    expect(await screen.findByRole('status')).toHaveTextContent('Maks tre tjenester per person.');
  });

  it('keeps «same as last time» one tap through onPick, marked when ticked', () => {
    const sel = selection({ lists: [[{ id: 'svc-kids' }]] });
    const { onPick } = renderService({
      services: [KIDS_CUT, KIDS_WASH],
      suggestion: { service: KIDS_CUT },
      selection: sel,
    });
    const same = screen.getByRole('button', { name: /Samme som sist/ });
    expect(same).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(same);
    expect(onPick).toHaveBeenCalledWith(KIDS_CUT);
    expect(sel.onToggle).not.toHaveBeenCalled();
  });

  describe('for a family', () => {
    const PEOPLE = [
      { key: 'p:theo', label: 'Theo · 7 år', adult: false },
      { key: 'p:emma', label: 'Emma · 5 år', adult: false },
      { key: 'self', label: 'Meg selv', adult: true },
    ];
    const party = { people: PEOPLE, choices: [null, null, null], onPickFor: vi.fn() };

    it('gives each person a tab, the first open, with a tick on whoever has something', () => {
      renderService({
        services: [KIDS_CUT, KIDS_WASH, ADULT_CUT],
        party,
        selection: selection({ lists: [[], [{ id: 'svc-kids' }], []] }),
      });
      const tabs = screen.getAllByRole('tab');
      expect(tabs.map((tab) => tab.textContent)).toEqual([
        'Theo · 7 år',
        'Emma · 5 år',
        'Meg selv',
      ]);
      expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
      expect(tabs[1]?.querySelector('svg')).not.toBeNull();
      expect(tabs[0]?.querySelector('svg')).toBeNull();
      expect(screen.getByRole('tabpanel')).toHaveAccessibleName('Theo · 7 år');
    });

    it('ticks for the person whose tab is open', () => {
      const sel = selection({ lists: [[], [], []] });
      renderService({ services: [KIDS_CUT, KIDS_WASH, ADULT_CUT], party, selection: sel });
      fireEvent.click(screen.getByRole('tab', { name: 'Emma · 5 år' }));
      expect(screen.getByRole('tab', { name: 'Emma · 5 år' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      fireEvent.click(screen.getByRole('checkbox', { name: /Klipp og vask/ }));
      expect(sel.onToggle).toHaveBeenCalledWith(1, KIDS_WASH);
      expect(party.onPickFor).not.toHaveBeenCalled();
    });

    it('moves between tabs with the arrow keys', () => {
      renderService({ services: [KIDS_CUT], party, selection: selection({ lists: [[], [], []] }) });
      fireEvent.keyDown(screen.getByRole('tab', { name: 'Theo · 7 år' }), { key: 'ArrowLeft' });
      const self = screen.getByRole('tab', { name: 'Meg selv' });
      expect(self).toHaveAttribute('aria-selected', 'true');
      expect(self).toHaveFocus();
    });

    it('lets a grown-up ride along with the children, and never says «book them alone»', () => {
      renderService({
        services: [KIDS_CUT, ADULT_CUT],
        party,
        selection: selection({ lists: [[], [], []] }),
      });
      fireEvent.click(screen.getByRole('tab', { name: 'Meg selv' }));
      expect(screen.getByRole('checkbox', { name: /Voksenklipp/ })).toBeInTheDocument();
      expect(
        screen.queryByText(fill(labels['service.party.adultAlone'], { label: 'Meg selv' }))
      ).toBeNull();
    });

    it('marks every ticked service from that person’s list', () => {
      renderService({
        services: [KIDS_CUT, KIDS_WASH],
        party,
        selection: selection({ lists: [[{ id: 'svc-kids' }, { id: 'svc-kids-wash' }], [], []] }),
      });
      expect(
        screen.getAllByRole('checkbox').map((box) => (box as HTMLInputElement).checked)
      ).toEqual([true, true]);
    });

    it('has no axe violations', async () => {
      const { container } = renderService({
        services: [KIDS_CUT, KIDS_WASH, ADULT_CUT],
        party,
        selection: selection({
          lists: [[{ id: 'svc-kids' }], [], []],
          total: { minutes: 30, priceOre: 49_000 },
        }),
      });
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
