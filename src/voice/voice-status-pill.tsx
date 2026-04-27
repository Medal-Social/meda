'use client';

import { cn } from '../lib/utils.js';
import type { TurnPhase } from './types.js';

export interface VoiceStatusPillProps {
  phase: TurnPhase;
  thinkingForMs?: number;
  className?: string;
}

const PHASE_LABEL: Record<TurnPhase, string> = {
  idle: 'Idle',
  listening: 'Listening',
  thinking: 'Thinking',
  speaking: 'Speaking',
  error: 'Error',
};

export function VoiceStatusPill({ phase, thinkingForMs, className }: VoiceStatusPillProps) {
  const tone =
    phase === 'listening'
      ? 'bg-primary text-primary-foreground'
      : phase === 'speaking'
        ? 'bg-success text-success-foreground'
        : phase === 'error'
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-muted text-muted-foreground';
  const seconds = thinkingForMs ? (thinkingForMs / 1000).toFixed(1) : null;
  return (
    <span
      role="status"
      data-phase={phase}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        tone,
        className
      )}
    >
      <span
        className={cn('size-1.5 rounded-full bg-current', phase === 'thinking' && 'animate-pulse')}
      />
      {PHASE_LABEL[phase]}
      {/* Drop the opacity entirely — even opacity-80 against bg-muted gave
          4.33:1 in axe, just under WCAG AA. The seconds suffix already
          reads as secondary because of the leading "· " bullet. */}
      {phase === 'thinking' && seconds && <span>· {seconds}s</span>}
    </span>
  );
}
