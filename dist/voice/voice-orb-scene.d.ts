import type { TurnPhase } from './types.js';
export type VoiceOrbVariant = 'metal' | 'aurora';
export interface SceneProps {
    level?: number;
    outputLevel?: number;
    phase?: TurnPhase;
    colors: [string, string];
    reducedMotion?: boolean;
    pressed?: boolean;
    variant?: VoiceOrbVariant;
}
export declare function Scene({ level, outputLevel, phase, colors, reducedMotion, pressed, variant, }: SceneProps): import("react/jsx-runtime").JSX.Element;
