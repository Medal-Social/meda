import { jsx as _jsx } from "react/jsx-runtime";
// SPDX-License-Identifier: Apache-2.0
import { Canvas } from '@react-three/fiber';
import * as React from 'react';
import { Scene } from './voice-orb-scene.js';
// Note: CSS for `.meda-voice-orb` is shipped via @medalsocial/meda/styles.css
// (re-exported from globals.css). We avoid a JS-side CSS import here so
// Meda's tsc-only build pipeline doesn't need CSS bundling.
// ---------------------------------------------------------------------------
// Theming helpers
// ---------------------------------------------------------------------------
const FALLBACK_COLOR = '#9A6AC2'; // Pilot purple
function hslToHex(h, s, l) {
    const sl = s / 100;
    const ll = l / 100;
    const a = sl * Math.min(ll, 1 - ll);
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
/**
 * Convert any CSS color token to a hex string the Three.js shader can consume.
 *
 * Handles:
 *   - hex: #RGB / #RRGGBB / #RRGGBBAA
 *   - Tailwind/shadcn space-separated HSL: "271 36% 60%"
 *   - hsl(), rgb(), oklch(), color(), var() — resolved via browser CSSOM
 */
export function parseColor(value, fallback = FALLBACK_COLOR) {
    const v = value.trim();
    if (!v)
        return fallback;
    // Already a hex literal — pass through directly.
    if (/^#[0-9a-fA-F]{3,8}$/.test(v))
        return v;
    // Tailwind/shadcn convention: "H S% L%" (no leading "hsl(")
    const hslMatch = v.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
    if (hslMatch) {
        return hslToHex(Number(hslMatch[1]), Number(hslMatch[2]), Number(hslMatch[3]));
    }
    // Functional notation — hsl(), rgb(), oklch(), color(), var(), etc.
    // Let the browser resolve it via a throw-away element.
    if (typeof document !== 'undefined' && (v.includes('(') || v.startsWith('var'))) {
        const probe = document.createElement('div');
        probe.style.display = 'none';
        probe.style.color = v;
        document.body.appendChild(probe);
        const computed = getComputedStyle(probe).color;
        document.body.removeChild(probe);
        const m = computed.match(/rgb(?:a)?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
        if (m) {
            const r = Number(m[1]);
            const g = Number(m[2]);
            const b = Number(m[3]);
            return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
        }
    }
    return fallback;
}
function readMedaColors(el) {
    const style = getComputedStyle(el);
    const primary = style.getPropertyValue('--primary').trim();
    const accent = style.getPropertyValue('--accent').trim();
    const colorA = parseColor(primary);
    const colorB = accent ? parseColor(accent) : colorA;
    return [colorA, colorB];
}
const DEFAULT_COLORS = ['#9A6AC2', '#7B4FAB'];
// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const VoiceOrb = React.forwardRef(function VoiceOrb({ pressed, level = 0, outputLevel = 0, phase = 'idle', size = 144, disabled, label = 'Hold to talk', colors: colorsProp, className, style, ...rest }, ref) {
    const buttonRef = React.useRef(null);
    // Merge forwarded ref
    React.useImperativeHandle(ref, () => buttonRef.current);
    // Resolved theme colors (from CSSOM unless overridden by prop)
    const [resolvedColors, setResolvedColors] = React.useState(colorsProp ?? DEFAULT_COLORS);
    // prefers-reduced-motion
    const [reducedMotion, setReducedMotion] = React.useState(false);
    React.useEffect(() => {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mq.matches);
        const handler = (e) => setReducedMotion(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, []);
    // Theme color resolution
    React.useEffect(() => {
        if (colorsProp) {
            setResolvedColors(colorsProp);
            return;
        }
        const update = () => {
            setResolvedColors(readMedaColors(document.documentElement));
        };
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme'],
        });
        return () => observer.disconnect();
    }, [colorsProp]);
    const btnStyle = {
        width: size,
        height: size,
        ...style,
    };
    return (_jsx("button", { ref: buttonRef, type: "button", "aria-pressed": pressed, "aria-label": label, disabled: disabled, "data-phase": phase, "data-pressed": pressed, className: [
            'meda-voice-orb',
            'relative inline-flex items-center justify-center rounded-full',
            'select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'transition-transform duration-200 ease-out',
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            pressed ? 'scale-[0.97]' : 'scale-100',
            className ?? '',
        ].join(' '), style: btnStyle, ...rest, children: _jsx(Canvas, { gl: { alpha: true, antialias: true, premultipliedAlpha: true }, style: { pointerEvents: 'none' }, children: _jsx(Scene, { level: level, outputLevel: outputLevel, phase: phase, colors: resolvedColors, reducedMotion: reducedMotion, pressed: pressed }) }) }));
});
