import type { BlockKind } from './types.js';
interface BlockPaletteProps {
    onPick: (kind: BlockKind) => void;
}
/** Vertical button list of all available block kinds. */
export declare function BlockPalette({ onPick }: BlockPaletteProps): import("react/jsx-runtime").JSX.Element;
export {};
