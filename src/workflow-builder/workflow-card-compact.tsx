'use client';

import { Pause, Play, Zap } from 'lucide-react';
import { cn } from '../lib/utils.js';
import type { WorkflowCardCompactProps, WorkflowStatus } from './types.js';

const STATUS_CLASSES: Record<WorkflowStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  paused: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
};

const STATUS_ICONS: Record<WorkflowStatus, React.ReactNode> = {
  draft: null,
  active: <Play className="h-3 w-3" aria-hidden />,
  paused: <Pause className="h-3 w-3" aria-hidden />,
};

export function WorkflowCardCompact({ workflow, onClick, className }: WorkflowCardCompactProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: card-style element with optional click+keyboard handler; button role added when interactive
    <div
      data-slot="workflow-card-compact"
      data-status={workflow.status}
      className={cn(
        'cursor-pointer space-y-2 rounded-md border border-border bg-card p-3 transition-colors hover:bg-accent/50',
        className
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="truncate font-medium text-foreground text-sm">{workflow.name}</div>

      {workflow.description ? (
        <p className="line-clamp-2 text-muted-foreground text-xs">{workflow.description}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs',
            STATUS_CLASSES[workflow.status]
          )}
        >
          {STATUS_ICONS[workflow.status]}
          <span className="capitalize">{workflow.status}</span>
        </span>
        {workflow.triggerLabel ? (
          <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
            <Zap className="h-3 w-3" aria-hidden />
            {workflow.triggerLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
