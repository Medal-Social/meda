/**
 * Copy for the booking screens.
 *
 * Every word a booking screen shows arrives through its `labels` prop — meda
 * ships no default brand and no default language. A screen's labels are a flat
 * record keyed `'<screen>.<thing>'` (e.g. `'who.heading'`), so one merged pack
 * (`BookingLabels`) can be handed to every screen, and a customer can override
 * a single sentence without touching the rest.
 *
 * A label is a `BookingLabel`: a string, or an array of strings. Both are
 * serialisable, so a pack can travel from a server component to the client as
 * a prop. Variable parts are `{name}` placeholders.
 *
 * The two forms differ only in the DOM they render as element children:
 *
 * - a **string** renders as ONE text node once filled, like a template
 *   literal: `'Total {total} · paid at the salon'` → «Total 840 kr · paid at
 *   the salon», one node;
 * - an **array** renders one text node per element, each element filled with
 *   the same values: `['Total ', '{total}', ' · ', 'paid at the salon']` →
 *   four nodes, the same DOM as `Total {total}{' · '}paid at the salon` in JSX.
 *   An element that fills to `''` renders nothing.
 *
 * A browser lays text out per text node, so the same sentence split
 * differently can land its later glyphs a sub-pixel apart. The pack decides
 * where a sentence breaks; a screen never splits a string on its own.
 *
 * Text-only targets (`aria-label`, `title`, a file name, an error string) read
 * a label through `fillLabel` / `labelText`, which join an array's elements.
 */

/** One label: a string (one text node) or one string per text node. */
export type BookingLabel = string | readonly string[];

/** A label as plain text: an array's elements joined, a string as it is. */
export function labelText(label: BookingLabel): string {
  return typeof label === 'string' ? label : label.join('');
}

function fillOne(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match
  );
}

/**
 * Replaces `{key}` placeholders in `template`, as plain text. An array is
 * filled element by element and joined. Unknown keys are left as written.
 */
export function fillLabel(
  template: BookingLabel,
  values: Readonly<Record<string, string | number>>
): string {
  return typeof template === 'string'
    ? fillOne(template, values)
    : template.map((piece) => fillOne(piece, values)).join('');
}

/**
 * The text nodes a label fills to: one for a string, one per element for an
 * array, with empty ones dropped. `[]` when the label fills to nothing.
 */
export function fillLabelPieces(
  template: BookingLabel,
  values: Readonly<Record<string, string | number>>
): string[] {
  const pieces = typeof template === 'string' ? [template] : template;
  return pieces.map((piece) => fillOne(piece, values)).filter((piece) => piece !== '');
}
