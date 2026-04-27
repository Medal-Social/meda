'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MarketingCtaList } from './marketing-cta-list.js';
import { cx } from './utils.js';
export function MarketingCallout({ eyebrow, title, description, children, ctas, variant = 'band', align = 'center', className, }) {
    const isCard = variant === 'card';
    return (_jsx("section", { className: cx('relative overflow-hidden border border-border bg-card text-card-foreground', isCard ? 'rounded-lg px-6 py-8 shadow-sm' : 'px-6 py-14 sm:px-8 sm:py-16', className), children: _jsxs("div", { className: cx('mx-auto flex max-w-4xl flex-col gap-5', align === 'center' ? 'items-center text-center' : 'items-start text-left'), children: [eyebrow && _jsx("p", { className: "text-sm font-semibold text-primary", children: eyebrow }), _jsx("h2", { className: "max-w-3xl text-3xl font-bold leading-tight text-foreground sm:text-4xl", children: title }), description && (_jsx("p", { className: "max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg", children: description })), children && (_jsx("div", { className: "max-w-2xl text-base leading-7 text-muted-foreground", children: children })), _jsx(MarketingCtaList, { ctas: ctas, align: align, className: "mt-1" })] }) }));
}
