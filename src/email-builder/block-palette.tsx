'use client';

import type { LucideIcon } from 'lucide-react';
import {
  AlignLeft,
  Columns2,
  Image,
  Minus,
  MousePointerClick,
  Share2,
  Space,
  Type,
} from 'lucide-react';
import { BLOCK_REGISTRY } from './block-registry.js';
import type { BlockKind } from './types.js';

const ICONS: Record<BlockKind, LucideIcon> = {
  heading: Type,
  text: Type,
  image: Image,
  button: MousePointerClick,
  divider: Minus,
  spacer: Space,
  columns: Columns2,
  social: Share2,
  footer: AlignLeft,
};

interface BlockPaletteProps {
  onPick: (kind: BlockKind) => void;
}

/** Vertical button list of all available block kinds. */
export function BlockPalette({ onPick }: BlockPaletteProps) {
  return (
    <div data-slot="email-builder-palette" className="flex flex-col gap-1.5 p-2">
      {BLOCK_REGISTRY.map((meta) => {
        const Icon = ICONS[meta.kind];
        return (
          <button
            key={meta.kind}
            type="button"
            onClick={() => onPick(meta.kind)}
            data-slot="email-builder-palette-item"
            data-block-kind={meta.kind}
            className="flex min-h-[44px] items-center gap-3 rounded-md border border-input bg-background p-2 text-left hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm">{meta.label}</div>
              <div className="truncate text-muted-foreground text-xs">{meta.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
