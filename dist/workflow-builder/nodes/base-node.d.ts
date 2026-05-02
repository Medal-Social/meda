import { Position } from '@xyflow/react';
import type { ReactNode } from 'react';
import type { WorkflowNodeKind } from '../types.js';
export interface BaseWorkflowNodeProps {
    kind: WorkflowNodeKind;
    icon: ReactNode;
    label: string;
    description?: string;
    warning?: string;
    selected?: boolean;
    showSourceHandle?: boolean;
    showTargetHandle?: boolean;
    /** Optional named handles (e.g. for condition true/false branches). */
    sourceHandles?: Array<{
        id: string;
        position: Position;
        label?: string;
    }>;
}
export declare function BaseWorkflowNode({ kind, icon, label, description, warning, selected, showSourceHandle, showTargetHandle, sourceHandles, }: BaseWorkflowNodeProps): import("react/jsx-runtime").JSX.Element;
