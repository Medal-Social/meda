import type { EmailBuilderLabels } from './types.js';
interface FloatingBarProps {
    labels: EmailBuilderLabels;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}
/** Per-block floating action bar. Rendered next to the selected block. */
export declare function FloatingBar({ labels, canMoveUp, canMoveDown, onMoveUp, onMoveDown, onDuplicate, onDelete, }: FloatingBarProps): import("react/jsx-runtime").JSX.Element;
export {};
