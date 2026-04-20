import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Beaker, Settings } from 'lucide-react';
import { afterEach, describe, expect, it } from 'vitest';
import { ShellAppRail } from './shell-app-rail';

afterEach(() => {
  document.body.innerHTML = '';
});

const mainItems = [{ to: '/lab', label: 'Labs', icon: Beaker }];
const utilityItems = [{ to: '/settings', label: 'Settings', icon: Settings }];

describe('ShellAppRail', () => {
  it('renders main and utility sections through the host link contract', () => {
    render(
      <ShellAppRail
        mainItems={mainItems}
        utilityItems={utilityItems}
        isItemActive={(item) => item.to === '/lab'}
        renderLink={({ children, className, item }) => (
          <a key={item.to} className={className} href={item.to}>
            {children}
          </a>
        )}
      />
    );

    expect(screen.getByRole('link', { name: /labs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /labs/i })).toHaveClass(
      'bg-[var(--app-rail-item-active-bg)]'
    );
  });

  it('toggles divider state labels and renders footer content', () => {
    render(
      <ShellAppRail
        mainItems={mainItems}
        utilityItems={utilityItems}
        footer={<div data-testid="rail-footer">Footer</div>}
        isItemActive={() => false}
        renderLink={({ children, className, item }) => (
          <a key={item.to} className={className} href={item.to}>
            {children}
          </a>
        )}
      />
    );

    expect(screen.getByRole('button', { name: /push items up/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /push items up/i }));
    expect(screen.getByRole('button', { name: /push items down/i })).toBeInTheDocument();
    expect(screen.getByTestId('rail-footer')).toBeInTheDocument();
  });
});
