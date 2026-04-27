import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { WorkbenchLayout } from './workbench-layout';

afterEach(() => {
  cleanup();
});

describe('WorkbenchLayout', () => {
  it('stacks content on tablet widths', () => {
    render(
      <WorkbenchLayout
        viewportBand="tablet"
        main={<div>Main</div>}
        aside={<div>Aside</div>}
        toolbar={<div>Toolbar</div>}
      />
    );

    expect(screen.getByTestId('workbench-layout')).toHaveAttribute('data-band', 'tablet');
    expect(screen.getByTestId('workbench-columns')).toHaveAttribute('data-layout', 'stacked');
  });

  it('uses a two-zone layout on desktop widths', () => {
    render(
      <WorkbenchLayout viewportBand="desktop" main={<div>Main</div>} aside={<div>Aside</div>} />
    );

    expect(screen.getByTestId('workbench-columns')).toHaveAttribute('data-layout', 'split');
  });

  it('uses a multi-zone layout on ultrawide widths', () => {
    render(
      <WorkbenchLayout viewportBand="ultrawide" main={<div>Main</div>} aside={<div>Aside</div>} />
    );

    expect(screen.getByTestId('workbench-layout')).toHaveStyle({ maxWidth: '1920px' });
    expect(screen.getByTestId('workbench-columns')).toHaveAttribute('data-layout', 'multi-zone');
  });

  it('lets the main zone expand when there is no aside content', () => {
    render(<WorkbenchLayout viewportBand="wide" main={<div>Main</div>} />);

    expect(screen.getByTestId('workbench-columns')).toHaveAttribute('data-layout', 'single');
    expect(screen.queryByTestId('workbench-aside')).not.toBeInTheDocument();
  });
});
