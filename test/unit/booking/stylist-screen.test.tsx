import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import { stylistScreenLabelsNb as labels } from '../../../src/booking/__stories__/labels.steps.js';
import {
  DefaultStylistCard,
  type StylistCardProps,
  StylistScreen,
  type StylistScreenProps,
} from '../../../src/booking/stylist-screen.js';
import type { BookingResourceDto } from '../../../src/booking/types.js';

const ADA: BookingResourceDto = {
  id: 'res-ada',
  name: 'Ada Demo',
  photoUrl: null,
  bio: 'Barneklipp og krøller',
  serviceIds: ['svc-kids', 'svc-kids-wash'],
  sortOrder: 1,
};
/** Cleo does not do the children's cut. */
const CLEO: BookingResourceDto = {
  id: 'res-cleo',
  name: 'Cleo Prøve',
  photoUrl: null,
  bio: 'Farge og styling',
  serviceIds: ['svc-colour'],
  sortOrder: 2,
};
const BO: BookingResourceDto = {
  ...ADA,
  id: 'res-bo',
  name: 'Bo Eksempel (Demo)',
  sortOrder: 2,
};

const FIRST = labels['stylist.firstAvailable'];
/** Thursday 3 Sep 2026, 09:00 in Oslo; an opening at 15:00 the same day. */
const NOW = Date.UTC(2026, 8, 3, 7);
const AT_THREE = Date.UTC(2026, 8, 3, 13);

function renderStylist(props: Partial<StylistScreenProps> = {}) {
  const onPick = vi.fn();
  const view = render(
    <StylistScreen
      labels={labels}
      format={demoFormatNb}
      now={NOW}
      serviceIds={['svc-kids']}
      resources={[ADA, BO]}
      onPick={onPick}
      {...props}
    />
  );
  return { ...view, onPick: (props.onPick as typeof onPick | undefined) ?? onPick };
}

