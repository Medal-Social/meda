'use client';

import { BaseEdge, type EdgeProps, getBezierPath } from '@xyflow/react';
import type { CSSProperties } from 'react';
import { memo } from 'react';

interface DefaultEdgeData {
  readOnly?: boolean;
}

type DefaultWorkflowEdgeProps = EdgeProps & { data?: DefaultEdgeData };

function DefaultWorkflowEdgeComponent({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: DefaultWorkflowEdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeStyle: CSSProperties = {
    ...(style as CSSProperties),
    stroke: 'var(--color-border)',
    strokeWidth: 2,
  };

  return <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} />;
}

export const DefaultWorkflowEdge = memo(DefaultWorkflowEdgeComponent);
