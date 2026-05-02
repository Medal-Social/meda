'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '../lib/utils.js';
/** Vertical tab strip + content panel for the left sidebar. */
export function BuilderLeftTabs({ labels, blocksContent, designContent, envelopeContent, }) {
    const [tab, setTab] = useState('blocks');
    const tabs = [
        { id: 'blocks', label: labels.blocksTab, content: blocksContent },
        { id: 'envelope', label: labels.envelopeTab, content: envelopeContent },
    ];
    if (designContent) {
        tabs.splice(1, 0, { id: 'design', label: labels.designTab, content: designContent });
    }
    const active = tabs.find((t) => t.id === tab) ?? tabs[0];
    return (_jsxs("div", { "data-slot": "email-builder-left-tabs", className: "flex h-full flex-col", children: [_jsx("div", { role: "tablist", className: "flex border-border border-b", children: tabs.map((t) => (_jsx("button", { type: "button", role: "tab", "aria-selected": t.id === tab, onClick: () => setTab(t.id), className: cn('flex h-11 flex-1 items-center justify-center text-sm transition-colors', t.id === tab
                        ? 'border-primary border-b-2 font-medium text-foreground'
                        : 'text-muted-foreground hover:text-foreground'), children: t.label }, t.id))) }), _jsx("div", { role: "tabpanel", className: "flex-1 overflow-y-auto", children: active?.content })] }));
}
