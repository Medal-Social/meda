// Discriminated-union of payloads attached to DnD events. Used so the canvas
// can distinguish "reorder existing block" vs "drop new block from palette".
import type { BlockKind } from '../types.js';

export type DragData =
  | { kind: 'block'; blockId: string }
  | { kind: 'palette'; blockKind: BlockKind };

export function isDragData(value: unknown): value is DragData {
  if (!value || typeof value !== 'object') return false;
  const v = value as { kind?: unknown };
  return v.kind === 'block' || v.kind === 'palette';
}
