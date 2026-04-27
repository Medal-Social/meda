'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../lib/utils.js';
const layoutClass = {
    workspace: 'mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8',
    centered: 'mx-auto w-full max-w-2xl px-4 py-6 sm:px-6',
    fullbleed: 'w-full',
};
export function ShellMain({ layout = 'workspace', className, children }) {
    return (_jsx("main", { "data-meda-shell-main-layout": layout, className: cn('flex-1 min-w-0 overflow-y-auto bg-shell-main', '[content-visibility:auto]', layoutClass[layout], className), children: children }));
}
