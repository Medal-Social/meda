export interface LatencyBreakdownProps {
    sttMs: number;
    claudeMs: number;
    ttsMs: number;
    showLegend?: boolean;
    className?: string;
}
export declare function LatencyBreakdown({ sttMs, claudeMs, ttsMs, showLegend, className, }: LatencyBreakdownProps): import("react/jsx-runtime").JSX.Element;
