import { Zap } from 'lucide-react';
import type { ToolCall } from './types.js';

export interface ToolCallBlockProps {
  call: ToolCall;
  className?: string;
}

function safeStringify(v: unknown): string {
  // Tolerate values JSON.stringify can't handle (BigInt, circular refs, etc.)
  // so a malformed tool arg never crashes the transcript view.
  try {
    const out = JSON.stringify(v);
    return out === undefined ? String(v) : out;
  } catch {
    return String(v);
  }
}

export function ToolCallBlock({ call, className }: ToolCallBlockProps) {
  return (
    <div
      className={[
        'mt-3 rounded-md border border-border border-l-2 border-l-amber-500 bg-card p-3 font-mono text-xs',
        className ?? '',
      ].join(' ')}
    >
      <div className="mb-1.5 flex items-center gap-2 text-[11px]">
        <Zap className="size-3 text-amber-500" />
        <strong className="font-semibold text-foreground">{call.name}</strong>
        {call.latencyMs != null && (
          <span className="ml-auto tabular-nums text-muted-foreground">{call.latencyMs}ms</span>
        )}
      </div>
      <div className="text-muted-foreground">
        {Object.entries(call.args && typeof call.args === 'object' ? call.args : {}).map(
          ([k, v], i) => (
            <span key={k}>
              {i > 0 && ', '}
              <span className="text-primary">{k}</span>: {''}
              <span className="text-emerald-500">{safeStringify(v)}</span>
            </span>
          )
        )}
        {call.resultSummary && (
          <span className="text-muted-foreground"> → {call.resultSummary}</span>
        )}
      </div>
    </div>
  );
}
