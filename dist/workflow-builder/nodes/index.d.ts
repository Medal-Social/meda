import type { NodeTypes } from '@xyflow/react';
export { ActionNode } from './action-node.js';
export type { BaseWorkflowNodeProps } from './base-node.js';
export { BaseWorkflowNode } from './base-node.js';
export { ConditionNode } from './condition-node.js';
export { DelayNode } from './delay-node.js';
export { EndNode } from './end-node.js';
export { TriggerNode } from './trigger-node.js';
/**
 * Default node-type registry. Pass into `<ReactFlow nodeTypes>` or override
 * via `WorkflowBuilderProps['customNodeTypes']`.
 */
export declare const workflowNodeTypes: NodeTypes;
