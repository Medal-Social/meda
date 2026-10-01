---
"@medalsocial/meda": minor
---

Booking screens now render filled labels as their template pieces: the label split around its `{placeholders}`, one text node per literal run and per value, the same DOM as the sentence written out in JSX. A browser lays text out per text node, so one joined string could land a line's glyphs a sub-pixel away from a JSX-composed original and fail a pixel-exact screenshot. Covers every label a screen renders as children (e.g. `stylist.party.parallelNote.*`, `confirmation.party.total`, `confirmation.serviceFor` / `.when`, `service.duration`, `time.empty.*`, `time.weekend.*`, `manage.card.*`, `upcoming.*`, `childCards.*`, `details.submit`); text-only targets (`aria-label`, file names) keep `fillLabel`. The visible text is unchanged.

New, all opt-in:

- `renderLabel(template, values)`, `labelParts(template, parts)` and `joinLabelParts(parts, separator)` are exported from `@medalsocial/meda/booking`, for consumers composing their own booking UI the same way.
- `StylistScreen` `party.sizeWord`: the party size as the copy spells it («two»), filled into `{sizeWord}` in `stylist.party.parallel.*` / `stylist.party.parallelNote.*` (default: the number), so a pack can keep the word as its own text piece.
- `ServiceScreen` `classNames.price` (and `ServiceCardProps.priceClassName`): a slot for the service price.
- `StylistScreen` `classNames.nextAvailable` (and `StylistCardProps.nextAvailableClassName`): a slot for the next-opening line.

Runtime dependencies are now caret ranges (`@base-ui/react ^1.7.0`, `tailwind-merge ^3.6.0`, and the rest at their current floors), so a consumer's lockfile can dedupe them without overrides.
