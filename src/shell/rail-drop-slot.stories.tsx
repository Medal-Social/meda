import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Cpu, Laptop } from 'lucide-react';
import { useState } from 'react';
import type { KanbanColumn, KanbanItem } from '../kanban/index.js';
import { handleKanbanColumnDrop, KanbanBoard } from '../kanban/index.js';
import { RailDropSlot } from './rail-drop-slot.js';

interface Task extends KanbanItem {
  title: string;
  assignedMachine?: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'backlog', label: 'Backlog', accentClass: 'bg-neutral-300' },
  { id: 'assigned', label: 'Assigned', accentClass: 'bg-info-500' },
];

const MACHINES = [
  { id: 'm1', hostname: 'studio.local', online: true, agent: 'claude' as const },
  { id: 'm2', hostname: 'beast.local', online: true, agent: 'codex' as const },
  { id: 'm3', hostname: 'laptop.local', online: false, agent: 'claude' as const },
];

const meta: Meta<typeof RailDropSlot> = {
  title: 'Shell/RailDropSlot',
  component: RailDropSlot,
  parameters: { layout: 'fullscreen' },
};
export default meta;

export const DragTaskToMachine: StoryObj = {
  render: () => {
    const [tasks, setTasks] = useState<Task[]>([
      { id: 't1', status: 'backlog', position: 0, title: 'Wire Hub WS' },
      { id: 't2', status: 'backlog', position: 1, title: 'Add adapters' },
    ]);

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      // Rail-drop-slot drop?
      if (over.data?.current?.type === 'rail-drop-slot') {
        const slotId = String(over.id);
        const machineId = slotId.replace(/^machine:/, '');
        const machine = MACHINES.find((m) => m.id === machineId);
        if (!machine || !machine.online) return;
        setTasks((prev) =>
          prev.map((t) =>
            t.id === active.id ? { ...t, status: 'assigned', assignedMachine: machine.hostname } : t
          )
        );
        return;
      }

      // Otherwise delegate to kanban column routing
      handleKanbanColumnDrop({
        event,
        items: tasks,
        columns: COLUMNS,
        onCardMove: (id, newStatus) =>
          setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: newStatus as Task['status'] } : t))
          ),
      });
    };

    return (
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid h-screen grid-cols-[1fr_320px] gap-4 p-4">
          <KanbanBoard<Task>
            headless
            columns={COLUMNS}
            items={tasks}
            renderCard={(t) => (
              <div className="rounded-md border border-border bg-card p-3 text-sm">
                <div className="font-medium">{t.title}</div>
                {t.assignedMachine && (
                  <div className="text-muted-foreground text-xs">to {t.assignedMachine}</div>
                )}
              </div>
            )}
            onCardMove={(id, newStatus) =>
              setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)))
            }
          />
          <aside className="space-y-2 overflow-auto rounded-lg border border-border bg-sidebar p-3">
            <div className="px-1 pb-2 font-medium text-sm">Machines</div>
            {MACHINES.map((m) => (
              <RailDropSlot
                key={m.id}
                id={`machine:${m.id}`}
                disabled={!m.online}
                ariaLabel={`Assign to ${m.hostname}`}
                className="p-3"
              >
                <div className="flex items-center gap-2">
                  {m.agent === 'claude' ? (
                    <Laptop className="size-4" />
                  ) : (
                    <Cpu className="size-4" />
                  )}
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{m.hostname}</div>
                    <div className="text-muted-foreground text-xs">
                      {m.online ? 'online' : 'offline'} · {m.agent}
                    </div>
                  </div>
                </div>
              </RailDropSlot>
            ))}
          </aside>
        </div>
      </DndContext>
    );
  },
};
