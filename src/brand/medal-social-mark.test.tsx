import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MedalSocialMark } from './medal-social-mark.js';

describe('MedalSocialMark', () => {
  it('renders as a decorative mark with production favicon colors by default', () => {
    const { container } = render(<MedalSocialMark data-testid="mark" />);

    const mark = screen.getByTestId('mark');
    expect(mark).toHaveAttribute('viewBox', '0 0 48 48');
    expect(mark).toHaveAttribute('aria-hidden', 'true');
    expect(mark).toHaveAttribute('focusable', 'false');

    expect(container.querySelector('circle[cx="24"][cy="24"]')).toHaveAttribute(
      'fill',
      'hsl(0, 0%, 10%)'
    );
    expect(container.querySelector('path[d="M8 24L24 8L40 24L24 40L8 24Z"]')).toHaveAttribute(
      'stroke',
      'hsl(0, 0%, 90%)'
    );
  });

  it('uses title as the accessible image name', () => {
    render(<MedalSocialMark title="Medal Social" />);

    expect(screen.getByRole('img', { name: 'Medal Social' })).toBeInTheDocument();
  });

  it('supports explicit brand color overrides', () => {
    const { container } = render(
      <MedalSocialMark backgroundColor="#111113" markColor="#fafafa" title="Medal" />
    );

    expect(container.querySelector('circle[cx="24"][cy="24"]')).toHaveAttribute('fill', '#111113');
    expect(container.querySelector('circle[cx="24"][cy="8.5"]')).toHaveAttribute('fill', '#fafafa');
  });
});
