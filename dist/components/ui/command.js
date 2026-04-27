'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Command as CommandPrimitive } from 'cmdk';
import { SearchIcon } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog.js';
function Command({ className, ...props }) {
    return (_jsx(CommandPrimitive, { "data-slot": "command", className: cn('flex size-full flex-col overflow-hidden bg-popover text-popover-foreground', className), ...props }));
}
function CommandDialog({ title = 'Command Palette', description = 'Search for a command to run...', children, className, showCloseButton = false, ...props }) {
    return (_jsxs(Dialog, { ...props, children: [_jsxs(DialogHeader, { className: "sr-only", children: [_jsx(DialogTitle, { children: title }), _jsx(DialogDescription, { children: description })] }), _jsx(DialogContent, { className: cn('top-[38%] overflow-hidden rounded-xl! p-0 sm:max-w-2xl', className), showCloseButton: showCloseButton, children: children })] }));
}
function CommandInput({ className, ...props }) {
    return (_jsxs("div", { "data-slot": "command-input-wrapper", className: "flex items-center gap-3 border-b px-4 py-3", children: [_jsx(SearchIcon, { className: "size-5 shrink-0 text-muted-foreground/60" }), _jsx(CommandPrimitive.Input, { "data-slot": "command-input", className: cn('flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60 disabled:cursor-not-allowed disabled:opacity-50', className), ...props })] }));
}
function CommandList({ className, ...props }) {
    return (_jsx(CommandPrimitive.List, { "data-slot": "command-list", className: cn('no-scrollbar max-h-[400px] scroll-py-1 overflow-y-auto overflow-x-hidden p-2 outline-none', className), ...props }));
}
function CommandEmpty({ className, ...props }) {
    return (_jsx(CommandPrimitive.Empty, { "data-slot": "command-empty", className: cn('py-6 text-center text-sm', className), ...props }));
}
function CommandGroup({ className, ...props }) {
    return (_jsx(CommandPrimitive.Group, { "data-slot": "command-group", className: cn('overflow-hidden text-foreground [&:first-child_[cmdk-group-heading]]:pt-1 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-4 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground/70 [&_[cmdk-group-heading]]:text-xs', className), ...props }));
}
function CommandSeparator({ className, ...props }) {
    return (_jsx(CommandPrimitive.Separator, { "data-slot": "command-separator", className: cn('-mx-1 h-px bg-border', className), ...props }));
}
function CommandItem({ className, children, ...props }) {
    return (_jsx(CommandPrimitive.Item, { "data-slot": "command-item", className: cn("group/command-item relative flex cursor-default select-none items-center gap-3 rounded-lg px-3 py-2 text-sm outline-hidden data-[disabled=true]:pointer-events-none data-selected:bg-accent data-selected:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:text-muted-foreground data-selected:[&_svg]:text-accent-foreground", className), ...props, children: children }));
}
function CommandShortcut({ className, ...props }) {
    return (_jsx("span", { "data-slot": "command-shortcut", className: cn('ml-auto text-muted-foreground text-xs tracking-widest group-data-selected/command-item:text-foreground', className), ...props }));
}
export { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut, };
