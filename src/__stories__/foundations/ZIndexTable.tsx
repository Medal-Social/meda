import { zIndexTokens } from './tokens-registry';

export function ZIndexTable() {
  return (
    <table className="w-full border-collapse font-[var(--font-family-sans)] text-[13px]">
      <thead>
        <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
          <th className="py-2 pr-4 text-[11px] font-semibold uppercase">Token</th>
          <th className="py-2 pr-4 text-[11px] font-semibold uppercase">Value</th>
          <th className="py-2 text-[11px] font-semibold uppercase">Usage</th>
        </tr>
      </thead>
      <tbody>
        {zIndexTokens.map((token) => (
          <tr key={token.name} className="border-b border-[var(--border)]">
            <td className="py-2 pr-4">
              <code className="font-[var(--font-family-mono)] text-[12px] text-[var(--foreground)]">
                {token.name}
              </code>
            </td>
            <td className="py-2 pr-4 text-[var(--foreground)]">{token.value}</td>
            <td className="py-2 text-[var(--muted-foreground)]">{token.usage}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
