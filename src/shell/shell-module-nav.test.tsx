import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Home, Package } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';
import { ShellModuleNav } from './shell-module-nav';

const module = {
  id: 'lab',
  label: 'Labs',
  description: 'Hardware R&D workspace',
  items: [
    {
      to: '/lab',
      label: 'Overview',
      description: 'Program status and entry points',
      icon: Home,
      shortcut: '1',
    },
    {
      to: '/lab/products',
      label: 'Products',
      description: 'Every form factor and BOM',
      icon: Package,
      shortcut: '2',
    },
  ],
};

afterEach(() => {
  cleanup();
});

describe('ShellModuleNav', () => {
  it('renders module metadata and item details', () => {
    render(
      <ShellModuleNav
        module={module}
        ariaLabel="Module navigation"
        isItemActive={(item) => item.to === '/lab'}
        renderLink={({ children, className, item }) => (
          <a key={item.to} className={className} href={item.to}>
            {children}
          </a>
        )}
      />
    );

    expect(screen.getByText('Labs')).toBeInTheDocument();
    expect(screen.getByText('Hardware R&D workspace')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByText('Program status and entry points')).toBeInTheDocument();
    expect(screen.getByText('Every form factor and BOM')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('applies active and inactive item classes through the render contract', () => {
    render(
      <ShellModuleNav
        module={module}
        ariaLabel="Module navigation"
        activeItemClassName="is-active"
        inactiveItemClassName="is-inactive"
        isItemActive={(item) => item.to === '/lab/products'}
        renderLink={({ children, className, item }) => (
          <a key={item.to} className={className} href={item.to}>
            {children}
          </a>
        )}
      />
    );

    expect(screen.getByRole('link', { name: /overview/i })).toHaveClass('is-inactive');
    expect(screen.getByRole('link', { name: /products/i })).toHaveClass('is-active');
  });
});
