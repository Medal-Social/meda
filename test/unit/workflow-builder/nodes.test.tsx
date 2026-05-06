import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import {
  ActionNode,
  ConditionNode,
  DelayNode,
  EndNode,
  TriggerNode,
} from '../../../src/workflow-builder/nodes/index.js';
import type { WorkflowNode } from '../../../src/workflow-builder/types.js';

function wrap(children: ReactNode) {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
}

// Mock the React Flow context that node components expect when rendered
// outside the canvas. NodeProps requires several positional fields — we cast
// minimal data through `as` to keep the test focused on rendering.
const baseProps = (data: WorkflowNode['data']) =>
  ({
    id: 'n1',
    data,
    selected: false,
    type: data.kind,
    zIndex: 0,
    isConnectable: true,
    xPos: 0,
    yPos: 0,
    dragging: false,
    targetPosition: undefined,
    sourcePosition: undefined,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    deletable: true,
    draggable: true,
    selectable: true,
    width: 264,
    height: 80,
    // biome-ignore lint/suspicious/noExplicitAny: minimal shape for rendering tests
  }) as any;

describe('node renderers', () => {
  it('TriggerNode renders label', () => {
    render(wrap(<TriggerNode {...baseProps({ label: 'Webhook in', kind: 'trigger' })} />));
    expect(screen.getByText('Webhook in')).toBeInTheDocument();
  });

  it('ActionNode renders label', () => {
    render(wrap(<ActionNode {...baseProps({ label: 'Send email', kind: 'action' })} />));
    expect(screen.getByText('Send email')).toBeInTheDocument();
  });

  it('ConditionNode renders label and default sentence', () => {
    render(wrap(<ConditionNode {...baseProps({ label: 'Check label', kind: 'condition' })} />));
    expect(screen.getByText('Check label')).toBeInTheDocument();
    expect(screen.getByText('If / else branch')).toBeInTheDocument();
  });

  it('DelayNode renders label', () => {
    render(wrap(<DelayNode {...baseProps({ label: 'Wait', kind: 'delay' })} />));
    expect(screen.getByText('Wait')).toBeInTheDocument();
  });

  it('EndNode renders label', () => {
    render(wrap(<EndNode {...baseProps({ label: 'Finish', kind: 'end' })} />));
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });
});
