'use client';

import type { ReactNode } from 'react';
import { useState } from 'react';
import { cn } from '../lib/utils.js';
import type { EmailBuilderLabels } from './types.js';

type TabId = 'blocks' | 'design' | 'envelope';

interface BuilderLeftTabsProps {
  labels: EmailBuilderLabels;
  blocksContent: ReactNode;
  designContent?: ReactNode;
  envelopeContent: ReactNode;
}

/** Vertical tab strip + content panel for the left sidebar. */
export function BuilderLeftTabs({
  labels,
  blocksContent,
  designContent,
  envelopeContent,
}: BuilderLeftTabsProps) {
  const [tab, setTab] = useState<TabId>('blocks');
  const tabs: { id: TabId; label: string; content: ReactNode }[] = [
    { id: 'blocks', label: labels.blocksTab, content: blocksContent },
    { id: 'envelope', label: labels.envelopeTab, content: envelopeContent },
  ];
  if (designContent) {
    tabs.splice(1, 0, { id: 'design', label: labels.designTab, content: designContent });
  }
  /* v8 ignore next -- fallback to tabs[0] is unreachable; tab state is always set to a valid TabId */
  const active = tabs.find((t) => t.id === tab) ?? tabs[0];
  return (
    <div data-slot="email-builder-left-tabs" className="flex h-full flex-col">
      <div role="tablist" className="flex border-border border-b">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === tab}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex h-11 flex-1 items-center justify-center text-sm transition-colors',
              t.id === tab
                ? 'border-primary border-b-2 font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="flex-1 overflow-y-auto">
        {active?.content}
      </div>
    </div>
  );
}
