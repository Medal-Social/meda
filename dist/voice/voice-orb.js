import { jsx as _jsx } from "react/jsx-runtime";
// SPDX-License-Identifier: Apache-2.0
import { Canvas } from '@react-three/fiber';
import * as React from 'react';
import './voice-orb.css';
import { Scene } from './voice-orb-scene.js';
// ---------------------------------------------------------------------------
// Theming helpers
// ---------------------------------------------------------------------------
function hslToHex(hsl) {
    const match = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
    if (!match)
        return '#9A6AC2'; // Pilot purple fallback
    const h = Number(match[1]);
    const s = Number(match[2]) / 100;
    const l = Number(match[3]) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
function readMedaColors(el) {
    const style = getComputedStyle(el);
    const primary = style.getPropertyValue('--primary').trim();
    const accent = style.getPropertyValue('--accent').trim();
    const colorA = hslToHex(primary);
    const colorB = accent ? hslToHex(accent) : colorA;
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
