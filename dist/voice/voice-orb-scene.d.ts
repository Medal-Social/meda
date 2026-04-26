import type { TurnPhase } from './types.js';
export interface SceneProps {
    level?: number;
    outputLevel?: number;
    phase?: TurnPhase;
    colors: [string, string];
    reducedMotion?: boolean;
    pressed?: boolean;
}
export declare function Scene({ level, outputLevel, phase, colors, reducedMotion, pressed, }: SceneProps): import("react/jsx-runtime").JSX.Element;
