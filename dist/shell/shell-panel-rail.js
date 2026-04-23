import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function joinClasses(...values) {
    return values.filter(Boolean).join(' ');
}
function PanelRailButtons({ views, activePanelView, onTogglePanelView, }) {
    return (_jsx("div", { className: "flex w-full flex-col items-center gap-1", children: views.map(({ id, label, icon: Icon }) => {
            const isActive = activePanelView === id;
            return (_jsxs("button", { type: "button", "aria-label": label, "aria-pressed": isActive, onClick: () => onTogglePanelView(id), className: joinClasses('flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[var(--app-rail-foreground)] transition-colors', isActive
                    ? 'bg-[var(--app-rail-item-active-bg)] text-[var(--foreground)]'
                    : 'hover:bg-[var(--surface-highlight)] hover:text-[var(--foreground)]'), children: [_jsx(Icon, { size: 16 }), _jsx("span", { className: "text-[9px] font-medium leading-none", children: label })] }, id));
        }) }));
}
export function ShellPanelRail({ moduleViews, globalViews, activePanelView, className, onTogglePanelView, }) {
    if (moduleViews.length === 0 && globalViews.length === 0)
        return null;
    return (_jsxs("aside", { "aria-label": "Panel rail", className: joinClasses('flex h-full w-[var(--right-rail-width)] shrink-0 flex-col items-center bg-[var(--app-rail)] px-1.5 py-3', className), children: [_jsx(PanelRailButtons, { views: moduleViews, activePanelView: activePanelView, onTogglePanelView: onTogglePanelView }), _jsx("div", { className: "grow" }), _jsx(PanelRailButtons, { views: globalViews, activePanelView: activePanelView, onTogglePanelView: onTogglePanelView })] }));
}
