import type { Meta, StoryObj } from '@storybook/react-vite';
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { useState } from 'react';
import { WorkflowCanvas } from '../index.js';
import type { WorkflowEdge, WorkflowNode } from '../types.js';
import { SAMPLE_EDGES, SAMPLE_NODES } from './fixtures.js';

const meta: Meta<typeof WorkflowCanvas> = {
  title: 'WorkflowBuilder/WorkflowCanvas',
  component: WorkflowCanvas,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof WorkflowCanvas>;

function Demo({ readOnly = false }: { readOnly?: boolean }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(SAMPLE_NODES);
  const [edges, setEdges] = useState<WorkflowEdge[]>(SAMPLE_EDGES);
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <WorkflowCanvas
        nodes={nodes}
        edges={edges}
        onNodesChange={(c) => setNodes((nds) => applyNodeChanges(c, nds) as WorkflowNode[])}
        onEdgesChange={(c) => setEdges((eds) => applyEdgeChanges(c, eds))}
        onConnect={() => undefined}
        readOnly={readOnly}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };
export const ReadOnly: Story = { render: () => <Demo readOnly /> };
