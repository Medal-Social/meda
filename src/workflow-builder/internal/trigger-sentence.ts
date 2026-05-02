// open/meda/src/workflow-builder/internal/trigger-sentence.ts
import type { WorkflowNodeKind } from '../types.js';

/**
 * Returns a short human-readable description for a workflow node based on its
 * kind. Consumers can override per-node via `data.description`.
 */
export function getDefaultNodeSentence(kind: WorkflowNodeKind, label?: string): string {
  switch (kind) {
    case 'trigger':
      return label ? `When ${label.toLowerCase()}` : 'When event occurs';
    case 'action':
      return label ?? 'Run action';
    case 'condition':
      return label ?? 'Branch on condition';
    case 'delay':
      return label ?? 'Wait before continuing';
    case 'end':
      return label ?? 'End of workflow';
    default:
      return label ?? '';
  }
}

/** Tailwind class tokens per kind. Mapped to the meda token system. */
export const NODE_KIND_STYLES: Record<
  WorkflowNodeKind,
  { bg: string; border: string; icon: string }
> = {
  trigger: {
    bg: 'bg-info-50 dark:bg-info-950/40',
    border: 'border-info-300 dark:border-info-700',
    icon: 'text-info-600 dark:text-info-400',
  },
  action: {
    bg: 'bg-success-50 dark:bg-success-950/40',
    border: 'border-success-300 dark:border-success-700',
    icon: 'text-success-600 dark:text-success-400',
  },
  condition: {
    bg: 'bg-brand-50 dark:bg-brand-950/40',
    border: 'border-brand-300 dark:border-brand-700',
    icon: 'text-brand-600 dark:text-brand-400',
  },
  delay: {
    bg: 'bg-warning-50 dark:bg-warning-950/40',
    border: 'border-warning-300 dark:border-warning-700',
    icon: 'text-warning-600 dark:text-warning-400',
  },
  end: {
    bg: 'bg-neutral-50 dark:bg-neutral-900/40',
    border: 'border-neutral-300 dark:border-neutral-600',
    icon: 'text-neutral-600 dark:text-neutral-400',
  },
};

export const NODE_WIDTH = 264;
export const NODE_HEIGHT = 80;
