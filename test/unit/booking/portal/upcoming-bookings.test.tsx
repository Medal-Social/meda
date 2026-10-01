import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { DEMO_NOW, demoFormatNb as format } from '../../../../src/booking/__stories__/fixtures.js';
import { demoPortalBooking as booking } from '../../../../src/booking/__stories__/fixtures.portal.js';
import { upcomingBookingsLabelsNb as labels } from '../../../../src/booking/__stories__/labels.portal.js';
import { fillLabel } from '../../../../src/booking/labels.js';
import {
  type BookingCardProps,
  DefaultBookingCard,
  UpcomingBookings,
  type UpcomingBookingsProps,
} from '../../../../src/booking/portal/upcoming-bookings.js';

const NBSP = ' ';
const exactly = (text: string) => text;
const PHONE = '22 00 00 00';
const DAY = 86_400_000;

function renderList(props: Partial<UpcomingBookingsProps> = {}) {
  return render(
    <UpcomingBookings
      bookings={[booking()]}
      phone={PHONE}
      labels={labels}
      format={format}
      bookingHref="/book"
      now={DEMO_NOW}
      {...props}
    />
  );
}

describe('UpcomingBookings', () => {
  it('draws one card per booking with the manage link that was minted for it', () => {
    renderList();

    expect(screen.getByRole('heading', { name: labels['upcoming.heading'] })).toBeInTheDocument();
    expect(screen.getByText('Barneklipp · Mia')).toBeInTheDocument();
    // Day and hour through the business clock, the price through `format.price`.
    expect(
      screen.getByText(`onsdag kl. 16:30 · Ada · 390${NBSP}kr`, { normalizer: exactly })
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: labels['upcoming.manage'] })).toHaveAttribute(
      'href',
      '/manage/demo-token'
    );
  });

  it('makes the first card the hero, with how far off it is, and only the first', () => {
    renderList({
      bookings: [booking(), booking({ bookingId: 'bk-2', startTs: DEMO_NOW + 9 * DAY })],
    });
    expect(
      screen.getByText(
        fillLabel(labels['upcoming.next'], {
          when: fillLabel(labels['upcoming.inDays'], { count: 2 }),
        })
      )
    ).toBeInTheDocument();
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveClass('bg-primary');
    expect(items[1]).not.toHaveClass('bg-primary');
    expect(items[1]).toHaveClass('border-border');
  });

  it('says today and tomorrow on the business calendar', () => {
    const { unmount } = renderList({ bookings: [booking({ startTs: DEMO_NOW + 3_600_000 })] });
    expect(
      screen.getByText(fillLabel(labels['upcoming.next'], { when: labels['upcoming.today'] }))
    ).toBeInTheDocument();
    unmount();
    renderList({ bookings: [booking({ startTs: DEMO_NOW + DAY })] });
    expect(
      screen.getByText(fillLabel(labels['upcoming.next'], { when: labels['upcoming.tomorrow'] }))
    ).toBeInTheDocument();
  });

  it('names «anyone» when no stylist was chosen, and falls back for a nameless service', () => {
    renderList({
      bookings: [
        booking({ resourceId: null, resourceName: null, serviceName: null, bookedForName: null }),
      ],
      phone: null,
    });
    expect(screen.getByText(new RegExp(labels['upcoming.anyStylist']))).toBeInTheDocument();
    expect(screen.getByText(labels['upcoming.serviceFallback'])).toBeInTheDocument();
  });

  it('leaves the price out when there is none', () => {
    renderList({ bookings: [booking({ amountOre: null })] });
    expect(screen.getByText('onsdag kl. 16:30 · Ada', { normalizer: exactly })).toBeInTheDocument();
  });

  it('sends a booking without a manage path to the telephone instead of a dead link', () => {
    renderList({ bookings: [booking({ managePath: null })] });

    expect(screen.queryByRole('link', { name: labels['upcoming.manage'] })).not.toBeInTheDocument();
    const call = screen.getByRole('link', {
      name: fillLabel(labels['upcoming.call'], { phone: PHONE }),
    });
    expect(call).toHaveAttribute('href', 'tel:22000000');
    expect(call.closest('p')).toHaveTextContent(
      fillLabel(labels['upcoming.noManageWithPhone'], {
        call: fillLabel(labels['upcoming.call'], { phone: PHONE }),
      })
    );
  });

  it('leaves the telephone unlinked when there is no number on file', () => {
    renderList({ bookings: [booking({ managePath: null })], phone: null });
    expect(screen.getByText(labels['upcoming.noManage'])).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('shows the empty state with a way into the booking flow', () => {
    renderList({ bookings: [] });
    expect(screen.getByText(labels['upcoming.empty'])).toBeInTheDocument();
    expect(screen.getByRole('link', { name: labels['upcoming.book'] })).toHaveAttribute(
      'href',
      '/book'
    );
  });

  describe('overrides', () => {
    it('shows a labels override', () => {
      renderList({ labels: { ...labels, 'upcoming.heading': 'Soon' } });
      expect(screen.getByRole('heading', { name: 'Soon' })).toBeInTheDocument();
    });

    it('lands classNames on their slots', () => {
      renderList({
        bookings: [booking(), booking({ bookingId: 'bk-2' })],
        classNames: {
          root: 'x-root',
          cardHero: 'x-hero',
          card: 'x-card',
          badge: 'x-badge',
          heroMuted: 'x-muted',
          manage: 'x-manage',
        },
      });
      const items = screen.getAllByRole('listitem');
      expect(items[0]).toHaveClass('x-hero');
      expect(items[1]).toHaveClass('x-card');
      expect(items[0].closest('section')).toHaveClass('x-root');
      expect(items[0].querySelector('.tabular-nums')).toHaveClass('x-muted');
      expect(items[1].querySelector('.tabular-nums')).not.toHaveClass('x-muted');
      expect(screen.getAllByRole('link', { name: labels['upcoming.manage'] })[0]).toHaveClass(
        'x-manage'
      );
    });

    it('replaces the card with `components.BookingCard`, which can wrap the default', () => {
      function Card(props: BookingCardProps) {
        return props.hero ? (
          <li>Custom {props.booking.bookingId}</li>
        ) : (
          <DefaultBookingCard {...props} />
        );
      }
      renderList({
        bookings: [booking(), booking({ bookingId: 'bk-2' })],
        components: { BookingCard: Card },
      });
      expect(screen.getByText('Custom bk-1')).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: labels['upcoming.manage'] })).toHaveLength(1);
    });
  });

  it('has no axe violations', async () => {
    const { container } = renderList({
      bookings: [booking(), booking({ bookingId: 'bk-2', managePath: null })],
    });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});

describe('UpcomingBookings — text nodes', () => {
  const nodes = (element: Element) =>
    Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent);

  it('joins a line of string labels into ONE text node', () => {
    renderList();
    expect(nodes(screen.getByText('Barneklipp · Mia'))).toEqual(['Barneklipp · Mia']);
    const when = screen.getByText(/ kl\. /);
    expect(nodes(when)).toHaveLength(1);
  });

  it('keeps the line in pieces once one of its labels is an array', () => {
    renderList({ labels: { ...labels, 'upcoming.when': ['{day}', ' kl. ', '{time}'] } });
    const when = screen.getByText(/ kl\. /);
    const pieces = nodes(when);
    expect(pieces[1]).toBe(' kl. ');
    expect(pieces).toContain(' · ');
    expect(pieces.length).toBeGreaterThan(4);
  });
});
