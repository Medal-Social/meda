import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShellTabBar } from './shell-tab-bar';

afterEach(() => {
  cleanup();
});

describe('ShellTabBar', () => {
  it('renders button tabs and highlights the active tab', () => {
    const onTabChange = vi.fn();

    render(
      <ShellTabBar
        tabs={[
          { id: 'overview', label: 'Overview' },
          { id: 'bom', label: 'BOM' },
        ]}
        activeTab="overview"
        onTabChange={onTabChange}
      />
    );

    expect(screen.getByText('Overview').closest('button')).toHaveAttribute('data-active', 'true');
    fireEvent.click(screen.getByText('BOM'));
    expect(onTabChange).toHaveBeenCalledWith('bom');
  });

  it('renders link tabs through the host render contract', () => {
    render(
      <ShellTabBar
        tabs={[
          { id: 'overview', label: 'Overview', to: '/products/1' },
          { id: 'simulator', label: 'Simulator', to: '/products/1/simulator' },
        ]}
        activeTab="overview"
        ariaLabel="Workspace tabs"
        renderLink={({ children, className, tab, isActive }) => (
          <a
            key={tab.id}
            href={tab.to}
            aria-current={isActive ? 'page' : undefined}
            className={className}
          >
            {children}
          </a>
        )}
      />
    );

    expect(screen.getByRole('navigation', { name: 'Workspace tabs' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Simulator' })).toHaveAttribute(
      'href',
      '/products/1/simulator'
    );
  });

  it('renders nothing when no tabs are provided', () => {
    const { container } = render(<ShellTabBar tabs={[]} activeTab="" onTabChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});
