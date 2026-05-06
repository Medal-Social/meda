import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingTrustBar } from '../../../src/marketing/marketing-trust-bar.js';

describe('MarketingTrustBar', () => {
  it('renders one card per stat', () => {
    render(
      <MarketingTrustBar
        stats={[
          { value: '10k+', label: 'founders', caption: 'using Medal' },
          { value: '4.8/5', label: 'rating' },
          { value: '93%', label: 'on-brand drafts' },
          { value: '$8k', label: 'cost replaced' },
        ]}
      />
    );
    expect(screen.getByText('10k+')).toBeInTheDocument();
    expect(screen.getByText('4.8/5')).toBeInTheDocument();
    expect(screen.getByText('93%')).toBeInTheDocument();
    expect(screen.getByText('$8k')).toBeInTheDocument();
    expect(screen.getByText('using Medal')).toBeInTheDocument();
  });
});
