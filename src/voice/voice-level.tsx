'use client';

import * as React from 'react';
import { cn } from '../lib/utils.js';

export interface VoiceLevelProps {
  level: number;
  variant?: 'bars' | 'wave' | 'ring';
  width?: number;
  height?: number;
  className?: string;
}

const BAR_COUNT = 9;

export function VoiceLevel({
  level,
  variant = 'bars',
  width = 140,
  height = 48,
  className,
}: VoiceLevelProps) {
  const historyRef = React.useRef<number[]>(Array(BAR_COUNT).fill(0));
  const [, force] = React.useState(0);
  // Only the 'bars' variant reads historyRef, so gate history updates and the
  // resulting forced rerender to that variant — avoids a superfluous render on
  // every level tick for 'ring' and 'wave'.
  React.useEffect(() => {
    if (variant !== 'bars') return;
    historyRef.current = [...historyRef.current.slice(1), Math.min(1, Math.max(0, level))];
    force((v) => v + 1);
  }, [level, variant]);

  if (variant === 'bars') {
    return (
      <div
        role="presentation"
        className={cn('flex items-end gap-1', className)}
        style={{ width, height }}
      >
        {historyRef.current.map((v, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length history
            key={i}
            className="flex-1 rounded-sm bg-primary"
            style={{ height: `${15 + v * 85}%`, opacity: 0.4 + v * 0.6 }}
          />
        ))}
      </div>
    );
  }
  if (variant === 'ring') {
    const r = Math.min(width, height) / 2 - 4;
    const c = 2 * Math.PI * r;
    const filled = c * Math.min(1, Math.max(0, level));
    return (
      <svg width={width} height={height} className={className} role="presentation">
        <circle
          cx={width / 2}
          cy={height / 2}
          r={r}
          stroke="hsl(var(--border))"
          strokeWidth="3"
          fill="none"
        />
        <circle
          cx={width / 2}
          cy={height / 2}
          r={r}
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          fill="none"
          strokeDasharray={`${filled} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${width / 2} ${height / 2})`}
        />
      </svg>
    );
  }
  // 'wave' — simple bezier that scales with level
  const peak = height / 2 - 2;
  const amp = peak * Math.min(1, Math.max(0, level));
  return (
    <svg width={width} height={height} className={className} role="presentation">
      <path
        d={`M 0 ${height / 2} Q ${width / 4} ${height / 2 - amp}, ${width / 2} ${height / 2} T ${width} ${height / 2}`}
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
