import * as React from 'react';
import type { TurnPhase } from './types.js';
export interface VoiceOrbProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    pressed: boolean;
    level?: number;
    phase?: TurnPhase;
    size?: number;
    disabled?: boolean;
    label?: string;
}
export declare const VoiceOrb: React.ForwardRefExoticComponent<VoiceOrbProps & React.RefAttributes<HTMLButtonElement>>;
