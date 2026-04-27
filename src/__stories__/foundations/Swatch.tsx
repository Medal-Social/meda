import type { CSSProperties } from 'react';

export type SwatchProps = {
  name: string;
  cssVar: string;
  hex?: string;
};

export function Swatch({ name, cssVar, hex }: SwatchProps) {
  const tileStyle: CSSProperties = {
    background: `var(${cssVar})`,
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border border-[var(--border)] p-3">
      <div
        data-swatch-tile
        className="h-16 w-full rounded-sm border border-[var(--border)]"
        style={tileStyle}
      />
      <div className="flex flex-col gap-0.5">
        <span className="font-[var(--font-family-sans)] text-[13px] font-medium text-[var(--foreground)]">
          {name}
        </span>
        <code className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
          {cssVar}
        </code>
        {hex ? (
          <code className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
            {hex}
          </code>
        ) : null}
      </div>
    </div>
  );
}
