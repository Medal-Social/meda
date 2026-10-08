import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import { whoScreenLabelsNb as labels } from '../../../src/booking/__stories__/labels.steps.js';
import type { SaveResult, WizardPerson } from '../../../src/booking/types.js';
import {
  DefaultPersonCard,
  type PersonCardProps,
  type WhoPersonEntry,
  WhoScreen,
  type WhoScreenProps,
} from '../../../src/booking/who-screen.js';

/**
 * The first step on its own: the two shapes (chips for a guest, cards for a
 * known parent), what a tap says to the machine, and the fixed sizes that keep
 * a login or a new child from moving anything sideways.
 */

const guest = (n: number): WizardPerson => ({ key: `guest:${n}` });
const GUEST_CHOICES: WhoScreenProps['guestChoices'] = [
  { key: 'one', people: [guest(1)] },
  { key: 'two', people: [guest(1), guest(2)] },
  { key: 'three', people: [guest(1), guest(2), guest(3)] },
  { key: 'adult', people: [{ key: 'adult', adult: true }] },
];
const CHIPS = ['1 barn', '2 barn', '3 barn', 'Voksen'];
const SELF = 'self';
const isGuestSeat = (person: WizardPerson) =>
  person.key.startsWith('guest:') || person.key.startsWith('new:') || person.key === 'adult';

function child(name: string, id: string | null, index: number, line = ''): WhoPersonEntry {
  return {
    person: {
      key: id ? `p:${id}` : `n:${index}:${name}`,
      name,
      birthYear: 2019,
      ...(id ? { personId: id } : {}),
    },
    line,
  };
}

const LIMIT = labels['who.family.limit'].replace('{max}', '3');
const LEGEND = labels['who.family.legend'].replace('{max}', '3');

function renderWho(props: Partial<WhoScreenProps> = {}) {
  const onChoose = vi.fn();
  const view = render(
    <WhoScreen
      labels={labels}
      format={demoFormatNb}
      people={[]}
      family={null}
      guestChoices={GUEST_CHOICES}
      maxPeople={3}
      selfKey={SELF}
      isGuestSeat={isGuestSeat}
      onChoose={onChoose}
      onAddChild={vi.fn(async (): Promise<SaveResult> => ({ ok: true }))}
      currentYear={2026}
      {...props}
    />
  );
  return { ...view, onChoose: (props.onChoose as typeof onChoose | undefined) ?? onChoose };
}

