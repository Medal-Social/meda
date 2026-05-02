'use client';

import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '../lib/utils.js';
import type { DevicePreview } from './types.js';

interface ViewControlsProps {
  device: DevicePreview;
  onDeviceChange: (next: DevicePreview) => void;
  desktopLabel: string;
  mobileLabel: string;
}

/** Toggle between desktop and mobile preview modes. */
export function ViewControls({
  device,
  onDeviceChange,
  desktopLabel,
  mobileLabel,
}: ViewControlsProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Preview width"
      data-slot="email-builder-view-controls"
      className="inline-flex rounded-md border border-input p-0.5"
    >
      {/* biome-ignore lint/a11y/useSemanticElements: visual toggle group, radio role is correct */}
      <button
        type="button"
        role="radio"
        aria-checked={device === 'desktop'}
        aria-label={desktopLabel}
        onClick={() => onDeviceChange('desktop')}
        className={cn(
          'inline-flex h-9 w-10 items-center justify-center rounded',
          device === 'desktop'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent'
        )}
      >
        <Monitor className="size-4" aria-hidden />
      </button>
      {/* biome-ignore lint/a11y/useSemanticElements: visual toggle group, radio role is correct */}
      <button
        type="button"
        role="radio"
        aria-checked={device === 'mobile'}
        aria-label={mobileLabel}
        onClick={() => onDeviceChange('mobile')}
        className={cn(
          'inline-flex h-9 w-10 items-center justify-center rounded',
          device === 'mobile'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent'
        )}
      >
        <Smartphone className="size-4" aria-hidden />
      </button>
    </div>
  );
}
