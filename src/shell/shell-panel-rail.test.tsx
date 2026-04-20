import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Activity, Sparkles } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShellPanelRail } from './shell-panel-rail';

afterEach(() => {
  document.body.innerHTML = '';
});

const moduleViews = [{ id: 'activity', label: 'Activity', icon: Activity }];
const globalViews = [{ id: 'ai', label: 'AI', icon: Sparkles, global: true }];

describe('ShellPanelRail', () => {
  it('renders module and global panel actions', () => {
    render(
      <ShellPanelRail
        moduleViews={moduleViews}
        globalViews={globalViews}
        activePanelView="activity"
        onTogglePanelView={vi.fn()}
      />
    );

    expect(screen.getByRole('complementary', { name: 'Panel rail' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Activity' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: 'AI' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('forwards panel selection through the host callback', () => {
    const onTogglePanelView = vi.fn();

    render(
      <ShellPanelRail
        moduleViews={moduleViews}
        globalViews={globalViews}
        activePanelView={null}
        onTogglePanelView={onTogglePanelView}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'AI' }));
    expect(onTogglePanelView).toHaveBeenCalledWith('ai');
  });
});
