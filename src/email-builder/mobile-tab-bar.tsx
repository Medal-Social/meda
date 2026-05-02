'use client';

import { LayoutPanelLeft, Settings, SlidersHorizontal } from 'lucide-react';
import { cn } from '../lib/utils.js';
import type { EmailBuilderLabels } from './types.js';

interface MobileTabBarProps {
  labels: EmailBuilderLabels;
  onOpenBlocks: () => void;
  onOpenInspector: () => void;
  onOpenSettings: () => void;
}

/** Bottom-of-screen tab bar visible on mobile. */
export function MobileTabBar({
  labels,
  onOpenBlocks,
  onOpenInspector,
  onOpenSettings,
}: MobileTabBarProps) {
  const btnClass =
    'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-muted-foreground hover:text-foreground';
  return (
    <div
      data-slot="email-builder-mobile-tab-bar"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 flex items-stretch border-border border-t bg-background md:hidden'
      )}
    >
      <button type="button" onClick={onOpenBlocks} className={btnClass}>
        <LayoutPanelLeft className="size-5" aria-hidden />
        <span className="text-xs">{labels.openBlocks}</span>
      </button>
      <button type="button" onClick={onOpenInspector} className={btnClass}>
        <SlidersHorizontal className="size-5" aria-hidden />
        <span className="text-xs">{labels.openInspector}</span>
      </button>
      <button type="button" onClick={onOpenSettings} className={btnClass}>
        <Settings className="size-5" aria-hidden />
        <span className="text-xs">{labels.openSettings}</span>
      </button>
    </div>
  );
}
