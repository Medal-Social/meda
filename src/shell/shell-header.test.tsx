import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShellHeaderFrame, ShellPanelToggle } from './shell-header';

afterEach(() => {
  cleanup();
});

describe('ShellHeaderFrame', () => {
  it('renders left, center, and right header slots', () => {
    render(
      <ShellHeaderFrame
        left={<div>Workspace</div>}
        center={<nav>Tabs</nav>}
        right={<button type="button">Action</button>}
      />
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Tabs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    expect(screen.getByTestId('shell-header-actions')).toBeInTheDocument();
  });
});

describe('ShellPanelToggle', () => {
  it('renders the open state label and fires toggle', () => {
    const onToggle = vi.fn();

    render(<ShellPanelToggle panelOpen onToggle={onToggle} />);

    fireEvent.click(screen.getByLabelText('Close panel'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('renders the closed state label', () => {
    render(<ShellPanelToggle panelOpen={false} onToggle={vi.fn()} />);

    expect(screen.getByLabelText('Open panel')).toBeInTheDocument();
  });
});
