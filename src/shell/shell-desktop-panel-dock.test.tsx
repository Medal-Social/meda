import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ShellDesktopPanelDock } from './shell-desktop-panel-dock';

afterEach(() => {
  cleanup();
});

describe('ShellDesktopPanelDock', () => {
  it('renders the open dock state and forwards panel props', () => {
    const renderPanel = vi.fn(({ defaultView, viewIds, className }) => (
      <div data-testid="panel" data-view={defaultView} data-view-ids={viewIds?.join(',')} className={className} />
    ));

    render(
      <ShellDesktopPanelDock
        defaultView="info"
        panelOpen
        width={360}
        viewIds={['info', 'notes']}
        onWidthChange={vi.fn()}
        renderPanel={renderPanel}
      />
    );

    expect(screen.getByTestId('desktop-panel-dock')).toHaveAttribute('data-state', 'open');
    expect(screen.getByTestId('desktop-panel-dock')).toHaveStyle({ width: '360px' });
    expect(screen.getByTestId('panel')).toHaveAttribute('data-view', 'info');
    expect(screen.getByTestId('panel')).toHaveAttribute('data-view-ids', 'info,notes');
    expect(renderPanel).toHaveBeenCalledTimes(1);
  });

  it('renders the closed dock state', () => {
    render(
      <ShellDesktopPanelDock
        defaultView="info"
        panelOpen={false}
        width={360}
        onWidthChange={vi.fn()}
        renderPanel={() => <div>Panel</div>}
      />
    );

    expect(screen.getByTestId('desktop-panel-dock')).toHaveAttribute('data-state', 'closed');
    expect(screen.getByTestId('desktop-panel-dock')).toHaveAttribute('aria-hidden', 'true');
  });

  it('resizes the panel through the shared resize handle', () => {
    const handleWidthChange = vi.fn();

    render(
      <ShellDesktopPanelDock
        defaultView="info"
        panelOpen
        width={360}
        onWidthChange={handleWidthChange}
        renderPanel={() => <div>Panel</div>}
      />
    );

    const dragHandle = screen.getByLabelText('Resize panel');
    fireEvent.pointerDown(dragHandle, { button: 0, clientX: 700 });
    fireEvent.pointerMove(window, { clientX: 620 });
    fireEvent.pointerUp(window);

    expect(handleWidthChange).toHaveBeenLastCalledWith(440);
  });
});
