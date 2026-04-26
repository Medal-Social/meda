import { LatencyBadge } from './latency-badge.js';

export interface LatencyBreakdownProps {
  sttMs: number;
  claudeMs: number;
  ttsMs: number;
  showLegend?: boolean;
  className?: string;
}

export function LatencyBreakdown({
  sttMs,
  claudeMs,
  ttsMs,
  showLegend = true,
  className,
}: LatencyBreakdownProps) {
  const total = Math.max(1, sttMs + claudeMs + ttsMs);
  const sttPct = (sttMs / total) * 100;
  const claudePct = (claudeMs / total) * 100;
  const ttsPct = (ttsMs / total) * 100;

  return (
    <div className={className}>
      <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-sm bg-muted">
        <span data-segment="stt" className="block bg-sky-400" style={{ width: `${sttPct}%` }} />
        <span
          data-segment="claude"
          className="block bg-primary"
          style={{ width: `${claudePct}%` }}
        />
        <span data-segment="tts" className="block bg-emerald-500" style={{ width: `${ttsPct}%` }} />
      </div>
      {showLegend && (
        <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] tabular-nums text-muted-foreground">
          <LatencyBadge kind="stt" ms={sttMs} />
          <LatencyBadge kind="claude" ms={claudeMs} />
          <LatencyBadge kind="tts" ms={ttsMs} />
        </div>
      )}
    </div>
  );
}
