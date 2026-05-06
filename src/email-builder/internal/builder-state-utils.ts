// Pure helpers for mutating an EmailDocument. All functions return a new doc.
import type { BlockKind, BlockPropsMap, EmailBlock, EmailDocument } from '../types.js';

let __idCounter = 0;
function genId(prefix = 'blk'): string {
  __idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${__idCounter.toString(36)}`;
}

export function addBlock(doc: EmailDocument, block: EmailBlock, atIndex?: number): EmailDocument {
  const blocks = [...doc.blocks];
  const idx = atIndex ?? blocks.length;
  blocks.splice(idx, 0, block);
  return { ...doc, blocks };
}

export function removeBlock(doc: EmailDocument, blockId: string): EmailDocument {
  return { ...doc, blocks: doc.blocks.filter((b) => b.id !== blockId) };
}

export function moveBlock(doc: EmailDocument, fromIndex: number, toIndex: number): EmailDocument {
  if (fromIndex === toIndex) return doc;
  const blocks = [...doc.blocks];
  const [moved] = blocks.splice(fromIndex, 1);
  if (!moved) return doc;
  blocks.splice(toIndex, 0, moved);
  return { ...doc, blocks };
}

export function updateBlockProps<K extends BlockKind>(
  doc: EmailDocument,
  blockId: string,
  patch: Partial<BlockPropsMap[K]>
): EmailDocument {
  return {
    ...doc,
    blocks: doc.blocks.map((b) =>
      b.id === blockId
        ? ({ ...b, props: { ...b.props, ...(patch as Partial<typeof b.props>) } } as EmailBlock)
        : b
    ),
  };
}

export function duplicateBlock(doc: EmailDocument, blockId: string): EmailDocument {
  const idx = doc.blocks.findIndex((b) => b.id === blockId);
  if (idx === -1) return doc;
  const original = doc.blocks[idx];
  /* v8 ignore next -- defensive guard; findIndex guarantees idx is valid */
  if (!original) return doc;
  const clone: EmailBlock = {
    ...original,
    id: genId(original.kind),
    props: { ...original.props },
    children: original.children?.map((col) => col.map((b) => ({ ...b, id: genId(b.kind) }))),
  };
  const blocks = [...doc.blocks];
  blocks.splice(idx + 1, 0, clone);
  return { ...doc, blocks };
}

export function findBlock(doc: EmailDocument, blockId: string): EmailBlock | null {
  return doc.blocks.find((b) => b.id === blockId) ?? null;
}
