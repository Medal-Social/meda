// open/meda/src/workflow-builder/edges/index.ts
import type { EdgeTypes } from '@xyflow/react';
import { DefaultWorkflowEdge } from './default-edge.js';

export { DefaultWorkflowEdge } from './default-edge.js';

export const workflowEdgeTypes: EdgeTypes = {
  default: DefaultWorkflowEdge,
};
