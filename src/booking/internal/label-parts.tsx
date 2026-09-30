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
