'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '../components/ui/drawer.js';
/** Generic bottom-sheet drawer used for the mobile palette/inspector. */
export function MobileDrawer({ open, onOpenChange, title, children }) {
    return (_jsx(Drawer, { open: open, onOpenChange: onOpenChange, children: _jsxs(DrawerContent, { children: [_jsx(DrawerHeader, { children: _jsx(DrawerTitle, { children: title }) }), _jsx("div", { className: "max-h-[70vh] overflow-y-auto px-4 pb-6", children: children })] }) }));
}
