'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { Position } from '@xyflow/react';
import { renderWorkflowIcon } from '../internal/trigger-icons.js';
import { BaseWorkflowNode } from './base-node.js';
export function ConditionNode({ data, selected }) {
    return (_jsx(BaseWorkflowNode, { kind: "condition", selected: selected, icon: renderWorkflowIcon('condition', data.iconName), label: data.label || 'Condition', description: data.description ?? 'If / else branch', sourceHandles: [
            { id: 'true', position: Position.Bottom, label: 'true' },
            { id: 'false', position: Position.Right, label: 'false' },
        ] }));
}
