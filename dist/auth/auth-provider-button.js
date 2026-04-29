'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { renderElement } from '../lib/render-element.js';
import { cn } from '../lib/utils.js';
export function AuthProviderButton({ provider, label, icon, loading = false, loadingLabel = 'Loading...', lastUsed = false, lastUsedLabel = 'Last used', render, disabled, className, type = 'button', ...props }) {
    const resolvedIcon = icon ?? (provider === 'google' ? _jsx(GoogleIcon, {}) : null);
    const isDisabled = disabled || loading;
    const children = (_jsxs(_Fragment, { children: [resolvedIcon && (_jsx("span", { className: "flex size-5 shrink-0 items-center justify-center", "aria-hidden": "true", children: resolvedIcon })), _jsx("span", { className: "min-w-0 truncate", children: loading ? loadingLabel : label }), lastUsed && !loading && (_jsx("span", { "aria-hidden": "true", className: "ml-auto shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground", children: lastUsedLabel }))] }));
    const buttonProps = {
        type,
        disabled: isDisabled,
        'aria-busy': loading || undefined,
        'data-provider': provider,
        'data-last-used': lastUsed || undefined,
        className: cn('relative inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60', className),
        ...props,
        children,
    };
    if (render) {
        return renderElement(render, buttonProps);
    }
    return _jsx("button", { ...buttonProps });
}
function GoogleIcon() {
    return (_jsxs("svg", { viewBox: "0 0 24 24", className: "size-5", "aria-hidden": "true", children: [_jsx("path", { fill: "#4285F4", d: "M21.6 12.23c0-.82-.07-1.42-.22-2.05H12v3.72h5.51c-.11.92-.71 2.31-2.04 3.24l-.02.12 2.96 2.29.2.02c1.86-1.72 2.99-4.25 2.99-7.34z" }), _jsx("path", { fill: "#34A853", d: "M12 22c2.66 0 4.89-.88 6.52-2.39l-3.11-2.42c-.83.58-1.95.99-3.41.99a5.93 5.93 0 0 1-5.6-4.1l-.12.01-3.08 2.39-.04.11A9.85 9.85 0 0 0 12 22z" }), _jsx("path", { fill: "#FBBC05", d: "M6.4 14.08A6.17 6.17 0 0 1 6.07 12c0-.72.12-1.42.32-2.08l-.01-.13-3.12-2.42-.1.05A9.93 9.93 0 0 0 2.1 12c0 1.64.39 3.19 1.07 4.57l3.23-2.49z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.82c1.85 0 3.1.8 3.81 1.47l2.78-2.72C16.88 2.98 14.66 2 12 2a9.85 9.85 0 0 0-8.84 5.42l3.22 2.5A5.96 5.96 0 0 1 12 5.82z" })] }));
}
