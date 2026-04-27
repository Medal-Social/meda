'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { CheckIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '../../lib/utils.js';
function DropdownMenu({ ...props }) {
    return _jsx(MenuPrimitive.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuPortal({ ...props }) {
    return _jsx(MenuPrimitive.Portal, { "data-slot": "dropdown-menu-portal", ...props });
}
function DropdownMenuTrigger({ render, children, ...props }) {
    // Function render is passed through directly to Base UI
    if (typeof render === 'function') {
        return (_jsx(MenuPrimitive.Trigger, { "data-slot": "dropdown-menu-trigger", render: render, ...props, children: children }));
    }
    if (render) {
        return (_jsx(MenuPrimitive.Trigger, { "data-slot": "dropdown-menu-trigger", render: render, ...props, children: children }));
    }
    return (_jsx(MenuPrimitive.Trigger, { "data-slot": "dropdown-menu-trigger", ...props, children: children }));
}
function DropdownMenuContent({ align = 'start', alignOffset = 0, side = 'bottom', sideOffset = 4, className, ...props }) {
    return (_jsx(MenuPrimitive.Portal, { children: _jsx(MenuPrimitive.Positioner, { className: "isolate z-50 outline-none", align: align, alignOffset: alignOffset, side: side, sideOffset: sideOffset, children: _jsx(MenuPrimitive.Popup, { "data-slot": "dropdown-menu-content", className: cn('data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=inline-end]:slide-in-from-left-2 z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-y-auto overflow-x-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md outline-none ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in data-closed:overflow-hidden', className), ...props }) }) }));
}
function DropdownMenuGroup({ ...props }) {
    return _jsx(MenuPrimitive.Group, { "data-slot": "dropdown-menu-group", ...props });
}
function DropdownMenuLabel({ className, inset, ...props }) {
    return (_jsx(MenuPrimitive.GroupLabel, { "data-slot": "dropdown-menu-label", "data-inset": inset, className: cn('px-1.5 py-1 font-medium text-muted-foreground text-xs data-[inset]:pl-8', className), ...props }));
}
function DropdownMenuItem({ className, inset, variant = 'default', render, onClick, onSelect, children, ...props }) {
    const handleClick = onClick || onSelect
        ? (event) => {
            onSelect?.(event);
            onClick?.(event);
        }
        : undefined;
    const itemClassName = cn("focus:bg-accent focus:text-accent-foreground focus:*:[svg]:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:*:[svg]:text-destructive data-[variant=destructive]:focus:bg-destructive data-[variant=destructive]:focus:text-destructive-foreground data-[variant=destructive]:focus:*:[svg]:text-destructive-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm [&_svg:not([class*='size-'])]:size-4 group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0", className);
    if (render) {
        return (_jsx(MenuPrimitive.Item, { "data-slot": "dropdown-menu-item", "data-inset": inset, "data-variant": variant, className: itemClassName, render: render, onClick: handleClick, ...props, children: children }));
    }
    return (_jsx(MenuPrimitive.Item, { "data-slot": "dropdown-menu-item", "data-inset": inset, "data-variant": variant, className: itemClassName, onClick: handleClick, ...props, children: children }));
}
function DropdownMenuSub({ ...props }) {
    return _jsx(MenuPrimitive.SubmenuRoot, { "data-slot": "dropdown-menu-sub", ...props });
}
function DropdownMenuSubTrigger({ className, inset, children, ...props }) {
    return (_jsxs(MenuPrimitive.SubmenuTrigger, { "data-slot": "dropdown-menu-sub-trigger", "data-inset": inset, className: cn("flex cursor-default select-none items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-open:bg-accent data-[inset]:pl-8 data-open:text-accent-foreground [&>[data-chevron]]:transition-transform [&>[data-chevron]]:duration-200 data-open:[&>[data-chevron]]:rotate-90 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className), ...props, children: [children, _jsx(ChevronRightIcon, { "data-chevron": "", className: "ml-auto" })] }));
}
function DropdownMenuSubContent({ align = 'start', alignOffset = -3, side = 'right', sideOffset = 0, className, ...props }) {
    return (_jsx(DropdownMenuContent, { "data-slot": "dropdown-menu-sub-content", className: cn('data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 w-auto min-w-[96px] rounded-md bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-100 data-closed:animate-out data-open:animate-in', className), align: align, alignOffset: alignOffset, side: side, sideOffset: sideOffset, ...props }));
}
function DropdownMenuCheckboxItem({ className, children, checked, ...props }) {
    return (_jsxs(MenuPrimitive.CheckboxItem, { "data-slot": "dropdown-menu-checkbox-item", className: cn("relative flex cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className), checked: checked, ...props, children: [_jsx("span", { className: "pointer-events-none pointer-events-none absolute right-2 flex items-center justify-center", "data-slot": "dropdown-menu-checkbox-item-indicator", children: _jsx(MenuPrimitive.CheckboxItemIndicator, { children: _jsx(CheckIcon, {}) }) }), children] }));
}
function DropdownMenuRadioGroup({ ...props }) {
    return _jsx(MenuPrimitive.RadioGroup, { "data-slot": "dropdown-menu-radio-group", ...props });
}
function DropdownMenuRadioItem({ className, children, ...props }) {
    return (_jsxs(MenuPrimitive.RadioItem, { "data-slot": "dropdown-menu-radio-item", className: cn("relative flex cursor-default select-none items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0", className), ...props, children: [_jsx("span", { className: "pointer-events-none pointer-events-none absolute right-2 flex items-center justify-center", "data-slot": "dropdown-menu-radio-item-indicator", children: _jsx(MenuPrimitive.RadioItemIndicator, { children: _jsx(CheckIcon, {}) }) }), children] }));
}
function DropdownMenuSeparator({ className, ...props }) {
    return (_jsx(MenuPrimitive.Separator, { "data-slot": "dropdown-menu-separator", className: cn('-mx-1 my-1 h-px bg-border', className), ...props }));
}
function DropdownMenuShortcut({ className, ...props }) {
    return (_jsx("span", { "data-slot": "dropdown-menu-shortcut", className: cn('ml-auto text-muted-foreground text-xs tracking-widest group-focus/dropdown-menu-item:text-accent-foreground', className), ...props }));
}
export { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, };
