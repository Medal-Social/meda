import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoRebookHref } from '../../../../src/booking/__stories__/fixtures.portal.js';
import { rebookCardsLabelsNb as labels } from '../../../../src/booking/__stories__/labels.portal.js';
import {
  DefaultRebookCard,
  type RebookCardProps,
  RebookCards,
  type RebookCardsProps,
} from '../../../../src/booking/portal/rebook-cards.js';
import type { RebookSuggestion } from '../../../../src/booking/types.js';

const FULL: RebookSuggestion = {
  serviceId: 'svc-kids',
  serviceName: 'Barneklipp',
  resourceId: 'res-ada',
  resourceName: 'Ada',
  bookedForName: 'Mia Ø',
};
const ANYONE: RebookSuggestion = {
  ...FULL,
  resourceId: null,
  resourceName: null,
  bookedForName: null,
};

function renderCards(props: Partial<RebookCardsProps> = {}) {
  return render(
    <RebookCards suggestions={[FULL, ANYONE]} hrefFor={demoRebookHref} labels={labels} {...props} />
  );
}

describe('RebookCards', () => {
  it('renders a card per suggestion linking to the href the caller built', () => {
    renderCards();

    expect(screen.getByRole('heading', { name: labels['rebook.heading'] })).toBeInTheDocument();
    expect(screen.getByText('Barneklipp · Mia Ø · Ada')).toBeInTheDocument();
    expect(screen.getByText(`Barneklipp · ${labels['rebook.anyStylist']}`)).toBeInTheDocument();
    const links = screen.getAllByRole('link', { name: labels['rebook.cta'] });
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/book?service=svc-kids&stylist=res-ada',
      '/book?service=svc-kids',
    ]);
  });

  it('falls back for a nameless service', () => {
    renderCards({ suggestions: [{ ...ANYONE, serviceName: null }] });
    expect(
      screen.getByText(`${labels['rebook.serviceFallback']} · ${labels['rebook.anyStylist']}`)
    ).toBeInTheDocument();
  });

  it('calls `onRebook` with the suggestion on every tap, named or not', () => {
    const onRebook = vi.fn();
    renderCards({ onRebook });
    const [named, unnamed] = screen.getAllByRole('link', { name: labels['rebook.cta'] });

    fireEvent.click(named);
    fireEvent.click(unnamed);

    // Each tap reports its own suggestion, so a caller that stashes the name
    // replaces (or clears) whatever an earlier tap left behind.
    expect(onRebook.mock.calls.map(([suggestion]) => suggestion.bookedForName)).toEqual([
      'Mia Ø',
      null,
    ]);
  });

  it('keeps its heading and says so when there is nothing to offer', () => {
    renderCards({ suggestions: [] });
    expect(screen.getByRole('heading', { name: labels['rebook.heading'] })).toBeInTheDocument();
    expect(screen.getByText(labels['rebook.empty'])).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: labels['rebook.cta'] })).not.toBeInTheDocument();
  });

  describe('overrides', () => {
    it('shows a labels override', () => {
      renderCards({ labels: { ...labels, 'rebook.cta': 'Again' } });
      expect(screen.getAllByRole('link', { name: 'Again' })).toHaveLength(2);
    });

    it('lands classNames on their slots', () => {
      renderCards({
        classNames: { root: 'x-root', card: 'x-card', link: 'x-link', list: 'x-list' },
      });
      expect(screen.getAllByRole('listitem')[0]).toHaveClass('x-card');
      expect(screen.getByRole('list')).toHaveClass('x-list');
      expect(screen.getAllByRole('link')[0]).toHaveClass('x-link');
      expect(screen.getByRole('list').closest('section')).toHaveClass('x-root');
    });

    it('replaces the card with `components.RebookCard`, which can wrap the default', () => {
      function Card(props: RebookCardProps) {
        return props.suggestion.bookedForName ? (
          <li>Custom {props.href}</li>
        ) : (
          <DefaultRebookCard {...props} />
        );
      }
      renderCards({ components: { RebookCard: Card } });
      expect(screen.getByText('Custom /book?service=svc-kids&stylist=res-ada')).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: labels['rebook.cta'] })).toHaveLength(1);
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderCards();
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
