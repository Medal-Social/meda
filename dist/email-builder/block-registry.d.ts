import type { Alignment, BlockKind, BlockPropsMap, ColumnLayout, EmailBlock } from './types.js';
export declare function getDefaultBlockProps(): {
    [K in BlockKind]: BlockPropsMap[K];
};
export declare const COLUMN_WIDTHS: Record<ColumnLayout, number[]>;
export declare function getColumnWidths(layout: ColumnLayout): number[];
export declare function createBlock<K extends BlockKind>(kind: K, overrides?: Partial<BlockPropsMap[K]>): EmailBlock<K>;
export interface BlockMeta {
    kind: BlockKind;
    label: string;
    description: string;
    category: 'content' | 'layout' | 'marketing';
}
export declare const BLOCK_REGISTRY: BlockMeta[];
export declare const ALIGNMENT_OPTIONS: Alignment[];
