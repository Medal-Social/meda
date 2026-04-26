import type { Turn } from './types.js';
export interface TranscriptStreamProps {
    turns: Turn[];
    /** When true (default), auto-scroll to bottom on new turn IF user is already near bottom. */
    autoScroll?: boolean;
    tz?: string;
    onTurnPlay?: (turnId: string) => void;
    className?: string;
}
export declare function TranscriptStream({ turns, autoScroll, tz, onTurnPlay, className, }: TranscriptStreamProps): import("react/jsx-runtime").JSX.Element;
