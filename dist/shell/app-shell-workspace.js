'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LayoutGrid, Menu, PanelTop, Sparkles } from 'lucide-react';
import { ContextRail } from './context-rail.js';
import { IconRail } from './icon-rail.js';
import { MobileBottomNav } from './internal/mobile-bottom-nav.js';
import { MobileDrawers } from './internal/mobile-drawers.js';
import { MobileHeader } from './internal/mobile-header.js';
import { RightPanel } from './right-panel.js';
import { ShellHeader } from './shell-header.js';
import { ShellMain } from './shell-main.js';
import { useShellViewport } from './use-shell-viewport.js';
export function AppShellWorkspace({ iconRail, contextRail, rightPanel, globalActions, children, }) {
    const viewport = useShellViewport();
    const isMobile = viewport === 'mobile';
    // Derive the bottom-nav items from the variant config so each button maps
    // to a drawer that actually has content. Without this filter, partial
    // configs (e.g. iconRail only) would show Module/Panels/AI buttons that
    // dispatch into the void.
    const navItems = buildMobileNavItems(iconRail, contextRail, rightPanel);
    const hasDrawerContent = navItems.length > 0;
    // Mobile menu drawer needs both main and utility items — desktop IconRail
    // shows both, so dropping utilityItems here would orphan items like Help/
    // Settings on mobile. Concat preserves discoverability; visual separation
    // (divider in the drawer between main and utility) is a future polish.
    const mobileMenuItems = iconRail ? [...iconRail.mainItems, ...(iconRail.utilityItems ?? [])] : [];
    // ONE tree shape across both viewports. ShellMain stays at a fixed position
    // in its parent's children array so React preserves its subtree (and the
    // user's `children` state) when useShellViewport flips after mount or on
    // rotation. Conditional siblings render as `false` rather than disappearing.
    //
    // h-screen (not h-full) so this stays a bounded scroll container even when
    // rendered without an explicit-height ancestor (tests, direct imports). The
    // <AppShell> wrapper already enforces h-screen for the workspace variant, so
    // nested viewport-height divs collapse cleanly — no double-scroll.
    return (_jsxs("div", { className: "flex h-screen flex-col", children: [isMobile ? (_jsx(MobileHeader, { globalActions: globalActions })) : (_jsx(ShellHeader, { globalActions: globalActions })), _jsxs("div", { className: "relative flex flex-1 overflow-hidden", children: [!isMobile && iconRail && (_jsx(IconRail, { mainItems: iconRail.mainItems, utilityItems: iconRail.utilityItems, footer: iconRail.footer, activeId: iconRail.activeId, renderLink: iconRail.renderLink })), !isMobile && contextRail && (_jsx(ContextRail, { appId: contextRail.appId, module: contextRail.module, activeItemId: contextRail.activeItemId })), _jsx(ShellMain, { layout: "workspace", children: children }), !isMobile && rightPanel && (_jsx(RightPanel, { panelViews: rightPanel.panelViews, defaultView: rightPanel.defaultView }))] }), isMobile && hasDrawerContent && _jsx(MobileBottomNav, { items: navItems }), isMobile && hasDrawerContent && (_jsx(MobileDrawers, { menuItems: mobileMenuItems, menuActiveId: iconRail?.activeId, menuRenderLink: iconRail?.renderLink, module: contextRail?.module, panelViews: rightPanel?.panelViews ?? [], defaultView: rightPanel?.defaultView }))] }));
}
function buildMobileNavItems(iconRail, contextRail, rightPanel) {
    const items = [];
    if (iconRail) {
        items.push({ id: 'menu', label: 'Menu', icon: Menu, opens: 'menu-drawer' });
    }
    if (contextRail?.module) {
        items.push({ id: 'module', label: 'Module', icon: LayoutGrid, opens: 'module-drawer' });
    }
    // Panels button only when there's an actual view to render — empty
    // panelViews would open an empty drawer (dead-end tap).
    if (rightPanel && rightPanel.panelViews.length > 0) {
        items.push({ id: 'panels', label: 'Panels', icon: PanelTop, opens: 'panels-drawer' });
        if (rightPanel.panelViews.some((v) => v.id === 'ai')) {
            items.push({ id: 'ai', label: 'AI', icon: Sparkles, opens: 'ai-drawer' });
        }
    }
    return items;
}
