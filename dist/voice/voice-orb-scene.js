'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// SPDX-License-Identifier: Apache-2.0
// Portions adapted from ElevenLabs UI's Orb component (MIT):
// https://github.com/elevenlabs/ui/blob/main/apps/www/registry/elevenlabs-ui/ui/orb.tsx
// Copyright (c) ElevenLabs Inc.
// Adaptations: Meda token-driven theming, 5-phase state model, outputLevel uniform,
// procedural simplex noise (no texture asset required).
import { useFrame } from '@react-three/fiber';
import * as React from 'react';
import * as THREE from 'three';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './voice-orb-shader.js';
import { createVolumeSmoother } from './voice-orb-volume.js';
// Maps phase name to numeric target for uPhaseT
const PHASE_TARGET = {
    idle: 0,
    listening: 1,
    thinking: 2,
    speaking: 3,
    error: 4,
};
// splitmix32 — fast deterministic PRNG seeded at mount
function splitmix32(seed) {
    let a = seed;
    return () => {
        a = (a + 0x9e3779b9) | 0;
        let t = a ^ (a >>> 16);
        t = Math.imul(t, 0x21f0aaad);
        t = t ^ (t >>> 15);
        t = Math.imul(t, 0x735a2d97);
        t = t ^ (t >>> 15);
        return (t >>> 0) / 4294967296;
    };
}
export function Scene({ level = 0, outputLevel = 0, phase = 'idle', colors, reducedMotion = false, pressed = false, variant = 'aurora', }) {
    const meshRef = React.useRef(null);
    // Smoothers for audio signals
    const inputSmoother = React.useRef(createVolumeSmoother());
    const outputSmoother = React.useRef(createVolumeSmoother());
    // Transition state refs (avoid re-renders)
    const phaseTRef = React.useRef(PHASE_TARGET[phase]);
    const errorFlashRef = React.useRef(0);
    const pressedRef = React.useRef(pressed ? 1 : 0);
    const prevPhaseRef = React.useRef(phase);
    // Color targets
    const colorARef = React.useRef(new THREE.Color(colors[0]));
    const colorBRef = React.useRef(new THREE.Color(colors[1]));
    // Sync latest prop values to refs
    React.useEffect(() => {
        colorARef.current.set(colors[0]);
        colorBRef.current.set(colors[1]);
    }, [colors]);
    React.useEffect(() => {
        // Trigger error flash envelope when entering error phase
        if (phase === 'error' && prevPhaseRef.current !== 'error') {
            errorFlashRef.current = 1;
        }
        prevPhaseRef.current = phase;
    }, [phase]);
    // Random offsets for the 7 oval blobs (seeded once at mount)
    const offsets = React.useMemo(() => {
        const rng = splitmix32(Math.floor(Math.random() * 2 ** 32));
        return new Float32Array(Array.from({ length: 7 }, () => rng() * Math.PI * 2));
    }, []);
    // Build uniforms once — intentionally empty dep array; all values are mutated
    // in useFrame each tick. Initial values come from props captured at mount.
    // biome-ignore lint/correctness/useExhaustiveDependencies: uniform object is mutated in useFrame; re-creating it would reset animation state
    const uniforms = React.useMemo(() => ({
        uTime: { value: 0 },
        uAnimation: { value: 0.1 },
        uInputVolume: { value: 0 },
        uOutputVolume: { value: 0 },
        uColorA: new THREE.Uniform(new THREE.Color(colors[0])),
        uColorB: new THREE.Uniform(new THREE.Color(colors[1])),
        uPhaseT: { value: PHASE_TARGET[phase] },
        uErrorFlash: { value: 0 },
        uPressed: { value: 0 },
        uOpacity: { value: 0 },
        uOffsets: { value: offsets },
        uVariant: { value: variant === 'aurora' ? 1 : 0 },
    }), [] // intentionally empty — uniforms are mutated in useFrame
    );
    useFrame((_, delta) => {
        const mat = meshRef.current?.material;
        if (!mat)
            return;
        const u = mat.uniforms;
        // Fade in on first render
        if (u.uOpacity.value < 1) {
            u.uOpacity.value = Math.min(1, u.uOpacity.value + delta * 2);
        }
        // Time & animation — frozen under reduced motion
        if (!reducedMotion) {
            u.uTime.value += delta * 0.5;
            u.uAnimation.value += delta * (0.1 + (1 - (u.uOutputVolume.value - 1) ** 2) * 0.9);
        }
        // Smooth audio signals; clamp to 0 under reduced motion
        inputSmoother.current.update(reducedMotion ? 0 : Math.min(1, Math.max(0, level)));
        outputSmoother.current.update(reducedMotion ? 0 : Math.min(1, Math.max(0, outputLevel)));
        u.uInputVolume.value = inputSmoother.current.value;
        u.uOutputVolume.value = outputSmoother.current.value;
        // Phase interpolation — 220ms transition
        const phaseTarget = PHASE_TARGET[phase];
        phaseTRef.current += (phaseTarget - phaseTRef.current) * Math.min(1, delta / 0.22);
        u.uPhaseT.value = phaseTRef.current;
        // Error flash decay over ~1.5s
        if (errorFlashRef.current > 0) {
            errorFlashRef.current = Math.max(0, errorFlashRef.current - delta / 1.5);
            u.uErrorFlash.value = errorFlashRef.current;
        }
        // Press envelope
        const pressTarget = pressed ? 1 : 0;
        pressedRef.current += (pressTarget - pressedRef.current) * Math.min(1, delta / 0.1);
        u.uPressed.value = pressedRef.current;
        // Color lerp
        u.uColorA.value.lerp(colorARef.current, 0.08);
        u.uColorB.value.lerp(colorBRef.current, 0.08);
        // Variant — switched live (no animation; consumer changes are instant)
        u.uVariant.value = variant === 'aurora' ? 1 : 0;
    });
    return (_jsxs("mesh", { ref: meshRef, children: [_jsx("circleGeometry", { args: [3.5, 64] }), _jsx("shaderMaterial", { uniforms: uniforms, vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER, transparent: true })] }));
}
