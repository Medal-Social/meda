import { jsx as _jsx } from "react/jsx-runtime";
function tokenize(value, level, key, indent) {
    const out = [];
    const pad = ' '.repeat(level * indent);
    if (key !== null) {
        out.push({ kind: 'punct', text: pad });
        out.push({ kind: 'key', text: `"${key}"` });
        out.push({ kind: 'punct', text: ': ' });
    }
    else {
        out.push({ kind: 'punct', text: pad });
    }
    if (value === null) {
        out.push({ kind: 'literal', text: 'null' });
    }
    else if (typeof value === 'string') {
        out.push({ kind: 'string', text: JSON.stringify(value) });
    }
    else if (typeof value === 'number') {
        out.push({ kind: 'number', text: String(value) });
    }
    else if (typeof value === 'boolean') {
        out.push({ kind: 'literal', text: String(value) });
    }
    else if (Array.isArray(value)) {
        out.push({ kind: 'punct', text: '[\n' });
        value.forEach((v, i) => {
            out.push(...tokenize(v, level + 1, null, indent));
            out.push({ kind: 'punct', text: i < value.length - 1 ? ',\n' : '\n' });
        });
        out.push({ kind: 'punct', text: `${pad}]` });
    }
    else if (typeof value === 'object') {
        out.push({ kind: 'punct', text: '{\n' });
        const entries = Object.entries(value);
        entries.forEach(([k, v], i) => {
            out.push(...tokenize(v, level + 1, k, indent));
            out.push({ kind: 'punct', text: i < entries.length - 1 ? ',\n' : '\n' });
        });
        out.push({ kind: 'punct', text: `${pad}}` });
    }
    else {
        out.push({ kind: 'literal', text: String(value) });
    }
    return out;
}
const KIND_CLASS = {
    punct: 'text-muted-foreground',
    key: 'text-primary',
    string: 'text-emerald-500',
    number: 'text-amber-500',
    literal: 'text-amber-500',
};
export function InspectorJSON({ data, indent = 2, className }) {
    const tokens = tokenize(data, 0, null, indent);
    return (_jsx("pre", { className: [
            'mt-1.5 overflow-x-auto rounded-md border border-border bg-background p-2.5 font-mono text-[11px] leading-relaxed text-foreground',
            className ?? '',
        ].join(' '), children: tokens.map((t, i) => (_jsx("span", { className: KIND_CLASS[t.kind], children: t.text }, i))) }));
}
