import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowBuilder } from '../../../src/workflow-builder/index.js';
import { WorkflowHeader } from '../../../src/workflow-builder/workflow-header.js';

describe('WorkflowBuilder', () => {
  it('renders empty-canvas hint when there are no nodes', () => {
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
        />
      </div>
    );
    expect(screen.getByText('Add a trigger to start building your workflow.')).toBeInTheDocument();
  });

  it('renders header slot when provided', () => {
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          headerSlot={<WorkflowHeader name="Demo" />}
        />
      </div>
    );
    expect(screen.getByText('Demo')).toBeInTheDocument();
  });

  it('forwards onAddNode from the toolbox', () => {
    const onAdd = vi.fn();
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          onAddNode={onAdd}
        />
      </div>
    );
    // Toolbox is hidden behind a container query in jsdom; click any of the
    // toolbox-item buttons via querySelectorAll.
    const buttons = document.querySelectorAll('[data-slot="workflow-toolbox-item"]');
    expect(buttons.length).toBeGreaterThan(0);
    const triggerBtn = Array.from(buttons).find((b) => b.getAttribute('data-kind') === 'trigger');
    if (!triggerBtn) throw new Error('trigger toolbox item not found');
    fireEvent.click(triggerBtn);
    expect(onAdd).toHaveBeenCalledWith('trigger');
  });
});
