'use client';

import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  ReactFlow,
  type ReactFlowProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCallback } from 'react';
import { cn } from '../lib/utils.js';
import { workflowEdgeTypes } from './edges/index.js';
import { workflowNodeTypes } from './nodes/index.js';
import type { WorkflowEdge, WorkflowNode } from './types.js';

export interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick?: (node: WorkflowNode) => void;
  onPaneClick?: () => void;
  onSelectionChange?: (selection: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => void;
  readOnly?: boolean;
  customNodeTypes?: ReactFlowProps['nodeTypes'];
  customEdgeTypes?: ReactFlowProps['edgeTypes'];
  className?: string;
}

/**
 * The bare React Flow canvas, with sensible defaults wired in. No header / no
 * toolbox — compose with `WorkflowBuilder` for the full surface, or use this
 * alone when embedding in a custom layout.
 */
export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onPaneClick,
  onSelectionChange,
  readOnly = false,
  customNodeTypes,
  customEdgeTypes,
  className,
}: WorkflowCanvasProps) {
  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => {
      onNodeClick?.(node as WorkflowNode);
    },
    [onNodeClick]
  );

  const handleSelectionChange = useCallback(
    (params: { nodes: Node[]; edges: Edge[] }) => {
      onSelectionChange?.({
        nodes: params.nodes as WorkflowNode[],
        edges: params.edges as WorkflowEdge[],
      });
    },
    [onSelectionChange]
  );

  return (
    <div
      data-slot="workflow-canvas"
      className={cn('@container relative h-full w-full bg-muted/40', className)}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={readOnly ? undefined : onNodesChange}
        onEdgesChange={readOnly ? undefined : onEdgesChange}
        onConnect={readOnly ? undefined : onConnect}
        onNodeClick={onNodeClick ? handleNodeClick : undefined}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange ? handleSelectionChange : undefined}
        nodeTypes={customNodeTypes ?? workflowNodeTypes}
        edgeTypes={customEdgeTypes ?? workflowEdgeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.1 }}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
        panOnScroll
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="var(--color-border)"
        />
        <Controls
          showInteractive={false}
          className="!bg-background !border-border !shadow-sm [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted"
        />
      </ReactFlow>
    </div>
  );
}
