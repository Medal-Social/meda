'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { cx } from './utils.js';
const baseCtaClass = 'inline-flex min-h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';
const ctaVariantClass = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'border border-border bg-transparent text-foreground hover:bg-surface-highlight hover:text-foreground',
};
export function MarketingCtaList({ ctas, align = 'center', className }) {
    if (!ctas?.length)
        return null;
    return (_jsx("div", { className: cx('flex flex-wrap gap-3', align === 'center' ? 'justify-center' : 'justify-start', className), children: ctas.map((cta, index) => {
            const variant = cta.variant ?? (index === 0 ? 'primary' : 'secondary');
            const className = cx(baseCtaClass, ctaVariantClass[variant]);
            const key = typeof cta.label === 'string' ? `${cta.label}-${index}` : `marketing-cta-${index}`;
            if (cta.href) {
                return (_jsx("a", { href: cta.href, "aria-label": cta.ariaLabel, className: className, target: cta.target, rel: cta.rel, children: cta.label }, key));
            }
            return (_jsx("button", { type: "button", "aria-label": cta.ariaLabel, className: className, onClick: cta.onClick, children: cta.label }, key));
        }) }));
}