describe('StylistScreen', () => {
  it('asks the question as its heading, and names the group by it', () => {
    renderStylist();
    expect(
      screen.getByRole('heading', { level: 2, name: labels['stylist.heading'] })
    ).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: labels['stylist.heading'] })).toBeInTheDocument();
  });

  it('does not offer a stylist who cannot perform the chosen service', () => {
    renderStylist({ resources: [ADA, CLEO] });
    expect(screen.getByText('Ada Demo')).toBeInTheDocument();
    expect(screen.queryByText('Cleo Prøve')).toBeNull();
  });

  it('drops a stylist who covers only part of the basket, and keeps «first available»', () => {
    renderStylist({ serviceIds: ['svc-kids', 'svc-colour'], resources: [ADA, CLEO] });
    expect(screen.queryByText('Ada Demo')).toBeNull();
    expect(screen.queryByText('Cleo Prøve')).toBeNull();
    expect(screen.getByRole('radio', { name: FIRST })).toBeInTheDocument();
  });

  it('pre-selects «first available» and puts it first', () => {
    renderStylist();
    const [first, ...rest] = screen.getAllByRole('radio');
    expect(first).toHaveAccessibleName(FIRST);
    expect(first).toHaveAttribute('aria-checked', 'true');
    for (const option of rest) expect(option).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText(labels['stylist.firstAvailableSubtitle'])).toBeInTheDocument();
  });

  it('orders the stylists by their sort order', () => {
    renderStylist({ resources: [{ ...BO, sortOrder: 0 }, ADA] });
    expect(screen.getAllByRole('radio').map((option) => option.textContent)).toEqual([
      expect.stringContaining(FIRST),
      expect.stringContaining('Bo Eksempel'),
      expect.stringContaining('Ada Demo'),
    ]);
  });

  it('reports the choice as the machine spells it — null is an answer', () => {
    const { onPick } = renderStylist({ resources: [ADA], selectedResourceId: 'res-ada' });
    expect(screen.getByRole('radio', { name: /Ada Demo/ })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: FIRST })).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(screen.getByRole('radio', { name: FIRST }));
    expect(onPick).toHaveBeenCalledWith(null);
    fireEvent.click(screen.getByRole('radio', { name: /Ada Demo/ }));
    expect(onPick).toHaveBeenLastCalledWith('res-ada');
  });

  it('shows the next opening on the business clock, and says nothing when it has none', () => {
    renderStylist({
      resources: [ADA, { ...CLEO, serviceIds: ['svc-kids'] }],
      nextAvailableTs: { 'res-ada': AT_THREE },
    });
    expect(screen.getByRole('radio', { name: /Ada Demo/ })).toHaveAccessibleName(
      `Ada Demo ${labels['stylist.nextAvailable']} i dag 15:00`
    );
    expect(screen.getByRole('radio', { name: /Cleo Prøve/ })).not.toHaveAccessibleName(
      new RegExp(labels['stylist.nextAvailable'])
    );
  });

  it('falls back to initials for a stylist without a photo, and shows a photo when there is one', () => {
    const { unmount } = renderStylist({ resources: [ADA] });
    expect(screen.getByText('AD')).toBeInTheDocument();
    expect(screen.queryByRole('img')).toBeNull();
    unmount();
    const { container } = renderStylist({ resources: [{ ...ADA, photoUrl: '/ada.jpg' }] });
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/ada.jpg');
    expect(img).toHaveAttribute('alt', '');
    expect(screen.queryByText('AD')).toBeNull();
  });

  it('shows admin labels as names, with initials from letters only', () => {
    renderStylist({
      resources: [
        { ...ADA, id: 'res-sam', name: 'sam' },
        { ...ADA, id: 'res-bo', name: 'Bo (Demo)', sortOrder: 2 },
      ],
    });
    expect(screen.getByRole('radio', { name: 'Sam' })).toHaveAccessibleDescription(
      'Barneklipp og krøller'
    );
    expect(screen.getByRole('radio', { name: 'Bo' })).toBeInTheDocument();
    expect(screen.queryByText(/\(Demo\)/)).toBeNull();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(screen.queryByText('B(')).toBeNull();
  });

  it('holds card-height placeholders while the list is loading', () => {
    const { container } = renderStylist({ resources: [], loading: true });
    const skeletons = container.querySelectorAll('[data-testid="stylist-skeleton"]');
    expect(skeletons).toHaveLength(5);
    for (const skeleton of skeletons) expect(skeleton).toHaveClass('h-32', 'md:h-24');
    expect(screen.getByRole('radio', { name: FIRST })).toHaveClass('h-32', 'md:h-24');
    expect(screen.getByRole('status')).toHaveTextContent(labels['stylist.loading']);
  });

  it('holds as many placeholders as it was told to expect', () => {
    const { container } = renderStylist({ resources: [], loading: true, skeletonCount: 3 });
    expect(container.querySelectorAll('[data-testid="stylist-skeleton"]')).toHaveLength(3);
  });

  it('reserves the next-opening row on every card, filled or not', () => {
    const { container } = renderStylist({
      resources: [ADA, { ...CLEO, serviceIds: ['svc-kids'] }],
      nextAvailableTs: {},
      nextAvailableLoading: true,
    });
    const rows = container.querySelectorAll('[data-testid="next-available-row"]');
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toHaveClass('h-8', 'md:h-5');
      expect(row.querySelector('.animate-pulse')).not.toBeNull();
    }
    expect(screen.getByRole('radio', { name: /Ada Demo/ })).toHaveClass('h-32', 'md:h-24');
  });
});

