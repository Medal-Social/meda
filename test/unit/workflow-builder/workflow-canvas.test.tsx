import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowCanvas } from '../../../src/workflow-builder/workflow-canvas.js';

describe('WorkflowCanvas', () => {
  it('renders without crashing with empty data', () => {
    const { container } = render(
      <div style={{ width: 800, height: 600 }}>
        <WorkflowCanvas
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
        />
      </div>
    );
    expect(container.querySelector('[data-slot="workflow-canvas"]')).toBeInTheDocument();
  });

  it('renders in readOnly mode without crashing', () => {
    const { container } = render(
      <div style={{ width: 800, height: 600 }}>
        <WorkflowCanvas
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          readOnly
        />
      </div>
    );
    expect(container.querySelector('[data-slot="workflow-canvas"]')).toBeInTheDocument();
  });

  it('accepts onNodeClick without crashing', () => {
    const onNodeClick = vi.fn();
    const { container } = render(
      <div style={{ width: 800, height: 600 }}>
        <WorkflowCanvas
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          onNodeClick={onNodeClick}
        />
      </div>
    );
    expect(container.querySelector('[data-slot="workflow-canvas"]')).toBeInTheDocument();
  });

  it('accepts onSelectionChange without crashing', () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <div style={{ width: 800, height: 600 }}>
        <WorkflowCanvas
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          onSelectionChange={onSelectionChange}
        />
      </div>
    );
    expect(container.querySelector('[data-slot="workflow-canvas"]')).toBeInTheDocument();
  });

  it('accepts onPaneClick without crashing', () => {
    const onPaneClick = vi.fn();
    const { container } = render(
      <div style={{ width: 800, height: 600 }}>
        <WorkflowCanvas
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          onPaneClick={onPaneClick}
        />
      </div>
    );
    expect(container.querySelector('[data-slot="workflow-canvas"]')).toBeInTheDocument();
  });

  it('accepts custom node and edge types without crashing', () => {
    const { container } = render(
      <div style={{ width: 800, height: 600 }}>
        <WorkflowCanvas
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          customNodeTypes={{}}
          customEdgeTypes={{}}
        />
      </div>
    );
    expect(container.querySelector('[data-slot="workflow-canvas"]')).toBeInTheDocument();
  });
});
