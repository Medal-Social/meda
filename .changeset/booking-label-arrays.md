---
"@medalsocial/meda": minor
---

Booking labels can be a string or an array of strings (`BookingLabel`), and the pack decides where a sentence breaks into text nodes:

- A **string** renders as ONE text node once filled, like a template literal. This reverses 3.3.0, which split every filled label at each `{placeholder}`.
- A **string array** renders one text node per element, each element filled with the same values: `['Total ', '{total}', ' · ', 'paid at the salon']` is four nodes, the DOM of the sentence written out in JSX. An element that fills to `''` renders nothing.
- `joinLabelParts(parts, separator, { pieces })`: a line joined from plain strings (the confirmation card, the portal's booking lines) is one text node; it renders in pieces once one of its labels is an array, and `pieces` forces either.
- `labelParts` keeps a string's text runs whole around element holes and an array's elements apart.
- `BookingLabels` and every screen's `*Labels` type accept either form for every key. Text-only targets (`aria-label`, placeholders, file names, messages, a value filled into another label, a custom component's `string` prop) read an array joined, through `fillLabel` or the new `labelText`.
- `LoginPanel`'s `heading` render prop receives the label as `ReactNode` (its pieces), not a `string`.
- New exports: `BookingLabel`, `labelText`, `fillLabelPieces`, `JoinLabelPartsOptions`.

A pack that relied on 3.3's automatic split writes those labels as arrays.
