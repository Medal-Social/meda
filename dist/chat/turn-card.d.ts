import type { Turn } from './types.js';
export interface TurnCardProps {
    turn: Turn;
    /** Reference instant for the relative offset column (typically the conversation start). */
    startedAtRef: number;
    tz?: string;
    onPlay?: (turnId: string) => void;
    className?: string;
}
export declare function TurnCard({ turn, startedAtRef, tz, onPlay, className }: TurnCardProps): import("react/jsx-runtime").JSX.Element;
