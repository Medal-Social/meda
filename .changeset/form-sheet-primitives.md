---
"@medalsocial/meda": minor
---

Add `Checkbox`, `Field` (`Field.Label`, `Field.Description`, `Field.Error`, `Field.Set`, `Field.Legend`), `Textarea` and `Sheet` primitives to `@medalsocial/meda/primitives` (and the root). `Sheet` is built on the native `<dialog>` element (`showModal()`, inert background, focus return, Escape / backdrop dismissal, scroll lock, `prefers-reduced-motion`) and lays out as a bottom sheet on phones and a centred dialog from `md` up. `Checkbox` is a native `<input type="checkbox">` with an `onCheckedChange` callback.
