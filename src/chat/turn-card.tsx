import { Play } from 'lucide-react';
import { formatClock, formatRelativeOffset } from '../lib/format-time.js';
import { LatencyBadge } from './latency-badge.js';
import { ToolCallBlock } from './tool-call-block.js';
import type { Turn } from './types.js';

export interface TurnCardProps {
  turn: Turn;
  /** Reference instant for the relative offset column (typically the conversation start). */
  startedAtRef: number;
  tz?: string;
  onPlay?: (turnId: string) => void;
  className?: string;
}

const SPEAKER_LABEL: Record<Turn['speaker'], string> = {
  user: 'You',
  assistant: 'Assistant',
  system: 'System',
};

export function TurnCard({ turn, startedAtRef, tz, onPlay, className }: TurnCardProps) {
  const label = turn.speakerLabel ?? SPEAKER_LABEL[turn.speaker];
  const offset = turn.startedAt - startedAtRef;

  // amber-700 (not -500) for the 11px system speaker label so it clears
  // WCAG AA (4.5:1) against the card background.
  const speakerColor =
    turn.speaker === 'assistant'
      ? 'text-primary'
      : turn.speaker === 'system'
        ? 'text-amber-700'
        : 'text-foreground';

  return (
    <div
      className={[
        'grid grid-cols-[64px_1fr] gap-5 border-b border-border py-4 last:border-b-0',
        className ?? '',
      ].join(' ')}
    >
      <div className="pt-1 text-[11px] tabular-nums text-muted-foreground">
        <strong className="mb-0.5 block text-[12px] font-medium text-muted-foreground">
          {formatClock(new Date(turn.startedAt), { tz })}
        </strong>
        {formatRelativeOffset(offset)}
      </div>
      <div>
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={['text-[11px] font-semibold uppercase tracking-wider', speakerColor].join(
              ' '
            )}
          >
            {label}
          </span>
          {turn.modelLabel && (
            <span className="rounded bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
              {turn.modelLabel}
            </span>
          )}
          {turn.spokenSeconds != null && turn.speaker === 'user' && (
            <span className="rounded bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
              spoken · {turn.spokenSeconds.toFixed(1)}s
            </span>
          )}
        </div>
        <p
          className="text-[15px] leading-relaxed text-foreground"
          data-streaming={String(turn.streaming ?? false)}
        >
          {turn.text}
          {turn.streaming && (
            <span aria-hidden="true" className="ml-0.5 animate-pulse text-primary">
              ▍
            </span>
          )}
        </p>
        {turn.toolCalls?.map((c) => (
          <ToolCallBlock key={c.id} call={c} />
        ))}
        {(turn.audioUrl || turn.latency) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground">
            {turn.audioUrl && (
              <button
                type="button"
                aria-label="Play this turn"
                onClick={() => onPlay?.(turn.id)}
                className="inline-flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
              >
                <Play className="size-3" />
              </button>
            )}
            {turn.latency?.sttMs != null && <LatencyBadge kind="stt" ms={turn.latency.sttMs} />}
            {turn.latency?.claudeMs != null && (
              <LatencyBadge kind="claude" ms={turn.latency.claudeMs} />
            )}
            {turn.latency?.ttsMs != null && <LatencyBadge kind="tts" ms={turn.latency.ttsMs} />}
          </div>
        )}
      </div>
    </div>
  );
}
