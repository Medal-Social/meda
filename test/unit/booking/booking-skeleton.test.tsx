import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { bookingSkeletonLabelsNb } from '../../../src/booking/__stories__/labels.time.js';
import { BookingSkeleton } from '../../../src/booking/booking-skeleton.js';

describe('BookingSkeleton', () => {
  it('is a polite status that says what is opening, over the page', () => {
    render(<BookingSkeleton labels={bookingSkeletonLabelsNb} />);
    const frame = screen.getByTestId('booking-pending');
    expect(frame).toHaveAttribute('role', 'status');
    expect(frame).toHaveAttribute('aria-live', 'polite');
    expect(frame).toHaveTextContent(bookingSkeletonLabelsNb['bookingSkeleton.opening']);
    // Fixed over the page, so it moves nothing; under a z-50 header.
    expect(frame).toHaveClass('fixed', 'inset-0', 'z-[45]');
  });

  it('hides its shapes from assistive technology', () => {
    const { container } = render(<BookingSkeleton labels={bookingSkeletonLabelsNb} />);
    const shapes = container.querySelector('[data-testid="booking-pending"] > div');
    expect(shapes).toHaveAttribute('aria-hidden', 'true');
    expect(shapes).toHaveClass('motion-safe:animate-pulse');
    // Title, two lead lines, four step-bar segments, a heading line, four chips.
    expect(shapes?.querySelectorAll('div, [data-slot="skeleton"]').length).toBeGreaterThanOrEqual(
      12
    );
  });

  it('shows a labels override and lands classNames on their slots', () => {
    render(
      <BookingSkeleton
        labels={{ 'bookingSkeleton.opening': 'Loading the booking' }}
        classNames={{ root: 'root-x', chip: 'chip-x' }}
      />
    );
    const frame = screen.getByTestId('booking-pending');
    expect(frame).toHaveTextContent('Loading the booking');
    expect(frame).toHaveClass('root-x');
    expect(frame.querySelectorAll('.chip-x')).toHaveLength(4);
  });

  it('has no axe violations', async () => {
    const { container } = render(<BookingSkeleton labels={bookingSkeletonLabelsNb} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
