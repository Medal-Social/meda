import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { demoProfile } from '../../../../src/booking/__stories__/fixtures.portal.js';
import { AccountCard } from '../../../../src/booking/portal/account-card.js';

describe('AccountCard', () => {
  it('shows the name with number and address', () => {
    const { container } = render(<AccountCard profile={demoProfile} />);
    expect(screen.getByText('Demo Forelder')).toBeInTheDocument();
    expect(screen.getByText('400 00 000 · demo.forelder@example.com')).toBeInTheDocument();
    expect(container.querySelector('[aria-hidden="true"]')).toHaveTextContent('D');
  });

  it('keeps only the number when compact, and the address when there is no number', () => {
    const { rerender } = render(<AccountCard profile={demoProfile} compact />);
    expect(screen.getByText('400 00 000')).toBeInTheDocument();
    rerender(<AccountCard profile={{ ...demoProfile, phone: null }} compact />);
    expect(screen.getAllByText('demo.forelder@example.com')).toHaveLength(1);
  });

  it('falls back to the address when there is no name', () => {
    render(<AccountCard profile={{ ...demoProfile, firstName: null, lastName: null }} compact />);
    expect(screen.getByText('demo.forelder@example.com')).toHaveClass('font-semibold');
  });

  it('lands classNames on their slots', () => {
    const { container } = render(
      <AccountCard
        profile={demoProfile}
        classNames={{ root: 'x-root', name: 'x-name', avatar: 'x-avatar' }}
      />
    );
    expect(container.firstElementChild).toHaveClass('x-root');
    expect(screen.getByText('Demo Forelder')).toHaveClass('x-name');
    expect(container.querySelector('.x-avatar')).not.toBeNull();
  });

  it('has no axe violations', async () => {
    const { container } = render(<AccountCard profile={demoProfile} />);
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
