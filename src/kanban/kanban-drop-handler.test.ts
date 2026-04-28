// open/meda/src/kanban/kanban-drop-handler.test.ts
import { describe, expect, it, vi } from 'vitest';
import { handleKanbanColumnDrop } from './kanban-drop-handler.js';

const COLUMNS = [{ id: 'backlog' }, { id: 'done' }];
const ITEMS = [
  { id: 't1', status: 'backlog', position: 0 },
  { id: 't2', status: 'backlog', position: 1 },
];

describe('handleKanbanColumnDrop', () => {
  it('returns false when over is null', () => {
    const result = handleKanbanColumnDrop({
      event: { active: { id: 't1' } as any, over: null } as any,
      items: ITEMS,
      columns: COLUMNS,
    });
    expect(result).toBe(false);
  });

  it('returns false when over id is not a column or item', () => {
    const result = handleKanbanColumnDrop({
      event: {
        active: { id: 't1' } as any,
        over: { id: 'machine:m1', data: { current: { type: 'rail-drop-slot' } } } as any,
      } as any,
      items: ITEMS,
      columns: COLUMNS,
    });
    expect(result).toBe(false);
  });

  it('calls onCardMove and returns true when dropped on a different column', () => {
    const onCardMove = vi.fn();
    const result = handleKanbanColumnDrop({
      event: {
        active: { id: 't1' } as any,
        over: { id: 'done', data: { current: undefined } } as any,
      } as any,
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
      event: {
        active: { id: 't1' } as any,
        over: { id: 't2', data: { current: undefined } } as any,
      } as any,
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
      event: {
        active: { id: 't1' } as any,
        over: { id: 'backlog', data: { current: undefined } } as any,
      } as any,
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
      event: {
        active: { id: 't1' } as any,
        over: { id: 'done', data: { current: undefined } } as any,
      } as any,
      items: ITEMS,
      columns: COLUMNS,
      onCardMove,
      canDropCard,
    });
    expect(result).toBe(true);
    expect(onCardMove).not.toHaveBeenCalled();
  });
});
