'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Background, BackgroundVariant, Controls, ReactFlow, } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback } from 'react';
import { cn } from '../lib/utils.js';
import { workflowEdgeTypes } from './edges/index.js';
import { workflowNodeTypes } from './nodes/index.js';
/**
 * The bare React Flow canvas, with sensible defaults wired in. No header / no
 * toolbox — compose with `WorkflowBuilder` for the full surface, or use this
 * alone when embedding in a custom layout.
 */
export function WorkflowCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick, onPaneClick, onSelectionChange, readOnly = false, customNodeTypes, customEdgeTypes, className, }) {
    const handleNodeClick = useCallback((_e, node) => {
        onNodeClick?.(node);
    }, [onNodeClick]);
    const handleSelectionChange = useCallback((params) => {
        onSelectionChange?.({
            nodes: params.nodes,
            edges: params.edges,
        });
    }, [onSelectionChange]);
    return (_jsx("div", { "data-slot": "workflow-canvas", className: cn('@container relative h-full w-full bg-muted/40', className), children: _jsxs(ReactFlow, { nodes: nodes, edges: edges, onNodesChange: readOnly ? undefined : onNodesChange, onEdgesChange: readOnly ? undefined : onEdgesChange, onConnect: readOnly ? undefined : onConnect, onNodeClick: onNodeClick ? handleNodeClick : undefined, onPaneClick: onPaneClick, onSelectionChange: onSelectionChange ? handleSelectionChange : undefined, nodeTypes: customNodeTypes ?? workflowNodeTypes, edgeTypes: customEdgeTypes ?? workflowEdgeTypes, fitView: true, fitViewOptions: { padding: 0.3, maxZoom: 1.1 }, nodesDraggable: !readOnly, nodesConnectable: !readOnly, elementsSelectable: !readOnly, panOnScroll: true, proOptions: { hideAttribution: true }, children: [_jsx(Background, { variant: BackgroundVariant.Dots, gap: 20, size: 1, color: "var(--color-border)" }), _jsx(Controls, { showInteractive: false, className: "!bg-background !border-border !shadow-sm [&>button]:!bg-background [&>button]:!border-border [&>button]:!text-foreground [&>button:hover]:!bg-muted" })] }) }));
}
