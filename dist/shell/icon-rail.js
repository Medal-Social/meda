'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '../components/ui/tooltip.js';
import { cn } from '../lib/utils.js';
import { useShellViewport } from './use-shell-viewport.js';
// ---------------------------------------------------------------------------
// Item styling
// ---------------------------------------------------------------------------
function itemClass(isActive) {
    return cn('group relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors', isActive
        ? 'bg-primary/12 text-primary'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground');
}
export function RailDivider({ pinnedBottom, onToggle }) {
    return (_jsx("button", { type: "button", "data-testid": "rail-divider", onClick: onToggle, "aria-label": pinnedBottom ? 'Pull utility items up' : 'Push utility items down', className: cn('my-3 flex h-6 w-8 items-center justify-center rounded-md', 'text-muted-foreground hover:bg-accent hover:text-foreground transition-colors'), children: pinnedBottom ? (_jsx(ChevronUp, { size: 14, "aria-hidden": "true" })) : (_jsx(ChevronDown, { size: 14, "aria-hidden": "true" })) }));
}
// ---------------------------------------------------------------------------
// IconRail
// ---------------------------------------------------------------------------
export function IconRail({ mainItems, utilityItems = [], footer, activeId, renderLink, className, }) {
    const band = useShellViewport();
    const [pinnedBottom, setPinnedBottom] = useState(true);
    if (band === 'mobile')
        return null;
    const renderItem = (item) => {
        const isActive = item.id === activeId;
        const klass = itemClass(isActive);
        const IconComp = item.icon;
        const inner = (_jsxs(_Fragment, { children: [_jsx(IconComp, { size: 22, "aria-hidden": "true" }), item.badge ? _jsx("span", { className: "absolute right-1 top-1", children: item.badge }) : null] }));
        // The trigger render element carries the item class (active/inactive styling)
        // AND the data-testid. This means tests can fire mouseEnter on it to open
        // the tooltip AND check its className for active state in one selector.
        const triggerRender = _jsx("span", { "data-testid": `icon-rail-trigger-${item.id}`, className: klass });
        const linkContent = renderLink ? (
        // renderLink consumers receive the className so they can apply it themselves
        renderLink({ item, isActive, className: klass, children: inner })) : (_jsx("a", { href: item.to, "aria-label": item.label, "aria-current": isActive ? 'page' : undefined, className: "contents", children: inner }));
        return (_jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { render: triggerRender, children: linkContent }), _jsx(TooltipContent, { side: "right", children: item.label })] }, item.id));
    };
    return (_jsx(TooltipProvider, { children: _jsxs("nav", { "aria-label": "Primary", className: cn('flex h-full w-[var(--shell-rail-width)] shrink-0 flex-col items-center bg-shell-rail py-3.5', className), children: [_jsx("div", { className: "flex flex-col items-center gap-1", children: mainItems.map(renderItem) }), utilityItems.length > 0 && (_jsxs(_Fragment, { children: [_jsx(RailDivider, { pinnedBottom: pinnedBottom, onToggle: () => setPinnedBottom((prev) => !prev) }), _jsx("div", { "data-testid": "utility-items-wrapper", className: cn('flex flex-col items-center gap-1', pinnedBottom && 'mt-auto'), children: utilityItems.map(renderItem) })] })), footer && (_jsx("div", { className: cn('pt-3', pinnedBottom || utilityItems.length === 0 ? 'mt-auto' : ''), children: footer }))] }) }));
}
