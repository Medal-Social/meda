import { type WorkflowBuilderProps } from './types.js';
/**
 * Top-level workflow builder surface — composes the canvas, toolbox and
 * (optional) header / inspector slots into a responsive layout.
 *
 * Container queries adapt the layout: at narrower container widths the
 * toolbox collapses behind a tab bar (mobile) and at wider widths it sits to
 * the left of the canvas.
 */
export declare function WorkflowBuilder({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onAddNode, onSelectionChange, onNodeClick, showToolbox, readOnly, headerSlot, inspectorSlot, customNodeTypes, customEdgeTypes, labels, className, }: WorkflowBuilderProps): import("react/jsx-runtime").JSX.Element;
