// open/meda/src/workflow-builder/nodes/index.ts
import type { NodeTypes } from '@xyflow/react';
import { ActionNode } from './action-node.js';
import { ConditionNode } from './condition-node.js';
import { DelayNode } from './delay-node.js';
import { EndNode } from './end-node.js';
import { TriggerNode } from './trigger-node.js';

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
export const workflowNodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
  end: EndNode,
};
