'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib/utils.js';
import { AppShellAuth } from './app-shell-auth.js';
import { AppShellChat } from './app-shell-chat.js';
import { AppShellWorkspace } from './app-shell-workspace.js';
import { useMedaShell } from './shell-provider.js';
export function AppShell(props) {
    const { workspace, activeAppId } = useMedaShell();
    // Auth lets the form scroll past viewport (signup, dense forms, high zoom);
    // workspace and chat fix the chrome to viewport height and let inner regions
    // scroll independently.
    const heightClass = props.variant === 'auth' ? 'min-h-screen' : 'h-screen overflow-hidden';
    const wrapper = (content) => (_jsx("div", { "data-meda-app": activeAppId, "data-meda-workspace": workspace.id, "data-meda-variant": props.variant, className: cn(heightClass, 'bg-background text-foreground', props.className), children: content }));
    switch (props.variant) {
        case 'auth':
            return wrapper(_jsx(AppShellAuth, { ...resolveAuthConfig(props), children: props.children }));
        case 'workspace':
            return wrapper(_jsx(AppShellWorkspace, { iconRail: props.iconRail, contextRail: props.contextRail, rightPanel: props.rightPanel, workspace: props.workspace, appTabs: props.appTabs, globalActions: props.globalActions, headerCenter: props.headerCenter, banners: props.banners, mainLayout: props.mainLayout, mainClassName: props.mainClassName, children: props.children }));
        case 'chat':
            return wrapper(_jsx(AppShellChat, { globalActions: props.globalActions, children: props.children }));
    }
}
function resolveAuthConfig(props) {
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
export function AppShellBody({ children, className }) {
    return (_jsx("div", { className: cn('relative flex h-[calc(100vh-var(--shell-header-height))] overflow-hidden', className), children: children }));
}
