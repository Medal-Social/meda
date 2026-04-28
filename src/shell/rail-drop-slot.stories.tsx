import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Target } from 'lucide-react';
import { useState } from 'react';
import type { KanbanColumn, KanbanItem } from '../kanban/index.js';
import { handleKanbanColumnDrop, KanbanBoard } from '../kanban/index.js';
import { DragModeBanner } from './drag-mode-banner.js';
import { RailDropSlot, type RailDropSlotState } from './rail-drop-slot.js';
import { RailDropZones } from './rail-drop-zones.js';

// ---------------------------------------------------------------------------
// Fixture data matching the Pencil design's content shape
// ---------------------------------------------------------------------------

interface Machine {
  id: string;
  hostname: string;
  online: boolean;
  agents: Array<'claude' | 'codex'>;
  capacity: { used: number; total: number };
  repos: string[];
}

const MACHINES: Machine[] = [
  {
    id: 'mac-mini-01',
    hostname: 'mac-mini-01',
    online: true,
    agents: ['claude', 'codex'],
    capacity: { used: 2, total: 4 },
    repos: ['medal-mono', 'meda'],
  },
  {
    id: 'studio-mbp',
    hostname: 'studio-mbp',
    online: true,
    agents: ['claude'],
    capacity: { used: 1, total: 3 },
    repos: ['medal-mono'],
  },
  {
    id: 'home-server',
    hostname: 'home-server',
    online: true,
    agents: ['codex'],
    capacity: { used: 3, total: 3 },
    repos: ['meda', 'pilot'],
  },
  {
    id: 'work-laptop',
    hostname: 'work-laptop',
    online: false,
    agents: ['claude'],
    capacity: { used: 0, total: 2 },
    repos: ['medal-mono'],
  },
];

interface Task extends KanbanItem {
  title: string;
  assignedMachine?: string;
}

const COLUMNS: KanbanColumn[] = [
  { id: 'backlog', label: 'Backlog', accentClass: 'bg-neutral-300' },
  { id: 'assigned', label: 'Assigned', accentClass: 'bg-info-500' },
];

// ---------------------------------------------------------------------------
// MachineSlotContent — state-aware machine card content
// ---------------------------------------------------------------------------

