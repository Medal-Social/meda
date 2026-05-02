'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { BaseEdge, getBezierPath } from '@xyflow/react';
import { memo } from 'react';
function DefaultWorkflowEdgeComponent({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, }) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    const edgeStyle = {
        ...style,
        stroke: 'var(--color-border)',
        strokeWidth: 2,
    };
    return _jsx(BaseEdge, { path: edgePath, markerEnd: markerEnd, style: edgeStyle });
}
export const DefaultWorkflowEdge = memo(DefaultWorkflowEdgeComponent);
