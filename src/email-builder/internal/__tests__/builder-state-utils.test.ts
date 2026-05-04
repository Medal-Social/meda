import { describe, expect, it } from 'vitest';
import type { EmailBlock, EmailDocument } from '../../types.js';
import {
  addBlock,
  duplicateBlock,
  findBlock,
  moveBlock,
  removeBlock,
  updateBlockProps,
} from '../builder-state-utils.js';

function makeBlock(id: string, text = 'Hello'): EmailBlock {
  return {
    id,
    kind: 'heading',
    props: {
      text,
      level: 1,
      alignment: 'left',
      color: '#000',
      fontFamily: '',
      fontWeight: 400,
      fontSize: 24,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
  };
}

function makeDoc(...ids: string[]): EmailDocument {
  return { blocks: ids.map((id) => makeBlock(id)) };
}

describe('addBlock', () => {
  it('appends a block when no index is given', () => {
    const doc = makeDoc('a', 'b');
    const block = makeBlock('c');
    const next = addBlock(doc, block);
    expect(next.blocks.map((b) => b.id)).toEqual(['a', 'b', 'c']);
  });

  it('inserts a block at the specified index', () => {
    const doc = makeDoc('a', 'b');
    const block = makeBlock('x');
    const next = addBlock(doc, block, 1);
    expect(next.blocks.map((b) => b.id)).toEqual(['a', 'x', 'b']);
  });

  it('inserts at index 0', () => {
    const doc = makeDoc('a', 'b');
    const block = makeBlock('x');
    const next = addBlock(doc, block, 0);
    expect(next.blocks.map((b) => b.id)).toEqual(['x', 'a', 'b']);
  });

  it('does not mutate the original document', () => {
    const doc = makeDoc('a');
    addBlock(doc, makeBlock('b'));
    expect(doc.blocks).toHaveLength(1);
  });
});

describe('removeBlock', () => {
  it('removes the block with the given id', () => {
    const doc = makeDoc('a', 'b', 'c');
    const next = removeBlock(doc, 'b');
    expect(next.blocks.map((b) => b.id)).toEqual(['a', 'c']);
  });

  it('returns unchanged doc if id not found', () => {
    const doc = makeDoc('a', 'b');
    const next = removeBlock(doc, 'z');
    expect(next.blocks.map((b) => b.id)).toEqual(['a', 'b']);
  });
});

describe('moveBlock', () => {
  it('returns the same reference when fromIndex equals toIndex', () => {
    const doc = makeDoc('a', 'b', 'c');
    const next = moveBlock(doc, 1, 1);
    expect(next).toBe(doc);
  });

  it('moves a block forward', () => {
    const doc = makeDoc('a', 'b', 'c');
    const next = moveBlock(doc, 0, 2);
    expect(next.blocks.map((b) => b.id)).toEqual(['b', 'c', 'a']);
  });

  it('moves a block backward', () => {
    const doc = makeDoc('a', 'b', 'c');
    const next = moveBlock(doc, 2, 0);
    expect(next.blocks.map((b) => b.id)).toEqual(['c', 'a', 'b']);
  });

  it('returns doc unchanged if the splice yields undefined (out-of-bounds)', () => {
    const doc = makeDoc('a', 'b');
    // fromIndex beyond the array — splice returns [] so moved is undefined
    const next = moveBlock(doc, 99, 0);
    expect(next).toBe(doc);
  });
});

describe('updateBlockProps', () => {
  it('merges partial props onto the matching block', () => {
    const doc = makeDoc('a', 'b');
    const next = updateBlockProps(doc, 'a', { text: 'Updated' });
    const block = next.blocks.find((b) => b.id === 'a') as EmailBlock<'heading'>;
    expect(block.props.text).toBe('Updated');
  });

  it('does not touch blocks that do not match', () => {
    const doc = makeDoc('a', 'b');
    const next = updateBlockProps(doc, 'a', { text: 'X' });
    const block = next.blocks.find((b) => b.id === 'b') as EmailBlock<'heading'>;
    expect(block.props.text).toBe('Hello');
  });

  it('does not mutate the original doc', () => {
    const doc = makeDoc('a');
    updateBlockProps(doc, 'a', { text: 'X' });
    expect((doc.blocks[0]?.props as { text: string }).text).toBe('Hello');
  });
});

describe('duplicateBlock', () => {
  it('returns the doc unchanged when the id is not found', () => {
    const doc = makeDoc('a');
    const next = duplicateBlock(doc, 'z');
    expect(next).toBe(doc);
  });

  it('inserts the clone immediately after the original', () => {
    const doc = makeDoc('a', 'b', 'c');
    const next = duplicateBlock(doc, 'b');
    expect(next.blocks).toHaveLength(4);
    expect(next.blocks[1]?.id).toBe('b');
    expect(next.blocks[2]?.id).not.toBe('b');
  });

  it('gives the clone a unique id', () => {
    const doc = makeDoc('a');
    const next = duplicateBlock(doc, 'a');
    expect(next.blocks[0]?.id).toBe('a');
    expect(next.blocks[1]?.id).not.toBe('a');
  });

  it('duplicates blocks with children (columns)', () => {
    const child1 = makeBlock('child1');
    const child2 = makeBlock('child2');
    const columns: EmailBlock = {
      id: 'col',
      kind: 'columns',
      props: {
        layout: '50-50',
        verticalAlignment: 'top',
        backgroundColor: '',
        gap: 16,
        mobileStacking: true,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
      children: [[child1], [child2]],
    };
    const doc: EmailDocument = { blocks: [columns] };
    const next = duplicateBlock(doc, 'col');
    expect(next.blocks).toHaveLength(2);
    const clone = next.blocks[1];
    expect(clone?.children?.[0]?.[0]?.id).not.toBe('child1');
    expect(clone?.children?.[1]?.[0]?.id).not.toBe('child2');
  });

  it('does not mutate the original doc', () => {
    const doc = makeDoc('a');
    duplicateBlock(doc, 'a');
    expect(doc.blocks).toHaveLength(1);
  });
});

describe('findBlock', () => {
  it('returns the block when found', () => {
    const doc = makeDoc('a', 'b');
    const block = findBlock(doc, 'b');
    expect(block?.id).toBe('b');
  });

  it('returns null when not found', () => {
    const doc = makeDoc('a');
    expect(findBlock(doc, 'z')).toBeNull();
  });
});
