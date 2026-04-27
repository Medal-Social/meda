import { type SemanticToken, semanticTokens } from './tokens-registry';

export type SemanticTokenTableProps = {
  group: SemanticToken['group'];
};

export function SemanticTokenTable({ group }: SemanticTokenTableProps) {
  const rows = semanticTokens.filter((token) => token.group === group);

  return (
    <table className="w-full border-collapse font-[var(--font-family-sans)] text-[13px]">
      <thead>
        <tr className="border-b border-[var(--border)] text-left text-[var(--muted-foreground)]">
          <th className="py-2 pr-4 text-[11px] font-semibold uppercase">Token</th>
          <th className="py-2 pr-4 text-[11px] font-semibold uppercase">Sample</th>
          <th className="py-2 text-[11px] font-semibold uppercase">Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((token) => (
          <tr key={token.name} className="border-b border-[var(--border)]">
            <td className="py-2 pr-4">
              <code className="font-[var(--font-family-mono)] text-[12px] text-[var(--foreground)]">
                --{token.name}
              </code>
              <div className="mt-0.5 text-[12px] text-[var(--muted-foreground)]">{token.name}</div>
            </td>
            <td className="py-2 pr-4">
              <span
                className="inline-block h-6 w-12 rounded-sm border border-[var(--border)]"
                style={{ background: `var(--${token.name})` }}
              />
            </td>
            <td className="py-2 text-[var(--muted-foreground)]">{token.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
