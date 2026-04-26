export interface InspectorJSONProps {
  data: unknown;
  /** Indent size in spaces. */
  indent?: number;
  className?: string;
}

type Token =
  | { kind: 'punct'; text: string }
  | { kind: 'key'; text: string }
  | { kind: 'string'; text: string }
  | { kind: 'number'; text: string }
  | { kind: 'literal'; text: string };

function tokenize(
  value: unknown,
  level: number,
  key: string | null,
  indent: number,
  seen: WeakSet<object>
): Token[] {
  const out: Token[] = [];
  const pad = ' '.repeat(level * indent);
  if (key !== null) {
    out.push({ kind: 'punct', text: pad });
    out.push({ kind: 'key', text: `"${key}"` });
    out.push({ kind: 'punct', text: ': ' });
  } else {
    out.push({ kind: 'punct', text: pad });
  }
  if (value === null) {
    out.push({ kind: 'literal', text: 'null' });
  } else if (typeof value === 'string') {
    out.push({ kind: 'string', text: JSON.stringify(value) });
  } else if (typeof value === 'number') {
    out.push({ kind: 'number', text: String(value) });
  } else if (typeof value === 'boolean') {
    out.push({ kind: 'literal', text: String(value) });
  } else if (Array.isArray(value)) {
    if (seen.has(value)) {
      out.push({ kind: 'literal', text: '"[Circular]"' });
    } else {
      seen.add(value);
      out.push({ kind: 'punct', text: '[\n' });
      value.forEach((v, i) => {
        out.push(...tokenize(v, level + 1, null, indent, seen));
        out.push({ kind: 'punct', text: i < value.length - 1 ? ',\n' : '\n' });
      });
      out.push({ kind: 'punct', text: `${pad}]` });
    }
  } else if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (seen.has(obj)) {
      out.push({ kind: 'literal', text: '"[Circular]"' });
    } else {
      seen.add(obj);
      out.push({ kind: 'punct', text: '{\n' });
      const entries = Object.entries(obj);
      entries.forEach(([k, v], i) => {
        out.push(...tokenize(v, level + 1, k, indent, seen));
        out.push({ kind: 'punct', text: i < entries.length - 1 ? ',\n' : '\n' });
      });
      out.push({ kind: 'punct', text: `${pad}}` });
    }
  } else {
    out.push({ kind: 'literal', text: String(value) });
  }
  return out;
}

const KIND_CLASS: Record<Token['kind'], string> = {
  punct: 'text-muted-foreground',
  key: 'text-primary',
  string: 'text-emerald-500',
  number: 'text-amber-500',
  literal: 'text-amber-500',
};

export function InspectorJSON({ data, indent = 2, className }: InspectorJSONProps) {
  const tokens = tokenize(data, 0, null, indent, new WeakSet());
  return (
    <pre
      className={[
        'mt-1.5 overflow-x-auto rounded-md border border-border bg-background p-2.5 font-mono text-[11px] leading-relaxed text-foreground',
        className ?? '',
      ].join(' ')}
    >
      {tokens.map((t, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: token stream is positional
        <span key={i} className={KIND_CLASS[t.kind]}>
          {t.text}
        </span>
      ))}
    </pre>
  );
}
