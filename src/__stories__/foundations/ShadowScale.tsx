import { shadowTokens } from './tokens-registry';

export function ShadowScale() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
      {shadowTokens.map((token) => (
        <div key={token.name} className="flex flex-col gap-2">
          <div
            className="h-24 rounded-md bg-[var(--card)]"
            style={{ boxShadow: `var(${token.cssVar})` }}
          />
          <div className="flex flex-col gap-0.5">
            <code className="font-[var(--font-family-mono)] text-[12px] text-[var(--foreground)]">
              {token.name}
            </code>
            <code className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
              {token.cssVar}
            </code>
            <span className="font-[var(--font-family-sans)] text-[12px] text-[var(--muted-foreground)]">
              {token.usage}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
