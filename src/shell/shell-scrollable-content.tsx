import type { ReactNode } from 'react';
import type { ShellContentLayout } from './types';

export interface ShellScrollableContentProps {
  children: ReactNode;
  desktopDockOffset?: number;
  layout: ShellContentLayout;
  maxWidth?: number;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function ShellScrollableContent({
  children,
  desktopDockOffset = 0,
  layout,
  maxWidth,
}: ShellScrollableContentProps) {
  return (
    <main
      data-testid="shell-workspace-viewport"
      className="shell-scrollbar-hidden absolute inset-0 min-w-0 overflow-y-auto overflow-x-hidden pb-[var(--bottom-nav-height)] transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:pb-0"
      style={desktopDockOffset > 0 ? { paddingRight: `${desktopDockOffset}px` } : undefined}
    >
      {layout === 'centered' ? (
        <div
          data-testid="shell-content-centered"
          className="flex min-h-full items-center justify-center px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10"
        >
          <div className="flex w-full max-w-3xl items-center justify-center">{children}</div>
        </div>
      ) : layout === 'fullbleed' ? (
        <div
          data-testid="shell-content-fullbleed"
          className="mx-auto w-full px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10"
          style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
        >
          {children}
        </div>
      ) : (
        <div
          data-testid="shell-content-workspace"
          className={joinClasses('mx-auto w-full px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10')}
          style={maxWidth ? { maxWidth: `${maxWidth}px` } : undefined}
        >
          {children}
        </div>
      )}
    </main>
  );
}
