import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function EventCard({ event, size = 'default', onSelect, className }) {
    const isLive = event.isLive ?? false;
    const isSelected = event.selected ?? false;
    const isError = event.kind === 'error';
    const liveClasses = isLive
        ? 'border-emerald-500/40 bg-gradient-to-b from-emerald-500/10 to-card'
        : '';
    const errorClasses = isError ? 'border-destructive/40' : '';
    const selectedClasses = isSelected
        ? 'border-primary/60 bg-primary/[0.10] shadow-[0_4px_12px_rgba(0,0,0,0.15)]'
        : '';
    const sizeClasses = size === 'tiny' ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-2 text-xs';
    return (_jsxs("button", { type: "button", "data-live": String(isLive), "data-selected": String(isSelected), "data-kind": event.kind, onClick: () => onSelect?.(event), className: [
            'relative w-full cursor-pointer rounded-md border border-border bg-card text-left transition-[border-color,transform] duration-100',
            'hover:translate-x-px hover:border-primary/40',
            sizeClasses,
            liveClasses,
            errorClasses,
            selectedClasses,
            className ?? '',
        ].join(' '), children: [_jsx("span", { "aria-hidden": "true", className: "absolute -left-2.5 top-1/2 h-px w-2.5 bg-border" }), _jsxs("span", { className: "flex items-center gap-1.5 font-medium", children: [isLive && _jsx(LiveDot, {}), _jsx("span", { className: "min-w-0 flex-1 truncate", children: event.primary })] }), size === 'default' && event.secondary != null && (_jsx("span", { className: "mt-0.5 block text-[10px] text-muted-foreground tabular-nums", children: event.secondary }))] }));
}
function LiveDot() {
    return (_jsx("span", { "aria-hidden": "true", className: "inline-block size-1.5 shrink-0 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.20)]" }));
}
