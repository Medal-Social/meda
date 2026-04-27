import { radiusTokens } from './tokens-registry';

export function RadiusScale() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
      {radiusTokens.map((token) => (
        <div key={token.name} className="flex flex-col items-center gap-2">
          <div
            className="h-20 w-20 border border-[var(--border)] bg-[var(--card)]"
            style={{ borderRadius: `var(${token.cssVar})` }}
          />
          <div className="flex flex-col items-center gap-0.5">
            <code className="font-[var(--font-family-mono)] text-[12px] text-[var(--foreground)]">
              {token.name}
            </code>
            <span className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
              {token.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
