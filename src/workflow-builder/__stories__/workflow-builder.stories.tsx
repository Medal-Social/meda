import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from '@xyflow/react';
import { useState } from 'react';
import { WorkflowBuilder } from '../index.js';
import type { WorkflowEdge, WorkflowNode } from '../types.js';
import { WorkflowHeader } from '../workflow-header.js';
import { SAMPLE_EDGES, SAMPLE_NODES } from './fixtures.js';

const meta: Meta<typeof WorkflowBuilder> = {
  title: 'Apps/Workflow/Builder',
  component: WorkflowBuilder,
  parameters: { layout: 'fullscreen' },
};
export default meta;
type Story = StoryObj<typeof WorkflowBuilder>;

function Demo({ readOnly = false }: { readOnly?: boolean }) {
  const [nodes, setNodes] = useState<WorkflowNode[]>(SAMPLE_NODES);
  const [edges, setEdges] = useState<WorkflowEdge[]>(SAMPLE_EDGES);

  return (
    <div style={{ height: '100vh' }}>
      <WorkflowBuilder
        nodes={nodes}
        edges={edges}
        onNodesChange={(c: NodeChange[]) =>
          setNodes((nds) => applyNodeChanges(c, nds) as WorkflowNode[])
        }
        onEdgesChange={(c: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(c, eds))}
        onConnect={(conn: Connection) =>
          setEdges((eds) => [...eds, { ...conn, id: `e${eds.length + 1}` } as WorkflowEdge])
        }
        onAddNode={(kind) => {
          setNodes((nds) => [
            ...nds,
            {
              id: `n${nds.length + 1}`,
              type: kind,
              position: { x: 200, y: 200 + nds.length * 40 },
              data: { label: kind, kind },
            },
          ]);
        }}
        readOnly={readOnly}
        headerSlot={
          <WorkflowHeader
            name="Welcome flow"
            status="draft"
            onSave={() => undefined}
            readOnly={readOnly}
          />
        }
      />
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };

export const Empty: Story = {
  render: () => {
    const [nodes, setNodes] = useState<WorkflowNode[]>([]);
    const [edges, setEdges] = useState<WorkflowEdge[]>([]);
    return (
      <div style={{ height: '100vh' }}>
        <WorkflowBuilder
          nodes={nodes}
          edges={edges}
          onNodesChange={(c) => setNodes((nds) => applyNodeChanges(c, nds) as WorkflowNode[])}
          onEdgesChange={(c) => setEdges((eds) => applyEdgeChanges(c, eds))}
          onConnect={() => undefined}
          onAddNode={(kind) =>
            setNodes((nds) => [
              ...nds,
              {
                id: `n${nds.length + 1}`,
                type: kind,
                position: { x: 100, y: 100 + nds.length * 60 },
                data: { label: kind, kind },
              },
            ])
          }
          headerSlot={
            <WorkflowHeader name="New workflow" status="draft" onSave={() => undefined} />
          }
        />
      </div>
    );
  },
};

export const ReadOnly: Story = { render: () => <Demo readOnly /> };
