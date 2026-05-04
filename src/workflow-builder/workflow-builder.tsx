'use client';

import { useState } from 'react';
import { cn } from '../lib/utils.js';
import { defaultWorkflowBuilderLabels, type WorkflowBuilderProps } from './types.js';
import { WorkflowCanvas } from './workflow-canvas.js';
import { WorkflowToolbox } from './workflow-toolbox.js';

/**
 * Top-level workflow builder surface — composes the canvas, toolbox and
 * (optional) header / inspector slots into a responsive layout.
 *
 * Container queries adapt the layout: at narrower container widths the
 * toolbox collapses behind a tab bar (mobile) and at wider widths it sits to
 * the left of the canvas.
 */
export function WorkflowBuilder({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onSelectionChange,
  onNodeClick,
  showToolbox = true,
  readOnly = false,
  headerSlot,
  inspectorSlot,
  customNodeTypes,
  customEdgeTypes,
  labels,
  className,
}: WorkflowBuilderProps) {
  const resolvedLabels = { ...defaultWorkflowBuilderLabels, ...(labels ?? {}) };
  const [mobileDrawer, setMobileDrawer] = useState<'toolbox' | 'inspector' | null>(null);

  return (
    <div
      data-slot="workflow-builder"
      className={cn(
        '@container/workflow relative flex h-full w-full flex-col overflow-hidden bg-background',
        className
      )}
    >
      {headerSlot}
      <div className="relative flex flex-1 overflow-hidden">
        {showToolbox ? (
          <div className="hidden w-64 flex-shrink-0 @[640px]/workflow:flex">
            <WorkflowToolbox onAddNode={onAddNode} readOnly={readOnly} labels={resolvedLabels} />
          </div>
        ) : null}

        <div className="relative flex flex-1 flex-col">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onSelectionChange={onSelectionChange}
            readOnly={readOnly}
            customNodeTypes={customNodeTypes}
            customEdgeTypes={customEdgeTypes}
          />
          {nodes.length === 0 ? (
            <div
              data-slot="workflow-empty-canvas"
              className="pointer-events-none absolute inset-0 flex items-center justify-center text-center"
            >
              <p className="max-w-xs rounded-md bg-background/80 px-4 py-3 text-muted-foreground text-sm shadow-sm backdrop-blur">
                {resolvedLabels.emptyCanvas}
              </p>
            </div>
          ) : null}
        </div>

        {inspectorSlot ? (
          <div className="hidden w-72 flex-shrink-0 border-border border-l @[960px]/workflow:flex">
            {inspectorSlot}
          </div>
        ) : null}
      </div>

      {/* Mobile tab bar — visible below the toolbox breakpoint. */}
      {showToolbox || inspectorSlot ? (
        <nav
          data-slot="workflow-mobile-tab-bar"
          className="flex border-border border-t bg-background @[640px]/workflow:hidden"
          aria-label="Workflow panels"
        >
          {showToolbox ? (
            <button
              type="button"
              onClick={() =>
                setMobileDrawer((current) => (current === 'toolbox' ? null : 'toolbox'))
              }
              className="flex h-12 min-h-11 flex-1 items-center justify-center font-medium text-sm transition-colors hover:bg-accent"
              aria-pressed={mobileDrawer === 'toolbox'}
            >
              {resolvedLabels.openToolbox}
            </button>
          ) : null}
          {inspectorSlot ? (
            <button
              type="button"
              onClick={() =>
                setMobileDrawer((current) => (current === 'inspector' ? null : 'inspector'))
              }
              className="flex h-12 min-h-11 flex-1 items-center justify-center border-border border-l font-medium text-sm transition-colors hover:bg-accent"
              aria-pressed={mobileDrawer === 'inspector'}
            >
              {resolvedLabels.openInspector}
            </button>
          ) : null}
        </nav>
      ) : null}

      {mobileDrawer ? (
        <div
          data-slot="workflow-mobile-drawer"
          data-panel={mobileDrawer}
          className="@[640px]/workflow:hidden absolute inset-x-0 bottom-12 max-h-[60%] overflow-hidden border-border border-t bg-background shadow-lg"
        >
          <div className="flex items-center justify-between border-border border-b px-4 py-2">
            <span className="font-medium text-sm">
              {mobileDrawer === 'toolbox'
                ? resolvedLabels.openToolbox
                : resolvedLabels.openInspector}
            </span>
            <button
              type="button"
              onClick={() => setMobileDrawer(null)}
              className="inline-flex h-9 min-h-9 min-w-11 items-center rounded-md px-2 text-muted-foreground text-sm transition-colors hover:bg-accent hover:text-foreground"
            >
              {resolvedLabels.closeDrawer}
            </button>
          </div>
          <div className="max-h-[50vh] overflow-y-auto">
            {mobileDrawer === 'toolbox' && showToolbox ? (
              <WorkflowToolbox onAddNode={onAddNode} readOnly={readOnly} labels={resolvedLabels} />
            ) : null}
            {mobileDrawer === 'inspector' ? inspectorSlot : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
