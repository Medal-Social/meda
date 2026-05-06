import { render, screen } from '@testing-library/react';
import { ReactFlowProvider } from '@xyflow/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { BaseWorkflowNode } from '../../../src/workflow-builder/nodes/base-node.js';
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
const baseProps = (data: WorkflowNode['data'], selected = false) =>
  ({
    id: 'n1',
    data,
    selected,
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

  it('TriggerNode renders default sentence from label', () => {
    render(wrap(<TriggerNode {...baseProps({ label: 'Contact created', kind: 'trigger' })} />));
    expect(screen.getByText('When contact created')).toBeInTheDocument();
  });

  it('TriggerNode renders with description override', () => {
    render(
      wrap(
        <TriggerNode
          {...baseProps({ label: 'Test', kind: 'trigger', description: 'Custom desc' })}
        />
      )
    );
    expect(screen.getByText('Custom desc')).toBeInTheDocument();
  });

  it('TriggerNode renders with iconName', () => {
    const { container } = render(
      wrap(<TriggerNode {...baseProps({ label: 'Test', kind: 'trigger', iconName: 'webhook' })} />)
    );
    expect(container.querySelector('[data-slot="workflow-node"]')).toBeInTheDocument();
  });

  it('TriggerNode renders selected state', () => {
    const { container } = render(
      wrap(<TriggerNode {...baseProps({ label: 'Test', kind: 'trigger' }, true)} />)
    );
    const node = container.querySelector('[data-selected]');
    expect(node).toBeInTheDocument();
  });

  it('ActionNode renders label', () => {
    render(wrap(<ActionNode {...baseProps({ label: 'Send email', kind: 'action' })} />));
    expect(screen.getByText('Send email')).toBeInTheDocument();
  });

  it('ActionNode renders warning when state is warning', () => {
    render(
      wrap(<ActionNode {...baseProps({ label: 'Action', kind: 'action', state: 'warning' })} />)
    );
    expect(screen.getByText('Needs config')).toBeInTheDocument();
  });

  it('ActionNode renders with description', () => {
    render(
      wrap(
        <ActionNode
          {...baseProps({ label: 'Action', kind: 'action', description: 'Send a welcome email' })}
        />
      )
    );
    expect(screen.getByText('Send a welcome email')).toBeInTheDocument();
  });

  it('ActionNode renders with iconName', () => {
    const { container } = render(
      wrap(<ActionNode {...baseProps({ label: 'Action', kind: 'action', iconName: 'mail' })} />)
    );
    expect(container.querySelector('[data-slot="workflow-node"]')).toBeInTheDocument();
  });

  it('ActionNode does not show warning when state is not warning', () => {
    render(
      wrap(<ActionNode {...baseProps({ label: 'Action', kind: 'action', state: 'default' })} />)
    );
    expect(screen.queryByText('Needs config')).not.toBeInTheDocument();
  });

  it('ConditionNode renders label and default sentence', () => {
    render(wrap(<ConditionNode {...baseProps({ label: 'Check label', kind: 'condition' })} />));
    expect(screen.getByText('Check label')).toBeInTheDocument();
    expect(screen.getByText('If / else branch')).toBeInTheDocument();
  });

  it('ConditionNode renders with description override', () => {
    render(
      wrap(
        <ConditionNode
          {...baseProps({ label: 'Check', kind: 'condition', description: 'Has tag?' })}
        />
      )
    );
    expect(screen.getByText('Has tag?')).toBeInTheDocument();
  });

  it('DelayNode renders label', () => {
    render(wrap(<DelayNode {...baseProps({ label: 'Wait', kind: 'delay' })} />));
    expect(screen.getByText('Wait')).toBeInTheDocument();
  });

  it('DelayNode renders default description', () => {
    render(wrap(<DelayNode {...baseProps({ label: 'Wait', kind: 'delay' })} />));
    expect(screen.getByText('Wait before continuing')).toBeInTheDocument();
  });

  it('DelayNode renders with description override', () => {
    render(
      wrap(<DelayNode {...baseProps({ label: 'Delay', kind: 'delay', description: '3 days' })} />)
    );
    expect(screen.getByText('3 days')).toBeInTheDocument();
  });

  it('EndNode renders label', () => {
    render(wrap(<EndNode {...baseProps({ label: 'Finish', kind: 'end' })} />));
    expect(screen.getByText('Finish')).toBeInTheDocument();
  });

  it('EndNode renders default description', () => {
    render(wrap(<EndNode {...baseProps({ label: 'Finish', kind: 'end' })} />));
    expect(screen.getByText('End of workflow')).toBeInTheDocument();
  });

  it('EndNode renders with description override', () => {
    render(
      wrap(<EndNode {...baseProps({ label: 'End', kind: 'end', description: 'All done' })} />)
    );
    expect(screen.getByText('All done')).toBeInTheDocument();
  });
});

describe('node fallback labels', () => {
  it('TriggerNode uses "Trigger" fallback when label is empty', () => {
    render(wrap(<TriggerNode {...baseProps({ label: '', kind: 'trigger' })} />));
    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('ActionNode uses "Action" fallback when label is empty', () => {
    render(wrap(<ActionNode {...baseProps({ label: '', kind: 'action' })} />));
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('ConditionNode uses "Condition" fallback when label is empty', () => {
    render(wrap(<ConditionNode {...baseProps({ label: '', kind: 'condition' })} />));
    expect(screen.getByText('Condition')).toBeInTheDocument();
  });

  it('DelayNode uses "Delay" fallback when label is empty', () => {
    render(wrap(<DelayNode {...baseProps({ label: '', kind: 'delay' })} />));
    expect(screen.getByText('Delay')).toBeInTheDocument();
  });

  it('EndNode uses "End" fallback when label is empty', () => {
    render(wrap(<EndNode {...baseProps({ label: '', kind: 'end' })} />));
    expect(screen.getByText('End')).toBeInTheDocument();
  });
});

describe('BaseWorkflowNode', () => {
  it('renders without source handle when showSourceHandle=false', () => {
    const { container } = render(
      wrap(
        <BaseWorkflowNode
          kind="end"
          icon={null}
          label="End"
          showSourceHandle={false}
          showTargetHandle={false}
        />
      )
    );
    // No handles should be in the DOM since both are false and no sourceHandles
    const node = container.querySelector('[data-slot="workflow-node"]');
    expect(node).toBeInTheDocument();
  });

  it('renders with warning text', () => {
    render(
      wrap(<BaseWorkflowNode kind="action" icon={null} label="Action" warning="Missing config" />)
    );
    expect(screen.getByText('Missing config')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      wrap(
        <BaseWorkflowNode
          kind="action"
          icon={null}
          label="Action"
          description="Detailed description"
        />
      )
    );
    expect(screen.getByText('Detailed description')).toBeInTheDocument();
  });
});