function MachineSlotContent({
  machine,
  state,
  activeTaskTitle,
}: {
  machine: Machine;
  state: RailDropSlotState;
  activeTaskTitle?: string;
}) {
  const slotsLeft = machine.capacity.total - machine.capacity.used;

  if (state === 'over') {
    return (
      <div className="flex flex-col gap-1.5 p-3">
        <div className="font-medium text-primary text-sm">Drop to dispatch</div>
        <div className="text-muted-foreground text-xs">
          Task: {activeTaskTitle ?? 'selected task'}
        </div>
        <div className="text-muted-foreground text-xs">
          Agent: {machine.agents[0]} · {machine.repos[0]}
        </div>
        <div className="text-muted-foreground text-xs">
          Slot {machine.capacity.used + 1} / {machine.capacity.total}
        </div>
      </div>
    );
  }

  if (state === 'rejected') {
    return (
      <div className="flex items-center gap-2 p-3">
        <div className="size-2 rounded-full bg-muted-foreground" />
        <div className="flex-1 text-sm">
          <div className="font-medium text-muted-foreground">{machine.hostname}</div>
          <div className="text-muted-foreground text-xs">
            {machine.online ? '0 slots free' : 'offline · 0 slots'}
          </div>
        </div>
        <div className="text-muted-foreground text-xs tabular-nums">
          {machine.capacity.used}/{machine.capacity.total}
        </div>
      </div>
    );
  }

  if (state === 'active') {
    return (
      <div className="flex items-center gap-2 p-3">
        <div className="size-2 rounded-full bg-success-500" />
        <div className="flex-1 text-sm">
          <div className="font-medium">{machine.hostname}</div>
          <div className="text-primary text-xs">
            Available · {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} free
          </div>
        </div>
        <div className="text-muted-foreground text-xs tabular-nums">
          {machine.capacity.used}/{machine.capacity.total}
        </div>
      </div>
    );
  }

  // idle
  return (
    <div className="flex items-center gap-2 p-3">
      <div
        className={`size-2 rounded-full ${machine.online ? 'bg-success-500' : 'bg-muted-foreground'}`}
      />
      <div className="flex-1 text-sm">
        <div className="font-medium">{machine.hostname}</div>
        <div className="flex flex-wrap gap-1 pt-0.5">
          {machine.agents.map((agent) => (
            <span
              key={agent}
              className="rounded bg-muted px-1 py-0.5 font-mono text-muted-foreground text-xs"
            >
              {agent}
            </span>
          ))}
          {machine.repos.map((repo) => (
            <span key={repo} className="text-muted-foreground text-xs">
              {repo}
            </span>
          ))}
        </div>
      </div>
      <div className="text-muted-foreground text-xs tabular-nums">
        {machine.capacity.used}/{machine.capacity.total}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Story meta
// ---------------------------------------------------------------------------

const meta: Meta<typeof RailDropSlot> = {
  title: 'Shell/RailDropSlot',
  component: RailDropSlot,
  parameters: { layout: 'fullscreen' },
};
export default meta;

// ---------------------------------------------------------------------------
// Drop-zones demo story
// ---------------------------------------------------------------------------

export const DropZonesDemo: StoryObj = {
  name: 'Drop zones demo',
  render: () => {
    const [tasks, setTasks] = useState<Task[]>([
      { id: 't1', status: 'backlog', position: 0, title: 'ENG-405: Wire Hub WS' },
      { id: 't2', status: 'backlog', position: 1, title: 'ENG-406: Add adapters' },
      { id: 't3', status: 'backlog', position: 2, title: 'ENG-407: Refactor auth' },
    ]);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTaskId(null);

      if (!over) return;

      // Rail-drop-slot drop
      if (over.data?.current?.type === 'rail-drop-slot') {
        const machineId = String(over.id).replace(/^machine:/, '');
        const machine = MACHINES.find((m) => m.id === machineId);
        if (!machine || !machine.online) return;
        setTasks((prev) =>
          prev.map((t) =>
            t.id === active.id ? { ...t, status: 'assigned', assignedMachine: machine.hostname } : t
          )
        );
        return;
      }

      // Kanban column routing
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

    const eligibleCount = MACHINES.filter(
      (m) => m.online && m.capacity.used < m.capacity.total
    ).length;

    return (
      <DndContext
        onDragStart={(e) => setActiveTaskId(String(e.active.id))}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTaskId(null)}
      >
        <div className="flex flex-col gap-0 h-screen">
          <DragModeBanner
            message="Drop on a machine to assign"
            cancelKey="ESC"
            className="border-b border-border bg-background/80 backdrop-blur"
          />
          <div className="grid flex-1 grid-cols-[1fr_320px] gap-4 overflow-hidden p-4">
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

            <aside className="overflow-auto">
              <RailDropZones
                title="Drop zones"
                subtitle={
                  activeTask
                    ? `Eligible machines for ${activeTask.title}`
                    : 'Eligible machines for this task'
                }
                count={`${eligibleCount} / ${MACHINES.length}`}
                icon={<Target className="size-4" />}
              >
                {MACHINES.map((machine) => {
                  const isAtCapacity = machine.capacity.used >= machine.capacity.total;
                  const isDisabled = !machine.online || isAtCapacity;

                  return (
                    <RailDropSlot
                      key={machine.id}
                      id={`machine:${machine.id}`}
                      disabled={isDisabled}
                      ariaLabel={`Assign to ${machine.hostname}`}
                      render={(state) => (
                        <MachineSlotContent
                          machine={machine}
                          state={state}
                          activeTaskTitle={activeTask?.title}
                        />
                      )}
                    />
                  );
                })}
              </RailDropZones>
            </aside>
          </div>
        </div>
      </DndContext>
    );
  },
};

// ---------------------------------------------------------------------------
// Legacy story — kept for backward-compat
// ---------------------------------------------------------------------------

export const DragTaskToMachine: StoryObj = {
  render: () => {
    const [tasks, setTasks] = useState<Task[]>([
      { id: 't1', status: 'backlog', position: 0, title: 'Wire Hub WS' },
      { id: 't2', status: 'backlog', position: 1, title: 'Add adapters' },
    ]);

    const legacyMachines = [
      { id: 'm1', hostname: 'studio.local', online: true, agent: 'claude' as const },
      { id: 'm2', hostname: 'beast.local', online: true, agent: 'codex' as const },
      { id: 'm3', hostname: 'laptop.local', online: false, agent: 'claude' as const },
    ];

    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      if (over.data?.current?.type === 'rail-drop-slot') {
        const slotId = String(over.id);
        const machineId = slotId.replace(/^machine:/, '');
        const machine = legacyMachines.find((m) => m.id === machineId);
        if (!machine || !machine.online) return;
        setTasks((prev) =>
          prev.map((t) =>
            t.id === active.id ? { ...t, status: 'assigned', assignedMachine: machine.hostname } : t
          )
        );
        return;
      }

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
            {legacyMachines.map((m) => (
              <RailDropSlot
                key={m.id}
                id={`machine:${m.id}`}
                disabled={!m.online}
                ariaLabel={`Assign to ${m.hostname}`}
                className="p-3"
              >
                <div className="flex items-center gap-2">
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
