import * as React from 'react';
import type { TurnPhase } from './types.js';
import { type VoiceOrbVariant } from './voice-orb-scene.js';
export type { VoiceOrbVariant } from './voice-orb-scene.js';
/**
 * Convert any CSS color token to a hex string the Three.js shader can consume.
 *
 * Handles:
 *   - hex: #RGB / #RRGGBB / #RRGGBBAA
 *   - Tailwind/shadcn space-separated HSL: "271 36% 60%"
 *   - hsl(), rgb(), oklch(), color(), var() — resolved via browser CSSOM
 */
export declare function parseColor(value: string, fallback?: string): string;
export interface VoiceOrbProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Held / not held. Drives the squish + halo intensity. */
    pressed: boolean;
    /** 0..1 mic input level. Drives shader input-volume uniform. */
    level?: number;
    /** 0..1 TTS playback level. Drives shader output-volume uniform. */
    outputLevel?: number;
    /** Visual phase. Drives state-specific shader behavior. */
    phase?: TurnPhase;
    /** Diameter in px. Defaults to 144. */
    size?: number;
    disabled?: boolean;
    /** A11y label. Defaults to "Hold to talk". */
    label?: string;
    /**
     * Override the gradient pair [colorA, colorB]. If omitted, reads --primary
     * and --accent from CSS at mount and on theme change.
     */
    colors?: [string, string];
    /**
     * Visual variant.
     *
     * - `'metal'` (default): smooth chrome-like sphere with strong specular +
     *   depth shading. Apple Siri / Vision Pro adjacent. Best for object-like,
     *   premium-feeling presence.
     * - `'aurora'`: soft layered ribbons of color drifting across a translucent
     *   disc. Northern-lights aesthetic. Calm, atmospheric, reads like motion
     *   even at idle. Great for thinking/listening moods.
     */
    variant?: VoiceOrbVariant;
}
export declare const VoiceOrb: React.ForwardRefExoticComponent<VoiceOrbProps & React.RefAttributes<HTMLButtonElement>>;
