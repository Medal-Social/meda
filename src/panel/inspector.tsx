import { useState } from 'react';
import type { InspectorTab } from './types.js';

export interface InspectorProps {
  tabs: InspectorTab[];
  defaultTab?: string;
  className?: string;
}

export function Inspector({ tabs, defaultTab, className }: InspectorProps) {
  const [active, setActive] = useState<string>(defaultTab ?? tabs[0]?.id ?? '');
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <aside
      className={['flex h-full flex-col border-l border-border bg-card', className ?? ''].join(' ')}
    >
      <div role="tablist" className="flex gap-0.5 border-b border-border px-3.5">
        {tabs.map((t) => (
          <button
            type="button"
            role="tab"
            aria-selected={t.id === active}
            key={t.id}
            onClick={() => setActive(t.id)}
            className={[
              'border-b-2 px-2.5 py-3 text-xs',
              t.id === active
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">{current?.content}</div>
    </aside>
  );
}
