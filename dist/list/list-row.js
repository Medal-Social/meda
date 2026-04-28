import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Checkbox } from '../components/ui/checkbox.js';
import { cn } from '../lib/utils.js';
/**
 * A Linear-style list row with checkbox, hover states, and click handling.
 * Compact ~40-48px height for dense, scannable lists.
 */
export function ListRow({ selected, selectionActive, onSelect, onClick, onMouseEnter, onMouseLeave, onFocus, onBlur, focused, children, className, }) {
    return (_jsxs("div", { role: "button", tabIndex: 0, onClick: onClick, onKeyDown: (e) => e.key === 'Enter' && onClick?.(), onMouseEnter: onMouseEnter, onMouseLeave: onMouseLeave, onFocus: onFocus, onBlur: onBlur, className: cn('group relative flex items-center gap-3 border-border border-b px-3 py-2.5', 'cursor-pointer transition-all duration-150', 'hover:bg-accent/50', "before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:scale-y-0 before:bg-primary before:transition-transform before:duration-150 before:content-['']", 'hover:before:scale-y-100', 'focus-within:bg-accent/30 focus-within:before:scale-y-100', selected && 'before:!scale-y-100 bg-accent', focused && 'before:!scale-y-100 bg-accent/30 ring-1 ring-primary/50 ring-inset', className), children: [onSelect && (_jsx("div", { className: "w-6 flex-shrink-0", onClick: (e) => e.stopPropagation(), onKeyDown: (e) => e.stopPropagation(), children: _jsx(Checkbox, { checked: selected, onClick: (e) => {
                        e.preventDefault();
                        onSelect(!selected, e.shiftKey);
                    }, className: cn('transition-opacity', selectionActive || selected
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 data-[state=checked]:opacity-100') }) })), children] }));
}
export function ListCell({ width = 'flex-1', shrink = true, align = 'left', children, className, }) {
    return (_jsx("div", { className: cn(width, shrink && 'flex-shrink-0', align === 'center' && 'text-center', align === 'right' && 'text-right', 'min-w-0', // Allow truncation
        className), children: children }));
}
