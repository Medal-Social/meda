import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingNumberedFeatures } from '../../../src/marketing/marketing-numbered-features.js';

describe('MarketingNumberedFeatures', () => {
  it('renders one tile per feature with the index, title, description', () => {
    render(
      <MarketingNumberedFeatures
        title="Built to move your marketing numbers"
        features={[
          { id: 'a', index: '01', title: 'Plan with AI', description: 'd1' },
          { id: 'b', index: '02', title: 'Post everywhere', description: 'd2' },
          { id: 'c', index: '03', title: 'Convert', description: 'd3' },
        ]}
      />
    );
    expect(screen.getByText('Built to move your marketing numbers')).toBeInTheDocument();
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('03')).toBeInTheDocument();
    expect(screen.getByText('Plan with AI')).toBeInTheDocument();
    expect(screen.getByText('d2')).toBeInTheDocument();
  });
});
