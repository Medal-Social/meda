'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { AppShellAuth } from './app-shell-auth.js';
import { AppShellChat } from './app-shell-chat.js';
import { AppShellWorkspace } from './app-shell-workspace.js';
import { useMedaShell } from './shell-provider.js';
import type {
  AppShellAuthBranding,
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
        auth?: AppShellAuthConfig;
        branding?: AppShellAuthBranding;
        preview?: ReactNode;
        actions?: ReactNode;
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

  // Auth lets the form scroll past viewport (signup, dense forms, high zoom);
  // workspace and chat fix the chrome to viewport height and let inner regions
  // scroll independently.
  const heightClass = props.variant === 'auth' ? 'min-h-screen' : 'h-screen overflow-hidden';

  const wrapper = (content: ReactNode) => (
    <div
      data-meda-app={activeAppId}
      data-meda-workspace={workspace.id}
      data-meda-variant={props.variant}
      className={cn(heightClass, 'bg-background text-foreground', props.className)}
    >
      {content}
    </div>
  );

  switch (props.variant) {
    case 'auth':
      return wrapper(<AppShellAuth {...resolveAuthConfig(props)}>{props.children}</AppShellAuth>);
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

function resolveAuthConfig(props: Extract<AppShellProps, { variant: 'auth' }>): AppShellAuthConfig {
  const { auth, branding } = props;

  return {
    title: auth?.title ?? branding?.appName ?? branding?.brandName ?? 'Sign in',
    description: auth?.description ?? branding?.tagline,
    brandName: auth?.brandName ?? branding?.brandName,
    brandMark: auth?.brandMark ?? branding?.brandMark,
    eyebrow: auth?.eyebrow,
    preview: auth?.preview ?? props.preview,
    actions: auth?.actions ?? props.actions,
  };
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
