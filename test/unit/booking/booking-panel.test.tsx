import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { demoFormatNb } from '../../../src/booking/__stories__/fixtures.js';
import { bookingPanelLabelsNb as L } from '../../../src/booking/__stories__/labels.details.js';
import { BookingPanel, type BookingPanelProps } from '../../../src/booking/booking-panel.js';

/** Saturday 19 September 2026, 10:30 Oslo. */
const SATURDAY = Date.UTC(2026, 8, 19, 8, 30);

function setup(props: Partial<BookingPanelProps> = {}) {
  return render(
    <BookingPanel
      labels={L}
      format={demoFormatNb}
      who="1 barn"
      services="Gutteklipp · 30 min"
      startTs={SATURDAY}
      stylist={{ name: 'Gabriel', firstAvailable: true }}
      totalOre={51_000}
      {...props}
    />
  );
}

const row = (name: string) => screen.getByText(name).nextElementSibling as HTMLElement;

describe('BookingPanel', () => {
  it('is a landmark named «Din time» with the four answers', () => {
    setup();
    expect(screen.getByRole('complementary', { name: 'Din time' })).toBeInTheDocument();
    expect(row('Hvem')).toHaveTextContent('1 barn');
    expect(row('Klipp')).toHaveTextContent('Gutteklipp · 30 min');
    expect(row('Tid')).toHaveTextContent('kl. 10:30');
    expect(row('Frisør')).toHaveTextContent('Gabrielførste ledige');
  });

  it('keeps its shape before anything is chosen', () => {
    setup({ who: null, services: null, startTs: null, stylist: null, totalOre: null });
    expect(screen.getAllByText('Ikke valgt ennå')).toHaveLength(4);
    expect(screen.queryByText('Totalt, betales i salongen')).toBeNull();
  });

  it('shows the total and continues only when it can', () => {
    const onContinue = vi.fn();
    const { rerender } = setup({ onContinue, canContinue: false });
    expect(screen.getByText('Totalt, betales i salongen')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Fortsett' })).toBeDisabled();
    rerender(
      <BookingPanel
        labels={L}
        format={demoFormatNb}
        who="1 barn"
        services={null}
        startTs={null}
        stylist={null}
        totalOre={null}
        onContinue={onContinue}
        canContinue
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Fortsett' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('draws no button for a step with its own', () => {
    setup();
    expect(screen.queryByRole('button', { name: 'Fortsett' })).toBeNull();
  });

  it('offers to switch to someone else free at the same minute', () => {
    const onSwap = vi.fn();
    setup({ alternatives: [{ resourceId: 'res-sam', name: 'Sam' }], onSwap });
    expect(screen.getByText('Også ledig da:')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bestill hos Sam i stedet' }));
    expect(onSwap).toHaveBeenCalledWith('res-sam');
  });

  it('lists the notes with their icons hidden', () => {
    const { container } = setup({
      notes: [
        { kind: 'change', text: 'Gratis å endre til 24 timer før' },
        { kind: 'place', text: 'Schous plass 6' },
      ],
    });
    expect(screen.getByText('Gratis å endre til 24 timer før')).toBeInTheDocument();
    expect(container.querySelectorAll('li svg[aria-hidden="true"]')).toHaveLength(2);
  });

  it('has no axe violations', async () => {
    const { container } = setup({
      onContinue: vi.fn(),
      canContinue: true,
      alternatives: [{ resourceId: 'res-sam', name: 'Sam' }],
      onSwap: vi.fn(),
    });
    expect(await axe(container)).toHaveNoViolations();
  });
});
