import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconCatalog } from './IconCatalog';

describe('IconCatalog', () => {
  it('renders the requested icon names from lucide-react', () => {
    render(<IconCatalog names={['Home', 'Settings', 'Search']} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders nothing for an empty list', () => {
    const { container } = render(<IconCatalog names={[]} />);
    expect(container.querySelector('[data-icon-tile]')).toBeNull();
  });
});
