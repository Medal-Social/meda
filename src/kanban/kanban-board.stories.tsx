// open/meda/src/kanban/kanban-board.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Activity, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import type { KanbanColumn, KanbanItem } from './index.js';
import { KanbanBoard } from './index.js';

interface Task extends KanbanItem {
  title: string;
  agent: 'claude' | 'codex';
}

const TASK_COLUMNS: KanbanColumn[] = [
  {
    id: 'queued',
    label: 'Queued',
    accentClass: 'bg-neutral-300',
    icon: <Clock className="size-4" />,
  },
  {
    id: 'running',
    label: 'Running',
    accentClass: 'bg-info-500',
    icon: <PlayCircle className="size-4" />,
  },
  {
    id: 'review',
    label: 'In review',
    accentClass: 'bg-warning-500',
    icon: <Activity className="size-4" />,
  },
  {
    id: 'done',
    label: 'Done',
    accentClass: 'bg-success-500',
    icon: <CheckCircle2 className="size-4" />,
  },
];

const INITIAL_TASKS: Task[] = [
  { id: 't1', status: 'queued', position: 0, title: 'Wire Hub WS', agent: 'claude' },
  { id: 't2', status: 'running', position: 0, title: 'Add adapters', agent: 'codex' },
  { id: 't3', status: 'review', position: 0, title: 'Storybook for KanbanBoard', agent: 'claude' },
  { id: 't4', status: 'done', position: 0, title: 'Plan 2 — workers', agent: 'claude' },
];

// biome-ignore lint/suspicious/noExplicitAny: KanbanBoard is generic; Meta<typeof KanbanBoard> requires non-generic type
const meta: Meta<any> = {
  title: 'Kanban/KanbanBoard',
  component: KanbanBoard,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const DispatchTasks: StoryObj = {
  render: () => {
    const [items, setItems] = useState<Task[]>(INITIAL_TASKS);
    return (
      <div className="h-screen p-6">
        <KanbanBoard<Task, string>
          columns={TASK_COLUMNS}
          items={items}
          renderCard={(task) => (
            <div className="rounded-md border border-border bg-card p-3 text-sm">
              <div className="font-medium">{task.title}</div>
              <div className="text-muted-foreground text-xs">{task.agent}</div>
            </div>
          )}
          onCardMove={(id, newStatus) =>
            setItems((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
          }
        />
      </div>
    );
  },
};
