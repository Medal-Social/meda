import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { summaryBarLabelsNb as L } from '../../../src/booking/__stories__/labels.details.js';
import { SummaryBar, type SummaryBarProps } from '../../../src/booking/summary-bar.js';

/** The bar renders exactly the line it is given, non-breaking spaces and all. */
const exactly = (text: string) => text;

function setup(props: Partial<SummaryBarProps> = {}) {
  return render(
    <SummaryBar line="" canAdvance={false} step="who" onNext={vi.fn()} labels={L} {...props} />
  );
}

describe('SummaryBar', () => {
  it('is there, at its fixed height, before anything is chosen', () => {
    const { container } = setup();
    expect(container.firstElementChild).toHaveClass('h-16');
    expect(screen.getByText(L['summary.placeholder.who'])).toHaveClass('text-muted-foreground');
    expect(screen.getByRole('button', { name: L['summary.next'] })).toBeDisabled();
  });

  it('asks for a service once the first step is answered but nothing is chosen', () => {
    setup({ step: 'service' });
    expect(screen.getByText(L['summary.placeholder.service'])).toBeInTheDocument();
  });

  it('says exactly the line it was given', () => {
    const line = 'Barneklipp · Ada · i dag 15:00 · 390\u00A0kr';
    setup({ line, step: 'when' });
    const text = screen.getByText(line, { normalizer: exactly });
    expect(text).not.toHaveClass('text-muted-foreground');
  });

  it('gets out of the way on the step that has its own button', () => {
    const { container } = setup({ line: 'Barneklipp', canAdvance: true, step: 'details' });
    expect(container).toBeEmptyDOMElement();
  });

  it('takes the button’s state from canAdvance, and reports the press', () => {
    const onNext = vi.fn();
    const { rerender } = setup({ step: 'when', onNext });
    expect(screen.getByRole('button', { name: L['summary.next'] })).toBeDisabled();
    rerender(<SummaryBar line="x" canAdvance step="when" onNext={onNext} labels={L} />);
    const button = screen.getByRole('button', { name: L['summary.next'] });
    expect(button).toBeEnabled();
    fireEvent.click(button);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('takes a labels override and lands classNames on their slots', () => {
    const { container } = setup({
      labels: { ...L, 'summary.next': 'Go on' },
      classNames: { root: 'x-root', line: 'x-line', next: 'x-next' },
    });
    expect(container.firstElementChild).toHaveClass('x-root', 'sticky');
    expect(screen.getByText(L['summary.placeholder.who'])).toHaveClass('x-line');
    expect(screen.getByRole('button', { name: 'Go on' })).toHaveClass('x-next');
  });

  it('has no axe violations', async () => {
    const { container } = setup({ line: 'Barneklipp · Ada', canAdvance: true, step: 'when' });
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
