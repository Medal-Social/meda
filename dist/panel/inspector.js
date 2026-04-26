import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function Inspector({ tabs, defaultTab, className }) {
    const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');
    const current = tabs.find((t) => t.id === active) ?? tabs[0];
    return (_jsxs("aside", { className: ['flex h-full flex-col border-l border-border bg-card', className ?? ''].join(' '), children: [_jsx("div", { role: "tablist", className: "flex gap-0.5 border-b border-border px-3.5", children: tabs.map((t) => (_jsx("button", { type: "button", role: "tab", "aria-selected": t.id === active, onClick: () => setActive(t.id), className: [
                        'border-b-2 px-2.5 py-3 text-xs',
                        t.id === active
                            ? 'border-primary text-foreground'
                            : 'border-transparent text-muted-foreground hover:text-foreground',
                    ].join(' '), children: t.label }, t.id))) }), _jsx("div", { className: "flex-1 overflow-y-auto px-4 pb-8 pt-4", children: current?.content })] }));
}
