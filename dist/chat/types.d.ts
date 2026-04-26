export type Speaker = 'user' | 'assistant' | 'system';
/** Per-stage latency breakdown for one turn. */
export interface TurnLatency {
    sttMs?: number;
    claudeMs?: number;
    ttsMs?: number;
}
/** A single AI tool / function-call invocation. */
export interface ToolCall {
    id: string;
    name: string;
    args: Record<string, unknown>;
    /** Short human-readable summary, e.g. "3 events". */
    resultSummary?: string;
    latencyMs?: number;
}
/** One conversational exchange. */
export interface Turn {
    id: string;
    speaker: Speaker;
    /** Display label, e.g. "Morpheus" or "Operator (Ali)". Optional override of speaker. */
    speakerLabel?: string;
    /** Optional model identifier, e.g. "claude-opus-4-7". */
    modelLabel?: string;
    /** URL or blob: URL for per-turn replay. */
    audioUrl?: string;
    /** Spoken duration if known. */
    spokenSeconds?: number;
    text: string;
    /** Unix ms. */
    startedAt: number;
    /** True if the assistant is still streaming this turn. */
    streaming?: boolean;
    latency?: TurnLatency;
    toolCalls?: ToolCall[];
}