describe('WhoScreen — a guest', () => {
  it('asks the question as the section heading', () => {
    renderWho();
    expect(screen.getByRole('region', { name: labels['who.heading'] })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: labels['who.heading'] })).toHaveAttribute(
      'tabindex',
      '-1'
    );
  });

  it('gives a guest a chip per choice, each the whole answer', () => {
    const { onChoose } = renderWho();

    fireEvent.click(screen.getByRole('radio', { name: '2 barn' }));
    expect(onChoose).toHaveBeenCalledWith([{ key: 'guest:1' }, { key: 'guest:2' }], true);

    fireEvent.click(screen.getByRole('radio', { name: 'Voksen' }));
    expect(onChoose).toHaveBeenLastCalledWith([{ key: 'adult', adult: true }], true);
    // Every chip the same height, so the row does not reflow as one is pressed.
    for (const chip of CHIPS) {
      expect(screen.getByRole('radio', { name: chip })).toHaveClass('h-12');
    }
  });

  it('shows the pressed chip for the party already chosen', () => {
    renderWho({ people: [guest(1), guest(2), guest(3)] });

    expect(
      screen.getByRole('radiogroup', { name: labels['who.guest.groupLabel'] })
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: '3 barn' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: '1 barn' })).toHaveAttribute('aria-checked', 'false');
    // Roving focus: the chosen chip is the group's one tab stop.
    expect(screen.getByRole('radio', { name: '3 barn' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('radio', { name: '1 barn' })).toHaveAttribute('tabindex', '-1');
  });

  it('puts the tab stop on the first chip when nothing is chosen', () => {
    renderWho();
    expect(screen.getAllByRole('radio').map((chip) => chip.getAttribute('tabindex'))).toEqual([
      '0',
      '-1',
      '-1',
      '-1',
    ]);
  });

  it('moves focus between the chips with the arrows, without choosing', () => {
    const { onChoose } = renderWho();
    const [one, two, three, adult] = CHIPS.map((name) => screen.getByRole('radio', { name }));

    one?.focus();
    fireEvent.keyDown(one as HTMLElement, { key: 'ArrowRight' });
    expect(two).toHaveFocus();
    fireEvent.keyDown(two as HTMLElement, { key: 'ArrowLeft' });
    fireEvent.keyDown(one as HTMLElement, { key: 'ArrowLeft' });
    expect(adult).toHaveFocus();
    fireEvent.keyDown(adult as HTMLElement, { key: 'ArrowDown' });
    expect(one).toHaveFocus();
    fireEvent.keyDown(one as HTMLElement, { key: 'ArrowUp' });
    expect(adult).toHaveFocus();
    fireEvent.keyDown(adult as HTMLElement, { key: 'Home' });
    expect(one).toHaveFocus();
    fireEvent.keyDown(one as HTMLElement, { key: 'End' });
    expect(adult).toHaveFocus();
    fireEvent.keyDown(adult as HTMLElement, { key: 'a' });
    expect(adult).toHaveFocus();
    expect(three).not.toHaveFocus();
    expect(onChoose).not.toHaveBeenCalled();
  });

  it('shows the login row and the children a guest named, and unticks one', () => {
    const mia: WizardPerson = { key: 'new:1', name: 'Mia', birthYear: 2022 };
    const { onChoose } = renderWho({
      people: [mia, guest(2)],
      addedChildren: [{ person: mia, line: '4 år' }],
      loginRow: <p>Har du konto?</p>,
    });
    expect(screen.getByText('Har du konto?')).toBeInTheDocument();
    const list = screen.getByRole('list', { name: labels['who.guest.addedList'] });
    const card = within(list).getByRole('checkbox', { name: /Mia/ });
    expect(card).toBeChecked();
    expect(within(list).getByText('4 år')).toBeInTheDocument();
    fireEvent.click(card);
    expect(onChoose).toHaveBeenCalledWith([guest(2)], false);
  });

  it('stops a guest adding more named children than one booking seats', () => {
    const added = [1, 2, 3].map((n) => ({
      person: { key: `new:${n}`, name: `Barn ${n}` },
      line: '',
    }));
    renderWho({ people: added.map((entry) => entry.person), addedChildren: added });
    expect(screen.getByRole('button', { name: labels['addChild.trigger'] })).toBeDisabled();
  });

  it('adds a child from the sheet with what was typed', async () => {
    const onAddChild = vi.fn(async (): Promise<SaveResult> => ({ ok: true }));
    renderWho({ onAddChild });

    fireEvent.click(screen.getByRole('button', { name: labels['addChild.trigger'] }));
    const dialog = screen.getByRole('dialog');
    // A guest's child lives in this booking only: no note field.
    expect(within(dialog).queryByLabelText(labels['addChild.notes'])).toBeNull();
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.name']), {
      target: { value: 'Theo' },
    });
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.birthYear']), {
      target: { value: '2019' },
    });
    fireEvent.change(within(dialog).getByLabelText(labels['addChild.birthMonth']), {
      target: { value: '3' },
    });
    fireEvent.click(within(dialog).getByRole('button', { name: labels['addChild.submit'] }));

    await waitFor(() =>
      expect(onAddChild).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Theo', birthYear: 2019, birthMonth: 3 })
      )
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });
});

