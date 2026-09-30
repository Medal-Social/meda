import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb as format } from '../../../../src/booking/__stories__/fixtures.js';
import { demoRebookHref } from '../../../../src/booking/__stories__/fixtures.portal.js';
import { childCardsLabelsNb as labels } from '../../../../src/booking/__stories__/labels.portal.js';
import { fillLabel } from '../../../../src/booking/labels.js';
import {
  type ChildCardProps,
  ChildCards,
  type ChildCardsProps,
  DefaultChildCard,
} from '../../../../src/booking/portal/child-cards.js';
import type { ChildSummary } from '../../../../src/booking/types.js';

const MIA: ChildSummary = {
  personId: 'p-mia',
  name: 'Mia',
  birthYear: 2018,
  birthMonth: null,
  ageRange: { min: 7, max: 8 },
  age: 8,
  lastVisitTs: null,
  serviceId: null,
  serviceName: null,
  resourceId: null,
  preferredResourceId: null,
  nextVisitTs: null,
};

const VISITED: ChildSummary = {
  ...MIA,
  lastVisitTs: Date.parse('2026-08-12T10:00:00+02:00'),
  serviceId: 'svc-kids',
  serviceName: 'Barneklipp',
  resourceId: 'res-bo',
  preferredResourceId: 'res-ada',
  nextVisitTs: Date.parse('2026-10-08T15:00:00+02:00'),
};

/** The demo contract: the last service with the child's USUAL stylist, not the one they got. */
const hrefFor = (child: ChildSummary) =>
  demoRebookHref({
    serviceId: child.serviceId,
    resourceId: child.preferredResourceId ?? child.resourceId,
  });

function renderCards(props: Partial<ChildCardsProps> = {}) {
  return render(
    <ChildCards kids={[MIA]} hrefFor={hrefFor} labels={labels} format={format} {...props} />
  );
}

describe('ChildCards with no children', () => {
  it('says so instead of rendering nothing', () => {
    renderCards({ kids: [], variant: 'compact' });
    expect(screen.getByText(labels['childCards.empty'])).toBeInTheDocument();
  });

  it('draws what the caller passes as `empty`, including nothing', () => {
    const { container } = renderCards({ kids: [], empty: null });
    expect(container).toBeEmptyDOMElement();
  });

  it('draws the cards, not the sentence, when there are children', () => {
    renderCards();
    expect(screen.queryByText(labels['childCards.empty'])).not.toBeInTheDocument();
    expect(screen.getByText('Mia')).toBeInTheDocument();
  });
});

describe('ChildCards', () => {
  it('says the age range, the last visit, the usual stylist and the next time', () => {
    renderCards({ kids: [VISITED], stylistNames: { 'res-ada': 'Ada' } });

    expect(
      screen.getByText(
        fillLabel(labels['childCards.lastVisit'], {
          age: '7–8 år',
          service: 'Barneklipp',
          date: format.clock.date(VISITED.lastVisitTs as number),
        })
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText(/8\. okt\. kl\. 15:00/)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: fillLabel(labels['childCards.book'], { name: 'Mia' }) })
    ).toHaveAttribute('href', '/book?service=svc-kids&stylist=res-ada');
  });

  it('says a child has not been in yet', () => {
    renderCards();
    expect(
      screen.getByText(fillLabel(labels['childCards.neverVisited'], { age: '7–8 år' }))
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/book');
  });

  it('keeps both detail lines, as dashes, for a child with nothing to say', () => {
    renderCards();
    expect(screen.getByText(labels['childCards.stylist'])).toBeInTheDocument();
    expect(screen.getByText(labels['childCards.next'])).toBeInTheDocument();
    expect(screen.getAllByText(labels['childCards.none'])).toHaveLength(2);
  });

  it('draws the compact row without the details', () => {
    renderCards({ variant: 'compact' });
    expect(screen.queryByText(labels['childCards.stylist'])).toBeNull();
    expect(screen.getByRole('list')).not.toHaveClass('sm:grid-cols-2');
  });

  it('calls `onBook` with the child on the tap', () => {
    const onBook = vi.fn();
    renderCards({ onBook });
    fireEvent.click(screen.getByRole('link'));
    expect(onBook).toHaveBeenCalledWith(MIA);
  });

  describe('overrides', () => {
    it('shows a labels override', () => {
      renderCards({ labels: { ...labels, 'childCards.book': 'Book {name} again' } });
      expect(screen.getByRole('link', { name: 'Book Mia again' })).toBeInTheDocument();
    });

    it('lands classNames on their slots', () => {
      renderCards({
        classNames: {
          list: 'x-list',
          card: 'x-card',
          avatar: 'x-avatar',
          link: 'x-link',
          details: 'x-details',
        },
      });
      expect(screen.getByRole('list')).toHaveClass('x-list');
      expect(screen.getByRole('listitem')).toHaveClass('x-card');
      expect(screen.getByRole('link')).toHaveClass('x-link');
      expect(document.querySelector('dl')).toHaveClass('x-details');
      expect(document.querySelector('.x-avatar')).toHaveTextContent('M');
    });

    it('replaces the card with `components.ChildCard`, which can wrap the default', () => {
      function Card(props: ChildCardProps) {
        return props.index === 0 ? (
          <li>Custom {props.child.name}</li>
        ) : (
          <DefaultChildCard {...props} />
        );
      }
      renderCards({
        kids: [MIA, { ...MIA, personId: 'p-leo', name: 'Leo' }],
        components: { ChildCard: Card },
      });
      expect(screen.getByText('Custom Mia')).toBeInTheDocument();
      expect(screen.getByText('Leo')).toBeInTheDocument();
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderCards({ kids: [VISITED, MIA] });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
