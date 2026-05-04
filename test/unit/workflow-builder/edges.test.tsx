import { render } from '@testing-library/react';
import { Position } from '@xyflow/react';
import { describe, expect, it } from 'vitest';
import { DefaultWorkflowEdge } from '../../../src/workflow-builder/edges/default-edge.js';

// DefaultWorkflowEdge expects standard EdgeProps. We supply the minimum
// geometric values; markerEnd and style are optional.
const baseEdgeProps = {
  id: 'e1',
  sourceX: 0,
  sourceY: 0,
  targetX: 100,
  targetY: 100,
  sourcePosition: Position.Bottom,
  targetPosition: Position.Top,
  source: 'n1',
  target: 'n2',
  selected: false,
  animated: false,
  data: undefined,
  label: undefined,
  style: undefined,
  markerEnd: undefined,
  markerStart: undefined,
  sourceHandleId: null,
  targetHandleId: null,
  interactionWidth: 20,
  pathOptions: undefined,
};

describe('DefaultWorkflowEdge', () => {
  it('renders an SVG path without crashing', () => {
    const { container } = render(
      // biome-ignore lint/a11y/noSvgWithoutTitle: test scaffold only
      <svg aria-hidden>
        <DefaultWorkflowEdge {...baseEdgeProps} />
      </svg>
    );
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  it('renders with custom style merged', () => {
    const { container } = render(
      // biome-ignore lint/a11y/noSvgWithoutTitle: test scaffold only
      <svg aria-hidden>
        <DefaultWorkflowEdge {...baseEdgeProps} style={{ opacity: 0.5 }} />
      </svg>
    );
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  it('renders with markerEnd', () => {
    const { container } = render(
      // biome-ignore lint/a11y/noSvgWithoutTitle: test scaffold only
      <svg aria-hidden>
        <DefaultWorkflowEdge {...baseEdgeProps} markerEnd="url(#arrow)" />
      </svg>
    );
    expect(container.querySelector('path')).toBeInTheDocument();
  });
});
