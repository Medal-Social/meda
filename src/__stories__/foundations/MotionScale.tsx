import { motionTokens } from './tokens-registry';

export function MotionScale() {
  return (
    <table className="w-full border-collapse font-[var(--font-family-sans)] text-[13px]">
      <thead>
        <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
          <th className="py-2 pr-4 text-[11px] font-semibold uppercase">Token</th>
          <th className="py-2 pr-4 text-[11px] font-semibold uppercase">Duration</th>
          <th className="py-2 pr-4 text-[11px] font-semibold uppercase">CSS Var</th>
          <th className="py-2 text-[11px] font-semibold uppercase">Usage</th>
        </tr>
      </thead>
      <tbody>
        {motionTokens.map((token) => (
          <tr key={token.name} className="border-b border-[var(--border)]">
            <td className="py-2 pr-4">
              <code className="font-[var(--font-family-mono)] text-[12px] text-[var(--foreground)]">
                {token.name}
              </code>
            </td>
            <td className="py-2 pr-4 text-[var(--foreground)]">{token.duration}</td>
            <td className="py-2 pr-4">
              <code className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
                {token.cssVar}
              </code>
            </td>
            <td className="py-2 text-[var(--muted-foreground)]">{token.usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
