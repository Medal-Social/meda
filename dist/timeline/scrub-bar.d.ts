import type { ScrubMark } from './types.js';
export interface ScrubBarProps {
    durationMs: number;
    positionMs: number;
    isLive?: boolean;
    marks: ScrubMark[];
    onSeek: (positionMs: number) => void;
    isPlaying?: boolean;
    onPlayPause?: () => void;
    onSkipBack?: () => void;
    onSkipForward?: () => void;
    className?: string;
}
export declare function ScrubBar({ durationMs, positionMs, isLive, marks, onSeek, isPlaying, onPlayPause, onSkipBack, onSkipForward, className, }: ScrubBarProps): import("react/jsx-runtime").JSX.Element;
