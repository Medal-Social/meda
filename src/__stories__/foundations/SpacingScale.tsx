import { spacingTokens } from './tokens-registry';

export function SpacingScale() {
  return (
    <div className="flex flex-col gap-3">
      {spacingTokens.map((token) => (
        <div key={token.name} className="flex items-center gap-4">
          <code className="w-16 font-[var(--font-family-mono)] text-[12px] text-[var(--foreground)]">
            {token.name}
          </code>
          <div
            className="h-4 rounded-sm"
            style={{ width: `${token.px}px`, background: 'var(--color-brand-500)' }}
          />
          <span className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
            {token.px}px
          </span>
          <code className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
            {token.cssVar}
          </code>
        </div>
      ))}
    </div>
  );
}
