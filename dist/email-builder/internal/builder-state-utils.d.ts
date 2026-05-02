import type { BlockKind, BlockPropsMap, EmailBlock, EmailDocument } from '../types.js';
export declare function addBlock(doc: EmailDocument, block: EmailBlock, atIndex?: number): EmailDocument;
export declare function removeBlock(doc: EmailDocument, blockId: string): EmailDocument;
export declare function moveBlock(doc: EmailDocument, fromIndex: number, toIndex: number): EmailDocument;
export declare function updateBlockProps<K extends BlockKind>(doc: EmailDocument, blockId: string, patch: Partial<BlockPropsMap[K]>): EmailDocument;
export declare function duplicateBlock(doc: EmailDocument, blockId: string): EmailDocument;
export declare function findBlock(doc: EmailDocument, blockId: string): EmailBlock | null;