describe('WhoScreen — a known parent', () => {
  it('ticks and unticks the children without moving on', () => {
    const theo = child('Theo', 'p-theo', 0, '6–7 år');
    const onChoose = vi.fn();
    const { rerender } = renderWho({ family: [theo], onChoose });

    const card = screen.getByRole('checkbox', { name: /Theo/ });
    // One fixed height for every card, whatever line it carries.
    expect(card.closest('label')).toHaveClass('h-[4.5rem]');
    expect(screen.getByText('6–7 år')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: LEGEND })).toContainElement(card);
    // No chips for a parent.
    expect(screen.queryByRole('radiogroup')).toBeNull();
    fireEvent.click(card);
    expect(onChoose).toHaveBeenCalledWith([theo.person], false);

    rerender(
      <WhoScreen
        labels={labels}
        format={demoFormatNb}
        people={[theo.person]}
        family={[theo]}
        guestChoices={GUEST_CHOICES}
        maxPeople={3}
        selfKey={SELF}
        isGuestSeat={isGuestSeat}
        onChoose={onChoose}
        onAddChild={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: /Theo/ }));
    expect(onChoose).toHaveBeenLastCalledWith([], false);
  });

  it('seats «myself» as an adult under the self key', () => {
    const { onChoose } = renderWho({ family: [] });
    fireEvent.click(screen.getByRole('checkbox', { name: labels['who.family.self'] }));
    expect(onChoose).toHaveBeenCalledWith([{ key: SELF, adult: true }], false);
  });

  it('offers the note field in the sheet for a parent', () => {
    renderWho({ family: [] });
    fireEvent.click(screen.getByRole('button', { name: labels['addChild.trigger'] }));
    expect(
      within(screen.getByRole('dialog')).getByLabelText(labels['addChild.notes'])
    ).toBeInTheDocument();
  });

  describe('at the limit of three', () => {
    const FAMILY = [
      child('Theo', 'p-theo', 0),
      child('Emma', 'p-emma', 1),
      child('Ella', 'p-ella', 2),
      child('Nora', 'p-nora', 3),
    ];
    const THREE = FAMILY.slice(0, 3).map((entry) => entry.person);

    it('keeps the fourth card focusable but inert, and says why', () => {
      const { onChoose } = renderWho({ people: THREE, family: FAMILY });

      const nora = screen.getByRole('checkbox', { name: /Nora/ });
      expect(nora).toHaveAttribute('aria-disabled', 'true');
      expect(nora).not.toBeDisabled();
      expect(nora).toHaveAccessibleDescription(LIMIT);
      expect(screen.getByRole('checkbox', { name: labels['who.family.self'] })).toHaveAttribute(
        'aria-disabled',
        'true'
      );
      fireEvent.click(nora);
      expect(onChoose).not.toHaveBeenCalled();

      // Announced in a region that is always mounted.
      expect(screen.getByText(LIMIT)).toHaveAttribute('aria-live', 'polite');
      // No fourth child from the sheet either.
      expect(screen.getByRole('button', { name: labels['addChild.trigger'] })).toBeDisabled();

      // A ticked card still unticks.
      fireEvent.click(screen.getByRole('checkbox', { name: /Theo/ }));
      expect(onChoose).toHaveBeenCalledWith(THREE.slice(1), false);
    });

    it('counts only the seats it draws — a stray guest seat is neither counted nor kept', () => {
      const { onChoose } = renderWho({
        people: [guest(1), guest(2), THREE[0] as WizardPerson],
        family: FAMILY,
      });

      expect(screen.queryByText(LIMIT)).toBeNull();
      fireEvent.click(screen.getByRole('checkbox', { name: /Emma/ }));
      expect(onChoose).toHaveBeenCalledWith([THREE[0], THREE[1]], false);
    });
  });

  it('seats two children with the same name and year and no ids as two people', () => {
    const twins = [child('Emma', null, 0), child('Emma', null, 1)];
    const onChoose = vi.fn();
    const { rerender } = renderWho({ family: twins, onChoose });

    const [first] = screen.getAllByRole('checkbox', { name: /Emma/ });
    fireEvent.click(first as HTMLElement);
    const seated = onChoose.mock.calls[0]?.[0] as WizardPerson[];
    expect(seated).toHaveLength(1);
    rerender(
      <WhoScreen
        labels={labels}
        format={demoFormatNb}
        people={seated}
        family={twins}
        guestChoices={GUEST_CHOICES}
        maxPeople={3}
        selfKey={SELF}
        isGuestSeat={isGuestSeat}
        onChoose={onChoose}
        onAddChild={vi.fn()}
      />
    );

    // Ticking one ticks one: the other Emma is still her own card.
    const [firstAgain, secondAgain] = screen.getAllByRole('checkbox', { name: /Emma/ });
    expect(firstAgain).toBeChecked();
    expect(secondAgain).not.toBeChecked();
    fireEvent.click(secondAgain as HTMLElement);
    const both = onChoose.mock.calls[1]?.[0] as WizardPerson[];
    expect(both).toHaveLength(2);
    expect(new Set(both.map((person) => person.key)).size).toBe(2);
  });
});

