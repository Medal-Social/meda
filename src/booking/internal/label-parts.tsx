import { Fragment, type ReactNode } from 'react';
import { type BookingLabel, fillLabelPieces } from '../labels.js';

/**
 * A filled label as element children (see `BookingLabel`): a string renders
 * as one text node, an array as one text node per element. Prefer it over
 * `fillLabel` wherever a label is rendered as children, so the pack decides
 * where the sentence breaks.
 *
 * Returns the string itself for a one-node label, an array of strings for a
 * split one, and `null` for a label that fills to nothing at all. Text-only
 * targets (`aria-label`, `title`, a file name) keep `fillLabel`.
 */
export function renderLabel(
  template: BookingLabel,
  values: Readonly<Record<string, string | number>> = {}
): string | string[] | null {
  const pieces = fillLabelPieces(template, values);
  if (pieces.length === 0) return null;
  return typeof template === 'string' ? (pieces[0] as string) : pieces;
}

/**
 * `renderLabel` for templates whose placeholders include elements (a link, a
 * button) rather than strings: `'Have an account? {trigger} – …'` with
 * `{ trigger: <button>…</button> }`. Each element sits in its own place; the
 * text around it follows the label's form — a string's text runs stay whole
 * between elements, an array's elements stay separate. String and number
 * values join the text they sit in. Unknown placeholders are left as written.
 */
export function labelParts(
  template: BookingLabel,
  parts: Readonly<Record<string, ReactNode>>
): ReactNode {
  const pieces = typeof template === 'string' ? [template] : template;
  const nodes: ReactNode[] = [];
  for (const piece of pieces) {
    let run = '';
    for (const token of piece.split(/(\{\w+\})/g)) {
      const name = /^\{(\w+)\}$/.exec(token)?.[1];
      const value = name !== undefined && Object.hasOwn(parts, name) ? parts[name] : token;
      if (typeof value === 'string' || typeof value === 'number') {
        run += String(value);
        continue;
      }
      if (run !== '') nodes.push(run);
      run = '';
      nodes.push(<Fragment key={nodes.length}>{value}</Fragment>);
    }
    if (run !== '') nodes.push(run);
  }
  return nodes;
}

export interface JoinLabelPartsOptions {
  /**
   * `false`: the line is ONE text node (every part is flattened to text and
   * joined). `true`: every part and every separator is its own text node, and
   * a split part (an array, from a `string[]` label) keeps its pieces.
   *
   * Default: one text node when every part is plain text, pieces as soon as
   * one part is split (a pack wrote one of the line's labels as an array) or
   * is an element. A part that cannot be flattened (an element) always
   * renders in pieces.
   */
  pieces?: boolean;
}

/** A part as plain text, or `null` when it holds an element. */
function partText(part: ReactNode): string | null {
  if (typeof part === 'string' || typeof part === 'number') return String(part);
  if (Array.isArray(part)) {
    let text = '';
    for (const piece of part) {
      const pieceText = partText(piece as ReactNode);
      if (pieceText === null) return null;
      text += pieceText;
    }
    return text;
  }
  return null;
}

/**
 * `parts.filter(Boolean).join(separator)` as element children. Blank parts
 * drop out, so an absent one closes the gap rather than leaving a doubled
 * separator. Whether the line is one text node or one per part and separator
 * follows the parts' own form (see `JoinLabelPartsOptions.pieces`): plain
 * strings join into one, as `[a, b].join(' · ')` in JSX did.
 */
export function joinLabelParts(
  parts: ReadonlyArray<ReactNode>,
  separator: string,
  options: JoinLabelPartsOptions = {}
): ReactNode {
  // Blank = renders no text: nothing at all, or text pieces that are all empty.
  const present = parts.filter(
    (part) =>
      part !== null && part !== undefined && typeof part !== 'boolean' && partText(part) !== ''
  );
  const pieces =
    options.pieces ?? present.some((part) => typeof part !== 'string' && typeof part !== 'number');
  if (!pieces) {
    const texts = present.map(partText);
    if (texts.every((text): text is string => text !== null)) {
      const line = texts.join(separator);
      return line === '' ? null : line;
    }
  }
  return present.map((part, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: the parts of one fixed sentence never reorder
    <Fragment key={index}>
      {index > 0 && separator}
      {part}
    </Fragment>
  ));
}
