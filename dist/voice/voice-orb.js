import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
export const VoiceOrb = React.forwardRef(function VoiceOrb({ pressed, level = 0, phase = 'idle', size = 144, disabled, label = 'Hold to talk', className, style, ...rest }, ref) {
    const intensity = 0.4 + Math.min(1, Math.max(0, level)) * 0.6;
    const haloBlur = 8 + Math.min(1, Math.max(0, level)) * 24;
    const styleVar = {
        width: size,
        height: size,
        ['--meda-orb-intensity']: intensity,
        ['--meda-orb-halo-blur']: `${haloBlur}px`,
        ...style,
    };
    return (_jsxs("button", { ref: ref, type: "button", "aria-pressed": pressed, "aria-label": label, disabled: disabled, "data-phase": phase, "data-pressed": pressed, className: [
            'meda-voice-orb',
            'relative inline-flex items-center justify-center rounded-full',
            'select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-transform duration-200 ease-out',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            pressed ? 'scale-[0.97]' : 'scale-100',
            className ?? '',
        ].join(' '), style: styleVar, ...rest, children: [_jsx("span", { "aria-hidden": true, className: "meda-voice-orb__halo pointer-events-none absolute -inset-10 rounded-full" }), _jsx("span", { "aria-hidden": true, className: "meda-voice-orb__core absolute inset-0 rounded-full" }), _jsx("span", { "aria-hidden": true, className: "meda-voice-orb__breath pointer-events-none absolute -inset-3 rounded-full" }), _jsx("span", { "aria-hidden": true, className: "meda-voice-orb__label relative text-[11px] font-medium tracking-[0.08em] text-primary-foreground/80", children: "HOLD" })] }));
});
