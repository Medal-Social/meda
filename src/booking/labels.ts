/**
 * Copy for the booking screens.
 *
 * Every word a booking screen shows arrives through its `labels` prop — meda
 * ships no default brand and no default language. A screen's labels are a flat
 * record of strings keyed `'<screen>.<thing>'` (e.g. `'who.heading'`), so one
 * merged pack (`BookingLabels`) can be handed to every screen, and a customer
 * can override a single sentence without touching the rest.
 *
 * Values are plain strings, so a pack is serialisable (it can travel from a
 * server component to the client as a prop). Variable parts are `{name}`
 * placeholders, filled by `fillLabel`.
 */

/** Replaces `{key}` placeholders in `template`. Unknown keys are left as written. */
export function fillLabel(
  template: string,
  values: Readonly<Record<string, string | number>>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match
  );
}
