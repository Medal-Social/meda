'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox } from '../components/ui/checkbox.js';
import { cn } from '../lib/utils.js';
/**
 * A Linear-style list row with checkbox, hover states, and click handling.
 * Compact ~40-48px height for dense, scannable lists.
 */
export function ListRow({ selected, selectionActive, onSelect, onClick, onMouseEnter, onMouseLeave, onFocus, onBlur, focused, children, className, }) {
    const isInteractive = !!onClick;
    const interactiveProps = isInteractive
        ? {
            role: 'button',
            tabIndex: 0,
            onClick,
            onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick?.();
                }
            },
        }
        : {};
    return (_jsxs("div", { ...interactiveProps, onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, onFocus: onFocus, onBlur: onBlur, className: cn('group relative flex items-center gap-3 border-border border-b px-3 py-2.5', 'transition-all duration-150', isInteractive && 'cursor-pointer hover:bg-accent/50', isInteractive &&
            "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:scale-y-0 before:bg-primary before:transition-transform before:duration-150 before:content-['']", isInteractive && 'hover:before:scale-y-100', isInteractive && 'focus-within:bg-accent/30 focus-within:before:scale-y-100', selected && isInteractive && 'before:!scale-y-100 bg-accent', selected && !isInteractive && 'bg-accent', focused &&
            isInteractive &&
            'before:!scale-y-100 bg-accent/30 ring-1 ring-primary/50 ring-inset', focused && !isInteractive && 'bg-accent/30 ring-1 ring-primary/50 ring-inset', className), children: [onSelect && (_jsx("div", { className: "w-6 flex-shrink-0", onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation(), children: _jsx(Checkbox, { checked: selected, onClick: (e) => {
                        e.preventDefault();
                        onSelect(!selected, e.shiftKey);
                    }, className: cn('transition-opacity', selectionActive || selected
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100') }) })), children] }));
}
export function ListCell({ width = 'flex-1', shrink = true, align = 'left', children, className, }) {
    return (_jsx("div", { className: cn(width, shrink === false && 'flex-shrink-0', align === 'center' && 'text-center', align === 'right' && 'text-right', 'min-w-0', // Allow truncation
        className), children: children }));
}
