import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingAnnouncementBar } from '../../../src/marketing/marketing-announcement-bar.js';

describe('MarketingAnnouncementBar', () => {
  it('renders as a link when href is provided', () => {
    render(
      <MarketingAnnouncementBar href="/changelog/oct">New: AI Composer</MarketingAnnouncementBar>
    );
    expect(screen.getByRole('link', { name: /New: AI Composer/ })).toHaveAttribute(
      'href',
      '/changelog/oct'
    );
  });

  it('renders as a non-interactive span when no href', () => {
    render(<MarketingAnnouncementBar>Announcement</MarketingAnnouncementBar>);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Announcement')).toBeInTheDocument();
  });
});