describe('StylistScreen — a family', () => {
  const partyProps = { serviceIds: ['svc-kids', 'svc-kids-wash'], resources: [ADA, CLEO] };
  const twoChildren = {
    mode: 'sequential' as const,
    size: 2,
    minutes: { sequential: 60, parallel: 30 },
  };

  it('offers the two modes, with «one after the other» chosen', () => {
    renderStylist({ ...partyProps, party: { ...twoChildren, onMode: vi.fn() } });
    expect(screen.getByRole('group', { name: labels['stylist.party.legend'] })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: new RegExp(labels['stylist.party.sequential']) })
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', { name: new RegExp(labels['stylist.party.parallel.two']) })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('says how long each way actually takes', () => {
    renderStylist({ ...partyProps, party: { ...twoChildren, onMode: vi.fn() } });
    expect(
      screen.getByText(labels['stylist.party.sequentialMinutes'].replace('{minutes}', '60'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(labels['stylist.party.parallelMinutes'].replace('{minutes}', '30'))
    ).toBeInTheDocument();
  });

  it('reports the mode tapped', () => {
    const onMode = vi.fn();
    renderStylist({ ...partyProps, party: { ...twoChildren, onMode } });
    fireEvent.click(
      screen.getByRole('button', { name: new RegExp(labels['stylist.party.parallel.two']) })
    );
    expect(onMode).toHaveBeenCalledWith('parallel');
  });

  it('puts the stylist list away once the family asks for several stylists', () => {
    renderStylist({ ...partyProps, party: { ...twoChildren, mode: 'parallel', onMode: vi.fn() } });
    expect(screen.queryByRole('radio')).toBeNull();
    expect(screen.getByText(labels['stylist.party.parallelNote.two'])).toBeInTheDocument();
  });

  it('counts the people rather than assuming there are two', () => {
    const { unmount } = renderStylist({
      ...partyProps,
      party: { ...twoChildren, size: 3, mode: 'parallel', onMode: vi.fn() },
    });
    expect(
      screen.getByRole('button', { name: new RegExp(labels['stylist.party.parallel.three']) })
    ).toBeInTheDocument();
    expect(screen.getByText(labels['stylist.party.parallelNote.three'])).toBeInTheDocument();
    unmount();
    renderStylist({
      ...partyProps,
      party: { ...twoChildren, size: 4, mode: 'parallel', onMode: vi.fn() },
    });
    expect(
      screen.getByRole('button', { name: new RegExp(labels['stylist.party.parallel.other']) })
    ).toBeInTheDocument();
    expect(
      screen.getByText(labels['stylist.party.parallelNote.other'].replace('{count}', '4'))
    ).toBeInTheDocument();
  });

  it('asks nothing about modes for a single person', () => {
    renderStylist();
    expect(screen.queryByText(labels['stylist.party.legend'])).toBeNull();
    expect(screen.getByRole('radio', { name: FIRST })).toBeInTheDocument();
  });
});

/**
 * Under `md` the SAME radios are a fixed-height row of avatars that scrolls
 * sideways; from `md` they are cards. jsdom applies no media queries, so the
 * breakpoints are read off the classes both layouts are written in.
 */
describe('StylistScreen — compact on phones', () => {
  it('is one fixed-height, sideways-scrolling row with snap under md, a column from md', () => {
    renderStylist();
    const group = screen.getByRole('radiogroup', { name: labels['stylist.heading'] });
    expect(group).toHaveClass('flex', 'h-36', 'overflow-x-auto', 'snap-x', 'snap-mandatory');
    expect(group).toHaveClass('md:h-auto', 'md:flex-col', 'md:overflow-visible');
    for (const option of screen.getAllByRole('radio')) {
      expect(option).toHaveClass('w-24', 'shrink-0', 'snap-start', 'h-32');
      expect(option).toHaveClass('md:w-full', 'md:flex-row', 'md:h-24');
    }
  });

  it('shows a 56 px avatar and the first name on a phone, the full name from md', () => {
    renderStylist();
    const bo = screen.getByRole('radio', { name: 'Bo Eksempel' });
    const avatar = bo.querySelector('[data-testid="stylist-avatar"]');
    expect(avatar).toHaveClass('size-14', 'rounded-full', 'md:size-12');
    expect(screen.getByText('Bo')).toHaveClass('md:hidden');
    expect(screen.getByText('Bo Eksempel')).toHaveClass('hidden', 'md:block');
    expect(bo).toHaveAccessibleDescription('Barneklipp og krøller');
  });

  it('rings the selected avatar in the primary colour', () => {
    renderStylist({ selectedResourceId: 'res-bo' });
    const avatar = screen
      .getByRole('radio', { name: 'Bo Eksempel' })
      .querySelector('[data-testid="stylist-avatar"]');
    expect(avatar).toHaveClass('ring-2', 'ring-primary');
    const unselected = screen
      .getByRole('radio', { name: FIRST })
      .querySelector('[data-testid="stylist-avatar"]');
    expect(unselected).not.toHaveClass('ring-primary');
  });

  it('puts the next opening on one short line under the name', () => {
    renderStylist({ nextAvailableTs: { 'res-bo': AT_THREE } });
    const row = screen
      .getByRole('radio', { name: /Bo Eksempel/ })
      .querySelector('[data-testid="next-available-row"]');
    expect(row).toHaveTextContent(`${labels['stylist.nextAvailable']} i dag 15:00`);
    expect(row).toHaveClass('h-8', 'md:h-5');
    expect(screen.getAllByText(labels['stylist.nextAvailable'])[0]).toHaveClass(
      'sr-only',
      'md:not-sr-only'
    );
  });

  it('holds a skeleton row of the same height while the stylists load', () => {
    const { container } = renderStylist({ resources: [], loading: true, skeletonCount: 4 });
    const group = screen.getByRole('radiogroup');
    expect(group).toHaveClass('h-36');
    const skeletons = container.querySelectorAll('[data-testid="stylist-skeleton"]');
    expect(skeletons).toHaveLength(4);
    for (const skeleton of skeletons) {
      expect(skeleton).toHaveClass('w-24', 'h-32', 'md:h-24');
      expect(group).toContainElement(skeleton as HTMLElement);
    }
    expect(screen.getAllByRole('radio')).toHaveLength(1);
  });

  it('is one tab stop: the selected option', () => {
    renderStylist({ selectedResourceId: 'res-ada' });
    const [first, ada, bo] = screen.getAllByRole('radio');
    expect(first).toHaveAttribute('tabindex', '-1');
    expect(ada).toHaveAttribute('tabindex', '0');
    expect(bo).toHaveAttribute('tabindex', '-1');
  });

  it('falls back to the first option as the tab stop when the preference is not on the list', () => {
    renderStylist({ selectedResourceId: 'res-cleo' });
    expect(screen.getAllByRole('radio')[0]).toHaveAttribute('tabindex', '0');
  });

  it('moves and chooses with the arrow keys, wrapping at the ends', () => {
    const { onPick } = renderStylist();
    const [first, ada, bo] = screen.getAllByRole('radio') as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];
    first.focus();

    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(ada).toHaveFocus();
    expect(onPick).toHaveBeenLastCalledWith('res-ada');

    fireEvent.keyDown(ada, { key: 'ArrowDown' });
    expect(bo).toHaveFocus();
    expect(onPick).toHaveBeenLastCalledWith('res-bo');

    fireEvent.keyDown(bo, { key: 'ArrowRight' });
    expect(first).toHaveFocus();
    expect(onPick).toHaveBeenLastCalledWith(null);

    fireEvent.keyDown(first, { key: 'ArrowLeft' });
    expect(bo).toHaveFocus();
    expect(onPick).toHaveBeenLastCalledWith('res-bo');

    fireEvent.keyDown(bo, { key: 'ArrowUp' });
    expect(ada).toHaveFocus();

    fireEvent.keyDown(ada, { key: 'Home' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'End' });
    expect(bo).toHaveFocus();
  });

  it('ignores keys that are not navigation', () => {
    const { onPick } = renderStylist();
    const [first] = screen.getAllByRole('radio') as [HTMLElement];
    first.focus();
    fireEvent.keyDown(first, { key: 'a' });
    expect(first).toHaveFocus();
    expect(onPick).not.toHaveBeenCalled();
  });

  it('keeps «first available» whole on a phone tile', () => {
    renderStylist({ labels: { ...labels, 'stylist.firstAvailable': 'Hvem som helst' } });
    expect(screen.getAllByText('Hvem som helst')[0]).toHaveClass('md:hidden');
    expect(screen.queryByText('Hvem')).toBeNull();
  });

  it('holds a checked, tabbable stand-in for a named stylist restored before the list', () => {
    const { container } = renderStylist({
      resources: [],
      loading: true,
      selectedResourceId: 'res-bo',
      pendingName: 'Bo Eksempel',
    });
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-busy', 'true');
    const standIn = screen.getByRole('radio', { name: 'Bo Eksempel' });
    expect(standIn).toHaveAttribute('aria-checked', 'true');
    expect(standIn).toHaveAttribute('tabindex', '0');
    expect(standIn).toHaveClass('h-32', 'md:h-24');
    expect(screen.getByText('BE')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: FIRST })).toHaveAttribute('aria-checked', 'false');
    expect(container.querySelectorAll('[data-testid="stylist-skeleton"]')).toHaveLength(4);
  });

  it('names the stand-in with the pending label when nothing knows the name yet', () => {
    renderStylist({ resources: [], loading: true, selectedResourceId: 'res-bo' });
    expect(screen.getByRole('radio', { name: labels['stylist.pendingName'] })).toHaveAttribute(
      'aria-checked',
      'true'
    );
  });

  it('holds no stand-in for «first available», which needs no list', () => {
    const { container } = renderStylist({ resources: [], loading: true });
    expect(screen.getAllByRole('radio')).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="stylist-skeleton"]')).toHaveLength(5);
  });

  it('announces a notice politely once the list is here', async () => {
    renderStylist({ notice: 'Behandleren du valgte er ikke ledig.' });
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Behandleren du valgte er ikke ledig.'
    );
    expect(screen.getByRole('radiogroup')).toHaveAttribute('aria-busy', 'false');
  });

  it('chooses on tap', () => {
    const { onPick } = renderStylist();
    fireEvent.click(screen.getByRole('radio', { name: 'Bo Eksempel' }));
    expect(onPick).toHaveBeenCalledWith('res-bo');
  });
});

