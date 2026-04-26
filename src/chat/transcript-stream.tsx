import { useEffect, useRef } from 'react';
import { TurnCard } from './turn-card.js';
import type { Turn } from './types.js';

export interface TranscriptStreamProps {
  turns: Turn[];
  /** When true (default), auto-scroll to bottom on new turn IF user is already near bottom. */
  autoScroll?: boolean;
  tz?: string;
  onTurnPlay?: (turnId: string) => void;
  className?: string;
}

const SCROLL_THRESHOLD = 120;

export function TranscriptStream({
  turns,
  autoScroll = true,
  tz,
  onTurnPlay,
  className,
}: TranscriptStreamProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  // Auto-follow last turn when user is near bottom
  // biome-ignore lint/correctness/useExhaustiveDependencies: turns changes trigger scroll check
  useEffect(() => {
    const el = ref.current;
    if (!el || !autoScroll) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < SCROLL_THRESHOLD) {
      el.scrollTop = el.scrollHeight;
    }
  }, [turns, autoScroll]);

  if (turns.length === 0) {
    return (
      <div
        ref={ref}
        className={[
          'flex flex-1 items-center justify-center text-sm text-muted-foreground',
          className ?? '',
        ].join(' ')}
      >
        No turns yet.
      </div>
    );
  }

  const ref0 = turns[0]?.startedAt ?? 0;

  return (
    <div ref={ref} className={['flex-1 overflow-y-auto px-7 pb-6 pt-2', className ?? ''].join(' ')}>
      {turns.map((t) => (
        <TurnCard key={t.id} turn={t} startedAtRef={ref0} tz={tz} onPlay={onTurnPlay} />
      ))}
    </div>
  );
}
