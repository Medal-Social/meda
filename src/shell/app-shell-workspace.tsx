'use client';
import type { ReactNode } from 'react';
import type {
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
} from './types.js';

export function AppShellWorkspace({
  children,
}: {
  iconRail?: AppShellIconRailConfig;
  contextRail?: AppShellContextRailConfig;
  rightPanel?: AppShellRightPanelConfig;
  globalActions?: ReactNode;
  children: ReactNode;
}) {
  return <div data-testid="app-shell-workspace">{children}</div>;
}
