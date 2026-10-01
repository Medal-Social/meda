import { Fragment, type ReactNode } from 'react';

/**
 * `fillLabel` for templates whose placeholders are elements (a link, a
 * button) rather than strings: `'Have an account? {trigger} – …'` with
 * `{ trigger: <button>…</button> }`. Text parts stay text; unknown
 * placeholders are left as written.
 */
export function labelParts(
  template: string,
  parts: Readonly<Record<string, ReactNode>>
): ReactNode {
  const pieces = template.split(/(\{\w+\})/g);
  return pieces.map((piece, index) => {
    const match = /^\{(\w+)\}$/.exec(piece);
    if (match && Object.hasOwn(parts, match[1])) {
      // biome-ignore lint/suspicious/noArrayIndexKey: the pieces of a fixed template never reorder
      return <Fragment key={index}>{parts[match[1]]}</Fragment>;
    }
    return piece;
  });
}

/**
 * A filled label as element children: the template split around its
 * `{placeholders}`, so React renders one text node per literal run and one
 * per value — the same DOM as writing the sentence out in JSX
 * (`Total {total} · paid at the salon`). Prefer it over `fillLabel` wherever
 * a label is rendered as children; a browser lays text out per text node, so
 * one joined string can land a line's glyphs a sub-pixel away from the same
 * sentence composed in JSX.
 *
 * Text-only targets (`aria-label`, `title`, a file name) keep `fillLabel`.
 * Empty literal runs and empty values render nothing, as in JSX; a label
 * that fills to nothing at all is `null`.
 */
export function renderLabel(
  template: string,
  values: Readonly<Record<string, string | number>>
): ReactNode {
  const pieces = template.split(/(\{\w+\})/g);
  const nodes: Array<string | number> = [];
  for (const piece of pieces) {
    const match = /^\{(\w+)\}$/.exec(piece);
    const value = match && Object.hasOwn(values, match[1]) ? values[match[1]] : piece;
    if (value !== '') nodes.push(value);
  }
  return nodes.length > 0 ? nodes : null;
}

/**
 * `parts.filter(Boolean).join(separator)` as element children: every part
 * and every separator its own text piece. Blank parts drop out, so an absent
 * one closes the gap rather than leaving a doubled separator.
 */
export function joinLabelParts(parts: ReadonlyArray<ReactNode>, separator: string): ReactNode {
  return parts
    .filter(
      (part) =>
        part !== null &&
        part !== undefined &&
        part !== false &&
        part !== '' &&
        !(Array.isArray(part) && part.length === 0)
    )
    .map((part, index) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: the parts of one fixed sentence never reorder
      <Fragment key={index}>
        {index > 0 && separator}
        {part}
      </Fragment>
    ));
}
