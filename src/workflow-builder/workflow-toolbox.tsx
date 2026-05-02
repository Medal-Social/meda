'use client';

import { cn } from '../lib/utils.js';
import { renderWorkflowIcon } from './internal/trigger-icons.js';
import {
  defaultWorkflowBuilderLabels,
  type WorkflowToolboxItem,
  type WorkflowToolboxProps,
} from './types.js';

function defaultItems(labels: typeof defaultWorkflowBuilderLabels): WorkflowToolboxItem[] {
  return [
    { kind: 'trigger', label: labels.addTrigger, iconName: 'zap' },
    { kind: 'action', label: labels.addAction, iconName: 'send' },
    { kind: 'condition', label: labels.addCondition, iconName: 'git-branch' },
    { kind: 'delay', label: labels.addDelay, iconName: 'clock' },
    { kind: 'end', label: labels.addEnd, iconName: 'flag' },
  ];
}

export function WorkflowToolbox({
  items,
  onAddNode,
  readOnly = false,
  labels,
  className,
}: WorkflowToolboxProps) {
  const resolvedLabels = { ...defaultWorkflowBuilderLabels, ...(labels ?? {}) };
  const resolvedItems = items ?? defaultItems(resolvedLabels);

  return (
    <aside
      data-slot="workflow-toolbox"
      className={cn('flex h-full w-full flex-col border-border border-r bg-background', className)}
    >
      <div className="border-border border-b px-4 py-3">
        <h2 className="font-semibold text-foreground text-sm">{resolvedLabels.toolboxTitle}</h2>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {readOnly ? (
          <p className="px-1 py-2 text-muted-foreground text-xs">
            {resolvedLabels.toolboxReadOnlyHint}
          </p>
        ) : (
          <>
            <p className="mb-2 px-1 text-muted-foreground text-xs">{resolvedLabels.toolboxHint}</p>
            <ul className="space-y-1.5">
              {resolvedItems.map((item) => (
                <li key={item.kind}>
                  <button
                    type="button"
                    data-slot="workflow-toolbox-item"
                    data-kind={item.kind}
                    onClick={() => onAddNode?.(item.kind)}
                    className="flex min-h-11 w-full items-center gap-2.5 rounded-md px-2 py-2.5 text-left text-sm transition-colors hover:bg-accent/60 focus-visible:bg-accent/80 focus-visible:outline-none"
                  >
                    <span className="flex-shrink-0 text-muted-foreground">
                      {renderWorkflowIcon(item.kind, item.iconName, 'h-4 w-4')}
                    </span>
                    <span className="flex-1 font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </aside>
  );
}
