'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { AppShellAuth } from './app-shell-auth.js';
import { AppShellChat } from './app-shell-chat.js';
import { AppShellWorkspace } from './app-shell-workspace.js';
import { useMedaShell } from './shell-provider.js';
import type {
  AppShellAuthConfig,
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
  AppShellVariant,
} from './types.js';

export interface AppShellProps {
  variant: AppShellVariant;
  children: ReactNode;
  className?: string;

  // workspace + chat
  iconRail?: AppShellIconRailConfig;
  contextRail?: AppShellContextRailConfig;
  rightPanel?: AppShellRightPanelConfig;
  globalActions?: ReactNode;

  // auth
  auth?: AppShellAuthConfig;
}

export function AppShell({ variant, children, className, ...rest }: AppShellProps) {
  const { workspace, activeAppId } = useMedaShell();

  const wrapper = (content: ReactNode) => (
    <div
      data-meda-app={activeAppId}
      data-meda-workspace={workspace.id}
      data-meda-variant={variant}
      className={cn('h-screen overflow-hidden bg-background text-foreground', className)}
    >
      {content}
    </div>
  );

  switch (variant) {
    case 'auth':
      return wrapper(<AppShellAuth {...(rest.auth ?? { title: '' })}>{children}</AppShellAuth>);
    case 'workspace':
      return wrapper(
        <AppShellWorkspace
          iconRail={rest.iconRail}
          contextRail={rest.contextRail}
          rightPanel={rest.rightPanel}
          globalActions={rest.globalActions}
        >
          {children}
        </AppShellWorkspace>
      );
    case 'chat':
      return wrapper(<AppShellChat globalActions={rest.globalActions}>{children}</AppShellChat>);
  }
}

export function AppShellBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-[calc(100vh-var(--shell-header-height))] overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}