describe('StylistScreen — overrides and a11y', () => {
  it('takes a label override, slot classes and a StylistCard renderer', () => {
    function MyCard(props: StylistCardProps) {
      return (
        <div data-testid="my-card">
          <DefaultStylistCard {...props} />
        </div>
      );
    }
    renderStylist({
      labels: { ...labels, 'stylist.heading': 'Velg behandler' },
      selectedResourceId: 'res-ada',
      classNames: {
        root: 'custom-root',
        group: 'custom-group',
        card: 'custom-card',
        cardSelected: 'custom-card-on',
      },
      components: { StylistCard: MyCard },
    });
    expect(screen.getByRole('heading', { name: 'Velg behandler' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Velg behandler' })).toHaveClass('custom-root');
    expect(screen.getByRole('radiogroup')).toHaveClass('custom-group');
    expect(screen.getAllByTestId('my-card')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Ada Demo' })).toHaveClass(
      'custom-card',
      'custom-card-on'
    );
    expect(screen.getByRole('radio', { name: FIRST })).not.toHaveClass('custom-card-on');
  });

  it('keeps the arrow keys working through an overriding card', () => {
    function MyCard(props: StylistCardProps) {
      return <DefaultStylistCard {...props} />;
    }
    const { onPick } = renderStylist({ components: { StylistCard: MyCard } });
    const [first, ada] = screen.getAllByRole('radio') as [HTMLElement, HTMLElement];
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowRight' });
    expect(ada).toHaveFocus();
    expect(onPick).toHaveBeenCalledWith('res-ada');
  });

  it('has no axe violations', async () => {
    const { container } = renderStylist({
      nextAvailableTs: { 'res-ada': AT_THREE },
      party: {
        mode: 'sequential',
        size: 2,
        minutes: { sequential: 60, parallel: 30 },
        onMode: vi.fn(),
      },
    });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
