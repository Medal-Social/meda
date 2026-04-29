'use client';

import { type ReactNode, useId, useLayoutEffect, useMemo } from 'react';
import { type PanelViewRegistration, useMedaShell } from './shell-provider.js';
import type { PanelView } from './types.js';

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

export function PanelViewsProvider({ views, defaultView, children }: PanelViewsProviderProps) {
  const { register } = useMedaShell().panelViews;
  const registrationId = useId();

  useLayoutEffect(() => {
    return register(registrationId, views, defaultView);
  }, [register, registrationId, views, defaultView]);

  return <>{children}</>;
}
