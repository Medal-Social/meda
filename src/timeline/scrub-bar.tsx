import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import { useRef } from 'react';
import { formatDuration } from '../lib/format-time.js';
import { cn } from '../lib/utils.js';
import type { ScrubMark } from './types.js';

export interface ScrubBarProps {
  durationMs: number;
  positionMs: number;
  isLive?: boolean;
  marks: ScrubMark[];
  onSeek: (positionMs: number) => void;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onSkipBack?: () => void;
  onSkipForward?: () => void;
  className?: string;
}

const KIND_COLOR: Record<ScrubMark['kind'], string> = {
  turn: 'bg-primary',
  tool: 'bg-warning',
  barge: 'bg-success',
  error: 'bg-destructive',
};

export function ScrubBar({
  durationMs,
  positionMs,
  isLive = false,
  marks,
  onSeek,
  isPlaying,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  className,
}: ScrubBarProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const showPlayPause = isPlaying !== undefined;
  const isPlayingValue = isPlaying ?? false;

  const fillPct = durationMs > 0 ? Math.min(100, (positionMs / durationMs) * 100) : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    onSeek(pct * durationMs);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = durationMs / 100;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onSeek(Math.max(0, positionMs - step));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onSeek(Math.min(durationMs, positionMs + step));
    }
  };

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-3.5', className)}>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Timeline · this call
        </span>
        <div className="flex items-center gap-1">
          <span className="px-1.5 text-[11px] tabular-nums text-muted-foreground">
            {formatDuration(positionMs)}
            {isLive ? ' / live' : ` / ${formatDuration(durationMs)}`}
          </span>
          {onSkipBack && (
            <TransportBtn label="Skip back" onClick={onSkipBack}>
              <SkipBack className="size-3.5" />
            </TransportBtn>
          )}
          {showPlayPause && (
            <TransportBtn
              label={isPlayingValue ? 'Pause' : 'Play'}
              variant="primary"
              onClick={onPlayPause ?? (() => {})}
            >
              {isPlayingValue ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            </TransportBtn>
          )}
          {onSkipForward && (
            <TransportBtn label="Skip forward" onClick={onSkipForward}>
              <SkipForward className="size-3.5" />
            </TransportBtn>
          )}
        </div>
      </div>

      <div
        ref={trackRef}
        role="slider"
        aria-label="Conversation position"
        aria-valuemin={0}
        aria-valuemax={durationMs}
        aria-valuenow={positionMs}
        onClick={handleSeek}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className="relative h-8 cursor-pointer overflow-hidden rounded-md bg-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 bg-primary/10"
          style={{ width: `${fillPct}%` }}
        />
        {marks.map((m) => (
          <span
            key={m.id}
            data-mark-kind={m.kind}
            title={m.label ?? m.kind}
            className={cn('absolute inset-y-1 w-0.5 rounded-sm', KIND_COLOR[m.kind])}
            style={{ left: `${m.positionPct}%` }}
          />
        ))}
        <span
          aria-hidden="true"
          className="absolute -inset-y-0.5 w-0.5 bg-foreground"
          style={{ left: `${fillPct}%` }}
        />
      </div>

      <div className="flex justify-between pt-2 text-[10px] tabular-nums text-muted-foreground">
        <span>0:00</span>
        <span>{isLive ? 'now' : formatDuration(durationMs)}</span>
      </div>
    </div>
  );
}

function TransportBtn({
  label,
  onClick,
  variant,
  children,
}: {
  label: string;
  onClick: () => void;
  variant?: 'primary';
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'inline-flex size-6 items-center justify-center rounded',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
