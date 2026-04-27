import type { ReactNode } from 'react';
import type { ShellViewportBand } from './types.js';

export interface WorkbenchLayoutProps {
  viewportBand: ShellViewportBand;
  main: ReactNode;
  aside?: ReactNode;
  toolbar?: ReactNode;
  className?: string;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function getWorkbenchMaxWidth(viewportBand: ShellViewportBand) {
  if (viewportBand === 'desktop') return 1440;
  if (viewportBand === 'wide') return 1760;
  if (viewportBand === 'ultrawide') return 1920;
  return undefined;
}

export function WorkbenchLayout({
  viewportBand,
  main,
  aside,
  toolbar,
  className,
}: WorkbenchLayoutProps) {
  const maxWidth = getWorkbenchMaxWidth(viewportBand);
  const layout = !aside
    ? 'single'
    : viewportBand === 'mobile' || viewportBand === 'tablet'
      ? 'stacked'
      : viewportBand === 'desktop'
        ? 'split'
        : 'multi-zone';

  const columnStyle =
    layout === 'split'
      ? { gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 320px)' }
      : layout === 'multi-zone'
        ? { gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 360px)' }
        : undefined;

  return (
    <section
      data-testid="workbench-layout"
      data-band={viewportBand}
      className={joinClasses('mx-auto flex w-full flex-col gap-6', className)}
      style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
    >
      {toolbar ? <div data-testid="workbench-toolbar">{toolbar}</div> : null}
      <div
        data-testid="workbench-columns"
        data-layout={layout}
        className={joinClasses(
          'w-full gap-5',
          layout === 'stacked' ? 'flex flex-col' : layout === 'single' ? 'flex flex-col' : 'grid'
        )}
        style={columnStyle}
      >
        <div data-testid="workbench-main" className="min-w-0">
          {main}
        </div>
        {aside ? (
          <aside data-testid="workbench-aside" className="min-w-0">
            {aside}
          </aside>
        ) : null}
      </div>
    </section>
  );
}
