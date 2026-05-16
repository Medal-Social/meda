import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingShell } from '../../../src/marketing/marketing-shell.js';

describe('MarketingShell', () => {
  it('renders header, children, and footer in document order', () => {
    render(
      <MarketingShell
        header={<div data-testid="header">H</div>}
        footer={<div data-testid="footer">F</div>}
      >
        <div data-testid="main">M</div>
      </MarketingShell>
    );

    const all = screen.getAllByTestId(/header|main|footer/);
    expect(all.map((el) => el.dataset.testid)).toEqual(['header', 'main', 'footer']);
  });

  it('omits header when not provided', () => {
    render(
      <MarketingShell>
        <div data-testid="main">M</div>
      </MarketingShell>
    );
    expect(screen.queryByRole('banner')).toBeNull();
  });

  it('renders banner role on header wrapper when header is provided', () => {
    render(<MarketingShell header={<div>H</div>}>m</MarketingShell>);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});

describe('MarketingShell banner slot', () => {
  it('renders a banner above the header when provided', () => {
    render(
      <MarketingShell
        banner={<div data-testid="banner">Announcement</div>}
        header={<div data-testid="header">Header</div>}
      >
        <p>body</p>
      </MarketingShell>
    );
    const banner = screen.getByTestId('banner');
    const header = screen.getByTestId('header');
    expect(banner).toBeInTheDocument();
    expect(banner.compareDocumentPosition(header) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('omits the banner wrapper when no banner is passed', () => {
    render(
      <MarketingShell header={<div>Header</div>}>
        <p>body</p>
      </MarketingShell>
    );
    expect(screen.queryByTestId('banner')).not.toBeInTheDocument();
  });
});
