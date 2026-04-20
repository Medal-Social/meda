import type { ReactNode } from 'react';

export function ShellFrame({
  header,
  navigation,
  mobileSidebar,
  mobileHeader,
  tabBar,
  content,
  desktopDock,
  tabletPanel,
  mobileBottomNav,
  commandPalette,
}: {
  header: ReactNode;
  navigation: ReactNode;
  mobileSidebar?: ReactNode;
  mobileHeader?: ReactNode;
  tabBar?: ReactNode;
  content: ReactNode;
  desktopDock?: ReactNode;
  tabletPanel?: ReactNode;
  mobileBottomNav?: ReactNode;
  commandPalette?: ReactNode;
}) {
  return (
    <div
      data-testid="shell-frame"
      className="flex h-screen w-full flex-1 flex-col overflow-hidden bg-[var(--background)]"
    >
      {header}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {navigation}
        {mobileSidebar}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {mobileHeader}
          {tabBar}
          <div className="relative min-h-0 flex-1 overflow-hidden">
            {content}
            {desktopDock}
          </div>
        </div>

        {tabletPanel}
        {mobileBottomNav}
      </div>

      {commandPalette}
    </div>
  );
}
