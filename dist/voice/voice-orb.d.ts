import * as React from 'react';
import type { TurnPhase } from './types.js';
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
}
export declare const VoiceOrb: React.ForwardRefExoticComponent<VoiceOrbProps & React.RefAttributes<HTMLButtonElement>>;
