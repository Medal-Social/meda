import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarketingCallout } from './marketing-callout.js';

describe('MarketingCallout', () => {
  it('renders highlighted content and CTA links', () => {
    render(
      <MarketingCallout
        eyebrow="Launch"
        title="Turn every launch into a pipeline moment"
        description="A focused marketing band for product announcements."
        ctas={[
          { label: 'Book demo', href: '/demo' },
          { label: 'Read playbook', href: '/playbook', variant: 'secondary' },
        ]}
      />
    );

    expect(screen.getByText('Launch')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Turn every launch into a pipeline moment' }));
    expect(screen.getByText('A focused marketing band for product announcements.'));
    expect(screen.getByRole('link', { name: 'Book demo' })).toHaveAttribute('href', '/demo');
    expect(screen.getByRole('link', { name: 'Read playbook' })).toHaveAttribute(
      'href',
      '/playbook'
    );
  });

  it('renders button CTAs when no href is provided', () => {
    const onClick = vi.fn();
    render(
      <MarketingCallout
        title="Capture demand"
        ctas={[{ label: 'Start capture', onClick }]}
        variant="card"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start capture' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
