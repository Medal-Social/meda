import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ShellScrollableContent } from '../../../src/shell/../../../src/shell/extras/shell-scrollable-content';

afterEach(() => {
  cleanup();
});

describe('ShellScrollableContent', () => {
  it('renders the workspace layout with a max width when provided', () => {
    render(
      <ShellScrollableContent desktopDockOffset={64} layout="workspace" maxWidth={1120}>
        <div>Workspace</div>
      </ShellScrollableContent>
    );

    expect(screen.getByTestId('shell-workspace-viewport')).toHaveStyle({ paddingRight: '64px' });
    expect(screen.getByTestId('shell-content-workspace')).toHaveStyle({ maxWidth: '1120px' });
  });

  it('renders centered content without workspace or fullbleed wrappers', () => {
    render(
      <ShellScrollableContent layout="centered">
        <div>Centered</div>
      </ShellScrollableContent>
    );

    expect(screen.getByTestId('shell-content-centered')).toBeInTheDocument();
    expect(screen.queryByTestId('shell-content-workspace')).not.toBeInTheDocument();
    expect(screen.queryByTestId('shell-content-fullbleed')).not.toBeInTheDocument();
  });

  it('renders fullbleed content with the supplied width cap', () => {
    render(
      <ShellScrollableContent layout="fullbleed" maxWidth={1760}>
        <div>Fullbleed</div>
      </ShellScrollableContent>
    );

    expect(screen.getByTestId('shell-content-fullbleed')).toHaveStyle({ maxWidth: '1760px' });
    expect(screen.queryByTestId('shell-content-workspace')).not.toBeInTheDocument();
  });

  it('omits the style attribute when maxWidth is not provided for fullbleed layout', () => {
    render(
      <ShellScrollableContent layout="fullbleed">
        <div>Fullbleed uncapped</div>
      </ShellScrollableContent>
    );

    const el = screen.getByTestId('shell-content-fullbleed');
    expect(el.getAttribute('style')).toBeNull();
  });

  it('omits the style attribute when maxWidth is not provided for workspace layout', () => {
    render(
      <ShellScrollableContent layout="workspace">
        <div>Workspace uncapped</div>
      </ShellScrollableContent>
    );

    const el = screen.getByTestId('shell-content-workspace');
    expect(el.getAttribute('style')).toBeNull();
  });
});
