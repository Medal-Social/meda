'use client';
import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useId, useLayoutEffect, useMemo } from 'react';
import { useMedaShell } from './shell-provider.js';
export function mergePanelViews(staticViews = [], registrations, staticDefaultView) {
    const panelViews = [];
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
export function useResolvedPanelViews(staticViews = [], staticDefaultView) {
    const { panelViews } = useMedaShell();
    return useMemo(() => mergePanelViews(staticViews, panelViews.registrations, staticDefaultView), [staticViews, panelViews.registrations, staticDefaultView]);
}
export function PanelViewsProvider({ views, defaultView, children }) {
    const { register } = useMedaShell().panelViews;
    const registrationId = useId();
    useLayoutEffect(() => {
        return register(registrationId, views, defaultView);
    }, [register, registrationId, views, defaultView]);
    return _jsx(_Fragment, { children: children });
}
