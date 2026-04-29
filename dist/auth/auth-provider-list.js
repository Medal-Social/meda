'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Children, isValidElement } from 'react';
import { cn } from '../lib/utils.js';
export function AuthProviderList({ children, className, label = 'Authentication providers', ...props }) {
    return (_jsx("ul", { "aria-label": label, className: cn('flex w-full flex-col gap-3', className), ...props, children: Children.toArray(children).map((child, index) => (_jsx("li", { className: "contents", children: child }, isValidElement(child) && child.key != null ? child.key : index))) }));
}
