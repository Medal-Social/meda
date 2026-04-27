import { typographyTokens } from './tokens-registry';

export function TypographyRamp() {
  return (
    <div className="flex flex-col gap-4">
      {typographyTokens.sizes.map((size) => (
        <div
          key={size.name}
          className="flex items-baseline justify-between gap-6 border-b border-[var(--border)] pb-3"
        >
          <span
            className="font-[var(--font-family-sans)] font-semibold text-[var(--foreground)]"
            style={{ fontSize: `var(${size.cssVar})` }}
          >
            The quick brown fox
          </span>
          <div className="flex flex-col items-end gap-0.5 text-right">
            <code className="font-[var(--font-family-mono)] text-[12px] text-[var(--foreground)]">
              {size.name}
            </code>
            <span className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
              {size.px}px
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
