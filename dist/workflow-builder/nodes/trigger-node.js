'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { renderWorkflowIcon } from '../internal/trigger-icons.js';
import { getDefaultNodeSentence } from '../internal/trigger-sentence.js';
import { BaseWorkflowNode } from './base-node.js';
export function TriggerNode({ data, selected }) {
    return (_jsx(BaseWorkflowNode, { kind: "trigger", selected: selected, icon: renderWorkflowIcon('trigger', data.iconName), label: data.label || 'Trigger', description: data.description ?? getDefaultNodeSentence('trigger', data.label), showTargetHandle: false }));
}
