import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FilterRail } from './filter-rail.js';

describe('FilterRail', () => {
  it('renders header, description, search, actions, children, and footer', () => {
    render(
      <FilterRail
        title="Filters"
        description="Refine the queue"
        search={<input type="search" aria-label="Search filters" />}
        actions={<button type="button">Clear</button>}
        footer={<button type="button">Apply</button>}
      >
        <FilterRail.Group title="Status" description="Conversation state">
          <label>
            <input type="checkbox" /> Open
          </label>
        </FilterRail.Group>
      </FilterRail>
    );

    expect(screen.getByRole('complementary', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Refine the queue')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByText('Conversation state')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Open' })).toBeInTheDocument();
  });

  it('supports an explicit aria-label without a visible title', () => {
    render(
      <FilterRail aria-label="Queue filters">
        <FilterRail.Group title="Priority">
          <button type="button">High</button>
        </FilterRail.Group>
      </FilterRail>
    );

    expect(screen.getByRole('complementary', { name: 'Queue filters' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Queue filters' })).not.toBeInTheDocument();
  });

  it('labels the landmark from a non-string visible title', () => {
    render(
      <FilterRail title={<span>Filters</span>}>
        <FilterRail.Group title="Priority">
          <button type="button">High</button>
        </FilterRail.Group>
      </FilterRail>
    );

    expect(screen.getByRole('complementary', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
  });

  it('applies custom classes to the rail and group', () => {
    render(
      <FilterRail title="Filters" className="custom-rail">
        <FilterRail.Group title="Team" className="custom-group">
          <button type="button">Support</button>
        </FilterRail.Group>
      </FilterRail>
    );

    expect(screen.getByRole('complementary', { name: 'Filters' })).toHaveClass('custom-rail');
    expect(screen.getByRole('group', { name: 'Team' })).toHaveClass('custom-group');
  });
});
