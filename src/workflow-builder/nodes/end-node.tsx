'use client';

import type { NodeProps } from '@xyflow/react';
import { renderWorkflowIcon } from '../internal/trigger-icons.js';
import type { WorkflowNode } from '../types.js';
import { BaseWorkflowNode } from './base-node.js';

export function EndNode({ data, selected }: NodeProps<WorkflowNode>) {
  return (
    <BaseWorkflowNode
      kind="end"
      selected={selected}
      icon={renderWorkflowIcon('end', data.iconName)}
      label={data.label || 'End'}
      description={data.description ?? 'End of workflow'}
      showSourceHandle={false}
    />
  );
}
