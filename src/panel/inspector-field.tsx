import type { ReactNode } from 'react';

export interface InspectorFieldProps {
  label: string;
  value: ReactNode;
  /** Optional smaller hint after the value, e.g. provider info. */
  hint?: ReactNode;
  className?: string;
}

export function InspectorField({ label, value, hint, className }: InspectorFieldProps) {
  return (
    <div className={['border-b border-border py-3 last:border-b-0', className ?? ''].join(' ')}>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-[13px] tabular-nums text-foreground">
        {value}
        {hint != null && <span className="text-[12px] text-muted-foreground"> {hint}</span>}
      </div>
    </div>
  );
}
