export type LatencyKind = 'stt' | 'claude' | 'tts';
export interface LatencyBadgeProps {
    kind: LatencyKind;
    ms: number;
    className?: string;
}
export declare function LatencyBadge({ kind, ms, className }: LatencyBadgeProps): import("react/jsx-runtime").JSX.Element;
