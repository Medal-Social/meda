import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import {
  DEMO_PHONE,
  demoFormatNb as format,
} from '../../../../src/booking/__stories__/fixtures.js';
import { portalUnreachableLabelsNb as labels } from '../../../../src/booking/__stories__/labels.portal.js';
import { fillLabel } from '../../../../src/booking/labels.js';
import {
  PortalUnreachable,
  type PortalUnreachableProps,
} from '../../../../src/booking/portal/portal-unreachable.js';

function renderPage(props: Partial<PortalUnreachableProps> = {}) {
  return render(
    <PortalUnreachable
      labels={labels}
      format={format}
      phone={DEMO_PHONE}
      retryHref="/account"
      logout={<button type="button">Logg ut</button>}
      {...props}
    />
  );
}

describe('PortalUnreachable', () => {
  it('says what happened, offers the same page again, a call, and the way out', () => {
    renderPage();
    const heading = screen.getByRole('heading', {
      level: 1,
      name: labels['portalUnreachable.heading'],
    });
    expect(heading.closest('section')).toHaveAttribute('aria-labelledby', heading.id);
    expect(screen.getByText(labels['portalUnreachable.body'])).toBeInTheDocument();
    expect(screen.getByRole('link', { name: labels['portalUnreachable.retry'] })).toHaveAttribute(
      'href',
      '/account'
    );
    expect(
      screen.getByRole('link', {
        name: fillLabel(labels['portalUnreachable.call'], { phone: DEMO_PHONE }),
      })
    ).toHaveAttribute('href', 'tel:22000000');
    expect(screen.getByRole('button', { name: 'Logg ut' })).toBeInTheDocument();
  });

  it('draws no call link without a number', () => {
    renderPage({ phone: null });
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('takes a labels override and classNames', () => {
    renderPage({
      labels: { ...labels, 'portalUnreachable.retry': 'Again' },
      classNames: { root: 'x-root', link: 'x-link' },
    });
    const link = screen.getByRole('link', { name: 'Again' });
    expect(link).toHaveClass('x-link');
    expect(link.closest('section')).toHaveClass('x-root');
  });

  it('has no axe violations', async () => {
    const { container } = renderPage();
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
