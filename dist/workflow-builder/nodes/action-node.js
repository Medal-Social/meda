'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { renderWorkflowIcon } from '../internal/trigger-icons.js';
import { BaseWorkflowNode } from './base-node.js';
export function ActionNode({ data, selected }) {
    return (_jsx(BaseWorkflowNode, { kind: "action", selected: selected, icon: renderWorkflowIcon('action', data.iconName), label: data.label || 'Action', description: data.description, warning: data.state === 'warning' ? 'Needs config' : undefined }));
}
