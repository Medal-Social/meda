export type LatencyKind = 'stt' | 'claude' | 'tts';

export interface LatencyBadgeProps {
  kind: LatencyKind;
  ms: number;
  className?: string;
}

const KIND: Record<LatencyKind, { label: string; tone: string }> = {
  stt: { label: 'STT', tone: 'text-sky-400' },
  claude: { label: 'Claude', tone: 'text-primary' },
  tts: { label: 'TTS', tone: 'text-emerald-500' },
};

function fmt(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms)}ms`;
}

export function LatencyBadge({ kind, ms, className }: LatencyBadgeProps) {
  const meta = KIND[kind];
  return (
    <span
      data-kind={kind}
      className={[
        'inline-flex items-center gap-1.5 text-[11px] tabular-nums',
        meta.tone,
        className ?? '',
      ].join(' ')}
    >
      <span aria-hidden="true" className="size-1 rounded-full bg-current" />
      {meta.label} {fmt(ms)}
    </span>
  );
}
