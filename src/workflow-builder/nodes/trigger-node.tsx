'use client';

import type { NodeProps } from '@xyflow/react';
import { renderWorkflowIcon } from '../internal/trigger-icons.js';
import { getDefaultNodeSentence } from '../internal/trigger-sentence.js';
import type { WorkflowNode } from '../types.js';
import { BaseWorkflowNode } from './base-node.js';

export function TriggerNode({ data, selected }: NodeProps<WorkflowNode>) {
  return (
    <BaseWorkflowNode
      kind="trigger"
      selected={selected}
      icon={renderWorkflowIcon('trigger', data.iconName)}
      label={data.label || 'Trigger'}
      description={data.description ?? getDefaultNodeSentence('trigger', data.label)}
      showTargetHandle={false}
    />
  );
}
