// open/meda/src/kanban/kanban-drop-handler.test.ts
import type { DragEndEvent } from '@dnd-kit/core';
import { describe, expect, it, vi } from 'vitest';
import { handleKanbanColumnDrop } from '../../../src/kanban/kanban-drop-handler.js';

const COLUMNS = [{ id: 'backlog' }, { id: 'done' }];
const ITEMS = [
  { id: 't1', status: 'backlog', position: 0 },
  { id: 't2', status: 'backlog', position: 1 },
];

interface SyntheticOver {
  id: string;
  data?: { current?: { type?: string } };
}

// dnd-kit's DragEndEvent has a wide internal shape (collisions, delta, etc.)
// the handler doesn't read. The cast through `unknown` keeps the call site
// strongly typed at the public API while letting tests build minimal stubs.
function makeEvent(activeId: string, over: SyntheticOver | null): DragEndEvent {
  return { active: { id: activeId }, over } as unknown as DragEndEvent;
}

describe('handleKanbanColumnDrop', () => {
  it('returns false when over is null', () => {
    const result = handleKanbanColumnDrop({
      event: makeEvent('t1', null),
      items: ITEMS,
      columns: COLUMNS,
    });
    expect(result).toBe(false);
  });

  it('returns false when over id is not a column or item', () => {
    const result = handleKanbanColumnDrop({
      event: makeEvent('t1', {
        id: 'machine:m1',
        data: { current: { type: 'rail-drop-slot' } },
      }),
      items: ITEMS,
      columns: COLUMNS,
    });
    expect(result).toBe(false);
  });

  it('calls onCardMove and returns true when dropped on a different column', () => {
    const onCardMove = vi.fn();
    const result = handleKanbanColumnDrop({
      event: makeEvent('t1', { id: 'done', data: { current: undefined } }),
      items: ITEMS,
      columns: COLUMNS,
      onCardMove,
    });
    expect(result).toBe(true);
    expect(onCardMove).toHaveBeenCalledWith('t1', 'done');
  });

  it('calls onCardMove when dropped on an item in a different column', () => {
    const items = [
      { id: 't1', status: 'backlog', position: 0 },
      { id: 't2', status: 'done', position: 0 },
    ];
    const onCardMove = vi.fn();
    const result = handleKanbanColumnDrop({
      event: makeEvent('t1', { id: 't2', data: { current: undefined } }),
      items,
      columns: COLUMNS,
      onCardMove,
    });
    expect(result).toBe(true);
    expect(onCardMove).toHaveBeenCalledWith('t1', 'done');
  });

  it('does not call onCardMove when dropped on same column (no change)', () => {
    const onCardMove = vi.fn();
    // t1 is at position 0 in backlog; dropping on backlog column appends to end (position 2)
    // so it DOES change position — onCardMove should NOT be called (status unchanged)
    const result = handleKanbanColumnDrop({
      event: makeEvent('t1', { id: 'backlog', data: { current: undefined } }),
      items: ITEMS,
      columns: COLUMNS,
      onCardMove,
    });
    expect(result).toBe(true);
    // status didn't change, so onCardMove should not be called
    expect(onCardMove).not.toHaveBeenCalled();
  });

  it('respects canDropCard and still returns true (handled/rejected)', () => {
    const onCardMove = vi.fn();
    const canDropCard = vi.fn().mockReturnValue(false);
    const result = handleKanbanColumnDrop({
      event: makeEvent('t1', { id: 'done', data: { current: undefined } }),
      items: ITEMS,
      columns: COLUMNS,
      onCardMove,
      canDropCard,
    });
    expect(result).toBe(true);
    expect(onCardMove).not.toHaveBeenCalled();
  });
});
