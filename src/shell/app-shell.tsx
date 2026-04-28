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
} from './types.js';

interface AppShellBaseProps {
  children: ReactNode;
  className?: string;
}

export type AppShellProps = AppShellBaseProps &
  (
    | {
        variant: 'auth';
        auth: AppShellAuthConfig;
      }
    | {
        variant: 'workspace';
        iconRail?: AppShellIconRailConfig;
        contextRail?: AppShellContextRailConfig;
        rightPanel?: AppShellRightPanelConfig;
        globalActions?: ReactNode;
      }
    | {
        variant: 'chat';
        globalActions?: ReactNode;
      }
  );

export function AppShell(props: AppShellProps) {
  const { workspace, activeAppId } = useMedaShell();

  const wrapper = (content: ReactNode) => (
    <div
      data-meda-app={activeAppId}
      data-meda-workspace={workspace.id}
      data-meda-variant={props.variant}
      className={cn('h-screen overflow-hidden bg-background text-foreground', props.className)}
    >
      {content}
    </div>
  );

  switch (props.variant) {
    case 'auth':
      return wrapper(<AppShellAuth {...props.auth}>{props.children}</AppShellAuth>);
    case 'workspace':
      return wrapper(
        <AppShellWorkspace
          iconRail={props.iconRail}
          contextRail={props.contextRail}
          rightPanel={props.rightPanel}
          globalActions={props.globalActions}
        >
          {props.children}
        </AppShellWorkspace>
      );
    case 'chat':
      return wrapper(
        <AppShellChat globalActions={props.globalActions}>{props.children}</AppShellChat>
      );
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
