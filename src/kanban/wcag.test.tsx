// open/meda/src/kanban/wcag.test.tsx
import { render } from '@testing-library/react';
import { Clock, PlayCircle } from 'lucide-react';
import { beforeAll, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import type { KanbanColumn, KanbanItem } from './index.js';
import { KanbanBoard } from './index.js';

beforeAll(() => {
  if (!('PointerEvent' in window)) {
    // @ts-expect-error - polyfill PointerEvent for jsdom
    window.PointerEvent = MouseEvent;
  }
});

interface Task extends KanbanItem {
  title: string;
}

const COLUMNS: KanbanColumn[] = [
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
];

const TASKS: Task[] = [
  { id: 't1', status: 'queued', position: 0, title: 'Wire Hub WS' },
  { id: 't2', status: 'running', position: 0, title: 'Add adapters' },
];

describe('KanbanBoard a11y', () => {
  it('has no axe violations', async () => {
    const { container } = render(
      <KanbanBoard<Task, string>
        columns={COLUMNS}
        items={TASKS}
        renderCard={(t) => <div>{t.title}</div>}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
