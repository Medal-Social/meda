'use client';

import { Pause, Play, Zap } from 'lucide-react';
import { cn } from '../lib/utils.js';
import type { WorkflowCardProps, WorkflowStatus } from './types.js';

const STATUS_CLASSES: Record<WorkflowStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
  paused: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
};

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const seconds = Math.round(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function getInitials(value: string): string {
  return value
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const STATUS_ICONS: Record<WorkflowStatus, React.ReactNode> = {
  draft: null,
  active: <Play className="h-3 w-3" aria-hidden />,
  paused: <Pause className="h-3 w-3" aria-hidden />,
};

export function WorkflowCard({ workflow, onClick, className }: WorkflowCardProps) {
  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: card-style element with optional click+keyboard handler; button role added when interactive
    <div
      data-slot="workflow-card"
      data-status={workflow.status}
      className={cn(
        'group cursor-pointer rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md',
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
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate font-semibold text-base text-foreground">{workflow.name}</h3>
          {workflow.description ? (
            <p className="line-clamp-2 text-muted-foreground text-sm">{workflow.description}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
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
            <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
              <Zap className="h-3.5 w-3.5" aria-hidden />
              {workflow.triggerLabel}
            </span>
          ) : null}
        </div>

        {workflow.meta?.length ? (
          <dl className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm">
            {workflow.meta.map((m) => (
              <div key={m.label} className="flex items-center gap-1">
                <dt className="font-medium">{m.label}:</dt>
                <dd className="tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {workflow.creatorName || workflow.createdAt ? (
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            {workflow.creatorName ? (
              <span className="inline-flex items-center gap-1.5">
                {workflow.creatorAvatarUrl ? (
                  <img src={workflow.creatorAvatarUrl} alt="" className="h-5 w-5 rounded-full" />
                ) : (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted font-medium text-[10px]">
                    {getInitials(workflow.creatorName)}
                  </span>
                )}
                <span className="truncate">{workflow.creatorName}</span>
              </span>
            ) : null}
            {workflow.createdAt ? <span>{formatRelative(workflow.createdAt)}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
