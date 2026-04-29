'use client';

import { type ReactNode, useId, useLayoutEffect, useMemo, useRef } from 'react';
import { type PanelViewRegistration, useMedaShell } from './shell-provider.js';
import type { PanelView, ShellRenderContext } from './types.js';

export interface PanelViewsProviderProps {
  views: PanelView[];
  defaultView?: string;
  children: ReactNode;
}

export interface ResolvedPanelViews {
  panelViews: PanelView[];
  defaultView?: string;
}

export function mergePanelViews(
  staticViews: PanelView[] = [],
  registrations: PanelViewRegistration[],
  staticDefaultView?: string
): ResolvedPanelViews {
  const panelViews: PanelView[] = [];

  for (const view of staticViews) {
    panelViews.push(view);
  }

  let defaultView = staticDefaultView;

  for (const registration of registrations) {
    for (const view of registration.views) {
      const previousIndex = panelViews.findIndex((existingView) => existingView.id === view.id);
      if (previousIndex >= 0) {
        panelViews.splice(previousIndex, 1);
      }
      panelViews.push(view);
    }
    if (registration.defaultView !== undefined) {
      defaultView = registration.defaultView;
    }
  }

  return defaultView === undefined ? { panelViews } : { panelViews, defaultView };
}

export function useResolvedPanelViews(
  staticViews: PanelView[] = [],
  staticDefaultView?: string
): ResolvedPanelViews {
  const { panelViews } = useMedaShell();

  return useMemo(
    () => mergePanelViews(staticViews, panelViews.registrations, staticDefaultView),
    [staticViews, panelViews.registrations, staticDefaultView]
  );
}

function getPanelViewsSignature(views: PanelView[]): string {
  return views.map((view) => `${view.id}\u001f${view.label}`).join('\u001e');
}

export function PanelViewsProvider({ views, defaultView, children }: PanelViewsProviderProps) {
  const { register } = useMedaShell().panelViews;
  const registrationId = useId();
  const latestViewsRef = useRef(views);
  latestViewsRef.current = views;

  const viewsSignature = getPanelViewsSignature(views);
  const registeredViewsRef = useRef<{ signature: string; views: PanelView[] } | null>(null);
  if (registeredViewsRef.current?.signature !== viewsSignature) {
    registeredViewsRef.current = {
      signature: viewsSignature,
      views: views.map((view) => ({
        id: view.id,
        label: view.label,
        icon: view.icon,
        render: (ctx: ShellRenderContext) =>
          latestViewsRef.current.find((currentView) => currentView.id === view.id)?.render(ctx) ??
          null,
      })),
    };
  }
  const registeredViews = registeredViewsRef.current.views;

  useLayoutEffect(() => {
    return register(registrationId, registeredViews, defaultView);
  }, [register, registrationId, registeredViews, defaultView]);

  return <>{children}</>;
}
