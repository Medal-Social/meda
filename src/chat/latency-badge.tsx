export type LatencyKind = 'stt' | 'claude' | 'tts';

export interface LatencyBadgeProps {
  kind: LatencyKind;
  ms: number;
  className?: string;
}

// Tones use 700-shade variants so 11px badge text clears WCAG AA (4.5:1)
// against the white/card background. The 400/500 shades chosen for visual
// consistency with the colored bar segments don't satisfy contrast at this
// size, so the *bar* keeps the lighter shade and the *label* uses the darker.
const KIND: Record<LatencyKind, { label: string; tone: string }> = {
  stt: { label: 'STT', tone: 'text-sky-700' },
  claude: { label: 'Claude', tone: 'text-primary' },
  tts: { label: 'TTS', tone: 'text-emerald-700' },
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
