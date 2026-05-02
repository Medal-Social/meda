'use client';

import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils.js';
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
export function FloatingBar({
  labels,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: FloatingBarProps) {
  const btnClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40';
  return (
    <div
      data-slot="email-builder-floating-bar"
      className="inline-flex rounded-md border border-input bg-background p-0.5 shadow-sm"
    >
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        aria-label={labels.moveUp}
        className={btnClass}
      >
        <ChevronUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label={labels.moveDown}
        className={btnClass}
      >
        <ChevronDown className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        aria-label={labels.duplicateBlock}
        className={btnClass}
      >
        <Copy className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={labels.deleteBlock}
        className={cn(btnClass, 'hover:bg-destructive/10 hover:text-destructive')}
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
