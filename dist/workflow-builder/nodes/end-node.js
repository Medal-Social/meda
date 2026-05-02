'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { renderWorkflowIcon } from '../internal/trigger-icons.js';
import { BaseWorkflowNode } from './base-node.js';
export function EndNode({ data, selected }) {
    return (_jsx(BaseWorkflowNode, { kind: "end", selected: selected, icon: renderWorkflowIcon('end', data.iconName), label: data.label || 'End', description: data.description ?? 'End of workflow', showSourceHandle: false }));
}
