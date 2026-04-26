import type { TurnPhase } from './types.js';
export interface VoiceStatusPillProps {
    phase: TurnPhase;
    thinkingForMs?: number;
    className?: string;
}
export declare function VoiceStatusPill({ phase, thinkingForMs, className }: VoiceStatusPillProps): import("react/jsx-runtime").JSX.Element;
