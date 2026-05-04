'use client';

import type { NodeProps } from '@xyflow/react';
import { renderWorkflowIcon } from '../internal/trigger-icons.js';
import type { WorkflowNode } from '../types.js';
import { BaseWorkflowNode } from './base-node.js';

export function ActionNode({ data, selected }: NodeProps<WorkflowNode>) {
  return (
    <BaseWorkflowNode
      kind="action"
      selected={selected}
      icon={renderWorkflowIcon('action', data.iconName)}
      label={data.label || 'Action'}
      description={data.description}
      warning={data.state === 'warning' ? 'Needs config' : undefined}
    />
  );
}
