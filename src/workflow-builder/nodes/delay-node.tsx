'use client';

import type { NodeProps } from '@xyflow/react';
import { renderWorkflowIcon } from '../internal/trigger-icons.js';
import type { WorkflowNode } from '../types.js';
import { BaseWorkflowNode } from './base-node.js';

export function DelayNode({ data, selected }: NodeProps<WorkflowNode>) {
  return (
    <BaseWorkflowNode
      kind="delay"
      selected={selected}
      icon={renderWorkflowIcon('delay', data.iconName)}
      label={data.label || 'Delay'}
      description={data.description ?? 'Wait before continuing'}
    />
  );
}
