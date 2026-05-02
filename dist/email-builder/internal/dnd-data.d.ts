import type { BlockKind } from '../types.js';
export type DragData = {
    kind: 'block';
    blockId: string;
} | {
    kind: 'palette';
    blockKind: BlockKind;
};
export declare function isDragData(value: unknown): value is DragData;
