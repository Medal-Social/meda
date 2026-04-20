import type { ReactNode } from 'react';
import type { ShellContentLayout, ShellTab, ShellViewDefinition } from './types';

interface ShellRouteMatchLike {
  handle?: unknown;
  params?: Record<string, string | undefined>;
}

function getLastMatch(matches: ShellRouteMatchLike[]) {
  return matches[matches.length - 1];
}

function getRouteHandle(match: ShellRouteMatchLike | undefined) {
  return match?.handle as ShellViewDefinition | undefined;
}

export function getShellContentLayoutFromMatches(matches: ShellRouteMatchLike[]): ShellContentLayout {
  return getRouteHandle(getLastMatch(matches))?.shellContentLayout ?? 'workspace';
}

export function getShellTabsFromMatches(matches: ShellRouteMatchLike[], pathname: string): ShellTab[] {
  const lastMatch = getLastMatch(matches);
  const shellTabs = getRouteHandle(lastMatch)?.shellTabs;

  if (!shellTabs) return [];

  if (typeof shellTabs === 'function') {
    return shellTabs({ params: lastMatch.params ?? {}, pathname });
  }

  return shellTabs;
}

export function getShellActionsFromMatches(
  matches: ShellRouteMatchLike[],
  pathname: string
): ReactNode {
  const lastMatch = getLastMatch(matches);
  const shellActions = getRouteHandle(lastMatch)?.shellActions;

  if (!shellActions) return null;

  if (typeof shellActions === 'function') {
    return shellActions({ params: lastMatch.params ?? {}, pathname });
  }

  return shellActions;
}

export function getShellPanelViewsFromMatches(matches: ShellRouteMatchLike[]) {
  return getRouteHandle(getLastMatch(matches))?.shellPanelViews;
}
