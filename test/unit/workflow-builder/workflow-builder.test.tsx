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

  it('hides toolbox when showToolbox=false', () => {
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          showToolbox={false}
        />
      </div>
    );
    expect(document.querySelector('[data-slot="workflow-toolbox"]')).not.toBeInTheDocument();
    // Mobile tab bar is also hidden when showToolbox=false and no inspectorSlot
    expect(document.querySelector('[data-slot="workflow-mobile-tab-bar"]')).not.toBeInTheDocument();
  });

  it('renders mobile tab bar when showToolbox=true', () => {
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
    expect(document.querySelector('[data-slot="workflow-mobile-tab-bar"]')).toBeInTheDocument();
    expect(screen.getByText('Steps')).toBeInTheDocument();
  });

  it('renders inspector tab in mobile tab bar when inspectorSlot is provided', () => {
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          inspectorSlot={<div>Inspector panel</div>}
        />
      </div>
    );
    expect(screen.getByText('Inspector')).toBeInTheDocument();
  });

  it('opens and closes the toolbox mobile drawer', () => {
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
    // Click the Steps tab to open the toolbox drawer
    fireEvent.click(screen.getByText('Steps'));
    expect(document.querySelector('[data-slot="workflow-mobile-drawer"]')).toBeInTheDocument();
    // Click Close to dismiss it
    fireEvent.click(screen.getByText('Close'));
    expect(document.querySelector('[data-slot="workflow-mobile-drawer"]')).not.toBeInTheDocument();
  });

  it('toggles the toolbox drawer off when Steps tab is clicked twice', () => {
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
    const stepsBtn = screen.getByText('Steps');
    fireEvent.click(stepsBtn);
    expect(document.querySelector('[data-slot="workflow-mobile-drawer"]')).toBeInTheDocument();
    fireEvent.click(stepsBtn);
    expect(document.querySelector('[data-slot="workflow-mobile-drawer"]')).not.toBeInTheDocument();
  });

  it('opens the inspector mobile drawer and renders slot content', () => {
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          inspectorSlot={<div>Inspector panel</div>}
        />
      </div>
    );
    fireEvent.click(screen.getByText('Inspector'));
    const drawer = document.querySelector('[data-slot="workflow-mobile-drawer"]');
    expect(drawer).toBeInTheDocument();
    expect(drawer?.getAttribute('data-panel')).toBe('inspector');
    expect(screen.getAllByText('Inspector panel').length).toBeGreaterThan(0);
  });

  it('toggles the inspector drawer off when Inspector tab is clicked twice', () => {
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          inspectorSlot={<div>Inspector panel</div>}
        />
      </div>
    );
    const inspectorBtn = screen.getByText('Inspector');
    fireEvent.click(inspectorBtn);
    expect(document.querySelector('[data-slot="workflow-mobile-drawer"]')).toBeInTheDocument();
    fireEvent.click(inspectorBtn);
    expect(document.querySelector('[data-slot="workflow-mobile-drawer"]')).not.toBeInTheDocument();
  });

  it('uses custom labels for mobile drawer labels', () => {
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          labels={{ openToolbox: 'Panel', closeDrawer: 'Dismiss' }}
        />
      </div>
    );
    fireEvent.click(screen.getByText('Panel'));
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
  });

  it('does not render empty-canvas hint when nodes are present', () => {
    const nodes = [
      {
        id: 'n1',
        type: 'trigger',
        position: { x: 0, y: 0 },
        data: { label: 'Start', kind: 'trigger' as const },
      },
    ];
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={nodes}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
        />
      </div>
    );
    expect(
      screen.queryByText('Add a trigger to start building your workflow.')
    ).not.toBeInTheDocument();
  });

  it('shows only inspector tab bar button when showToolbox=false and inspectorSlot is provided', () => {
    render(
      <div style={{ height: 600, width: 800 }}>
        <WorkflowBuilder
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
          showToolbox={false}
          inspectorSlot={<div>Inspector content</div>}
        />
      </div>
    );
    const tabBar = document.querySelector('[data-slot="workflow-mobile-tab-bar"]');
    expect(tabBar).toBeInTheDocument();
    // Steps button should not be rendered
    expect(screen.queryByText('Steps')).not.toBeInTheDocument();
    // Inspector button should be in the tab bar
    const inspectorBtn = tabBar?.querySelector('button');
    expect(inspectorBtn).toBeInTheDocument();
    expect(inspectorBtn?.textContent).toBe('Inspector');
  });
});
