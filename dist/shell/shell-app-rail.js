import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
function joinClasses(...values) {
    return values.filter(Boolean).join(' ');
}
function RailDivider({ pinned, onToggle }) {
    return (_jsx("div", { className: "group flex w-full items-center justify-center py-4", children: _jsxs("button", { type: "button", "aria-label": pinned ? 'Push items down' : 'Push items up', onClick: onToggle, className: "flex cursor-pointer flex-col items-center gap-0.5", children: [_jsx("span", { className: "hidden h-3.5 w-6 items-center justify-center text-[var(--app-rail-foreground)] transition-colors group-hover:flex", children: pinned ? _jsx(ChevronDown, { size: 14 }) : _jsx(ChevronUp, { size: 14 }) }), _jsx("span", { className: "block h-0.5 w-6 rounded-full bg-[var(--app-rail-foreground)]/30 transition-colors group-hover:bg-[var(--primary)]" })] }) }));
}
function RailSection({ items, isItemActive, renderLink, ariaLabel, className, }) {
    return (_jsx("nav", { "aria-label": ariaLabel, className: className, children: items.map((item) => {
            const isActive = isItemActive(item);
            const Icon = item.icon;
            return renderLink({
                item,
                isActive,
                className: joinClasses('flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-2.5 text-center transition-colors', isActive
                    ? 'bg-[var(--app-rail-item-active-bg)] text-[var(--foreground)]'
                    : 'text-[var(--app-rail-foreground)] hover:bg-[var(--surface-highlight)] hover:text-[var(--foreground)]'),
                children: (_jsxs(_Fragment, { children: [_jsx(Icon, { size: 22 }), _jsx("span", { className: "text-[10px] font-medium leading-none", children: item.label })] })),
            });
        }) }));
}
export function ShellAppRail({ mainItems, utilityItems, className, footer, isItemActive, renderLink, }) {
    const [pinned, setPinned] = useState(false);
    return (_jsxs("div", { className: joinClasses('flex w-[var(--app-rail-width)] shrink-0 flex-col items-center bg-[var(--app-rail)] px-2 py-4', className), children: [_jsx(RailSection, { items: mainItems, isItemActive: isItemActive, renderLink: renderLink, ariaLabel: "Main navigation", className: "flex flex-col items-center gap-1.5" }), _jsx("div", { className: joinClasses('transition-[flex-grow] duration-300 ease-in-out', pinned ? 'grow-0' : 'grow') }), _jsx(RailDivider, { pinned: pinned, onToggle: () => setPinned(!pinned) }), _jsx(RailSection, { items: utilityItems, isItemActive: isItemActive, renderLink: renderLink, ariaLabel: "Utility navigation", className: "mb-2 flex flex-col items-center gap-1" }), _jsx("div", { className: joinClasses('transition-[flex-grow] duration-300 ease-in-out', pinned ? 'grow' : 'grow-0') }), footer] }));
}
