'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib/utils.js';
import { useMedaShell } from './shell-provider.js';
export function AppShell({ children, className }) {
    const { workspace, activeAppId } = useMedaShell();
    return (_jsx("div", { "data-meda-app": activeAppId, "data-meda-workspace": workspace.id, className: cn('h-screen overflow-hidden bg-background text-foreground', className), children: children }));
}
export function AppShellBody({ children, className }) {
    return (_jsx("div", { className: cn('relative flex h-[calc(100vh-var(--shell-header-height))] overflow-hidden', className), children: children }));
}
