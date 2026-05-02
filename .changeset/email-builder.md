---
'@medalsocial/meda': minor
---

Add `@medalsocial/meda/email-builder` — a block-based email composer ported from the Meda Social internal surface.

**What's included**

- `<EmailBuilder>` component with header, palette, canvas, property inspector, mobile drawers, and floating action bar
- 9 block kinds: `heading`, `text`, `image`, `button`, `divider`, `spacer`, `columns`, `social`, `footer`
- Per-kind property editor in the right rail
- `renderToEmailHtml(doc, options)` — produces email-safe table-based HTML
- Drag-to-reorder via `@dnd-kit` (already a peer dep)
- Render-prop slots: `renderMediaPicker`, `renderSavedBlocks`, `renderTextEditor`
- Fully prop-driven; no Convex coupling, no i18n framework, English defaults via `EmailBuilderLabels`
- Subpath export at `@medalsocial/meda/email-builder` plus root re-export of the main API

**Deferred from the source surface (consumer's responsibility for now)**

- Lexical rich-text editor — replaced by a `<textarea>` for `text` blocks; pass `renderTextEditor` to inject a richer editor
- Media browser dialog — pass `renderMediaPicker`
- Saved-blocks library — pass `renderSavedBlocks`
- Send-test dialog (Convex-coupled)
- Brand-kit dialog (Convex-coupled) — basic `brand` prop is supported
- Template library, AI assistance, quality panel, sender identity
- Dark-mode preview output
- `video`, `html`, `otp`, `logo`, `contentSlot` block kinds — out of scope for v0
