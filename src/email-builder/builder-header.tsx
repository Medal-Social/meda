'use client';

import { Download } from 'lucide-react';
import { cn } from '../lib/utils.js';
import type { DevicePreview, EmailBuilderLabels } from './types.js';
import { ViewControls } from './view-controls.js';

interface BuilderHeaderProps {
  device: DevicePreview;
  onDeviceChange: (next: DevicePreview) => void;
  onExport: () => void;
  labels: EmailBuilderLabels;
}

export function BuilderHeader({ device, onDeviceChange, onExport, labels }: BuilderHeaderProps) {
  return (
    <header
      data-slot="email-builder-header"
      className="flex h-12 items-center justify-between gap-2 border-border border-b bg-background px-4"
    >
      <div className="font-semibold text-foreground text-sm">{labels.preview}</div>
      <div className="flex items-center gap-2">
        <ViewControls
          device={device}
          onDeviceChange={onDeviceChange}
          desktopLabel={labels.desktopPreview}
          mobileLabel={labels.mobilePreview}
        />
        <button
          type="button"
          onClick={onExport}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-3 font-medium text-sm',
            'hover:bg-accent hover:text-accent-foreground'
          )}
        >
          <Download className="size-4" aria-hidden />
          {labels.exportHtml}
        </button>
      </div>
    </header>
  );
}
