import { type Connection, type EdgeChange, type NodeChange, type ReactFlowProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { WorkflowEdge, WorkflowNode } from './types.js';
export interface WorkflowCanvasProps {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    onNodeClick?: (node: WorkflowNode) => void;
    onPaneClick?: () => void;
    onSelectionChange?: (selection: {
        nodes: WorkflowNode[];
        edges: WorkflowEdge[];
    }) => void;
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
export declare function WorkflowCanvas({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick, onPaneClick, onSelectionChange, readOnly, customNodeTypes, customEdgeTypes, className, }: WorkflowCanvasProps): import("react/jsx-runtime").JSX.Element;