describe('WhoScreen — overrides', () => {
  it('takes a label override, slot classes and a PersonCard renderer', () => {
    function MyCard(props: PersonCardProps) {
      return (
        <div data-testid="my-card">
          <DefaultPersonCard {...props} line={`${props.line} ✓`} />
        </div>
      );
    }
    renderWho({
      labels: { ...labels, 'who.heading': 'Hvem kommer?' },
      family: [child('Theo', 'p-theo', 0, '7 år')],
      people: [{ key: 'p:p-theo', name: 'Theo', birthYear: 2019, personId: 'p-theo' }],
      classNames: { root: 'custom-root', card: 'custom-card', cardSelected: 'custom-selected' },
      components: { PersonCard: MyCard },
    });
    expect(screen.getByRole('heading', { name: 'Hvem kommer?' })).toBeInTheDocument();
    expect(screen.getByRole('region')).toHaveClass('custom-root');
    expect(screen.getByTestId('my-card')).toHaveTextContent('7 år ✓');
    const label = screen.getByRole('checkbox', { name: /Theo/ }).closest('label');
    expect(label).toHaveClass('custom-card', 'custom-selected');
  });

  it('marks the chosen chip with the chip slots', () => {
    renderWho({
      people: [guest(1)],
      classNames: { chip: 'custom-chip', chipSelected: 'custom-chip-on' },
    });
    expect(screen.getByRole('radio', { name: '1 barn' })).toHaveClass(
      'custom-chip',
      'custom-chip-on'
    );
    expect(screen.getByRole('radio', { name: '2 barn' })).toHaveClass('custom-chip');
    expect(screen.getByRole('radio', { name: '2 barn' })).not.toHaveClass('custom-chip-on');
  });

  it('uses a chip’s own label when it has one', () => {
    renderWho({ guestChoices: [{ key: 'x', label: 'Hele familien', people: [guest(1)] }] });
    expect(screen.getByRole('radio', { name: 'Hele familien' })).toBeInTheDocument();
  });
});

describe('WhoScreen — a11y', () => {
  it('has no axe violations for a guest or a parent', async () => {
    const { container, unmount } = renderWho();
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
    unmount();
    const family = renderWho({ family: [child('Theo', 'p-theo', 0, '7 år')] });
    expect(
      await axe(family.container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});

describe('WhoScreen — text nodes', () => {
  const nodes = (element: Element) =>
    Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent);
  const theo = () => child('Theo', 'p-theo', 0, '6–7 år');

  it('renders a string legend as ONE text node', () => {
    renderWho({ family: [theo()] });
    expect(nodes(screen.getByText(LEGEND))).toEqual([LEGEND]);
  });

  it('renders an array legend one text node per element', () => {
    renderWho({
      family: [theo()],
      labels: { ...labels, 'who.family.legend': ['Velg opptil ', '{max}'] },
    });
    expect(nodes(screen.getByText('Velg opptil 3'))).toEqual(['Velg opptil ', '3']);
  });
});

describe('WhoScreen — a guest party (children and me)', () => {
  const ADULT: WizardPerson = { key: 'adult', adult: true };
  const guestParty = { child: guest, adult: ADULT };
  const more = () => screen.getByRole('button', { name: labels['who.party.more'] as string });
  const fewer = () => screen.getByRole('button', { name: labels['who.party.fewer'] as string });
  const meToo = () => screen.getByRole('checkbox', { name: /Jeg skal også klippes/ });

  it('starts at one child, so «next» is live from the first frame', () => {
    const { onChoose } = renderWho({ guestParty });
    expect(onChoose).toHaveBeenCalledWith([guest(1)], false);
    // No chips in this mode.
    expect(screen.queryByRole('radio', { name: '2 barn' })).toBeNull();
  });

  it('keeps a restored answer instead of resetting it', () => {
    const { onChoose } = renderWho({ guestParty, people: [guest(1), guest(2)] });
    expect(onChoose).not.toHaveBeenCalled();
    expect(screen.getByText('2 barn', { selector: '.sr-only' })).toBeInTheDocument();
  });

  it('adds and removes children, live, never down to nobody', () => {
    const { onChoose } = renderWho({ guestParty, people: [guest(1)] });
    expect(fewer()).toBeDisabled();
    fireEvent.click(more());
    expect(onChoose).toHaveBeenLastCalledWith([guest(1), guest(2)], false);
  });

  it('books the grown-up beside the children', () => {
    const { onChoose } = renderWho({ guestParty, people: [guest(1)] });
    fireEvent.click(meToo());
    expect(onChoose).toHaveBeenLastCalledWith([guest(1), ADULT], false);
  });

  it('lets the grown-up come alone once they are in, but not leave nobody', () => {
    const { onChoose } = renderWho({ guestParty, people: [guest(1), ADULT] });
    expect(fewer()).toBeEnabled();
    fireEvent.click(fewer());
    expect(onChoose).toHaveBeenLastCalledWith([ADULT], false);

    renderWho({ guestParty, people: [ADULT] });
    expect(
      screen.getAllByRole('checkbox', { name: /Jeg skal også klippes/ }).at(-1)
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('stops at the limit, and says why', () => {
    renderWho({ guestParty, people: [guest(1), guest(2), ADULT] });
    expect(more()).toBeDisabled();
    expect(screen.getByText(LIMIT)).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = renderWho({ guestParty, people: [guest(1)] });
    expect(await axe(container)).toHaveNoViolations();
  });
});
