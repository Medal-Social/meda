---
'@medalsocial/meda': minor
---

Add `EmailBuilder`, `PostPreview`, and `WorkflowBuilder` as the single
top-level entry points for their respective surfaces.

`PostPreview` is a new component that accepts a discriminated `platform`
prop (`instagram`, `twitter`, `facebook`, `linkedin`, `tiktok`, `youtube`,
`threads`, `bluesky`, `discord`, `telegram`, `google_business`, `generic`)
plus the existing per-platform props inline. It exposes render-prop slots
for `renderEditor`, `renderMediaPicker`, `renderEmojiPicker`, and
`renderMentionPicker` so consumers can plug in their own rich text editor,
media library, and pickers.

`EmailBuilder` and `WorkflowBuilder` no longer export internal pieces
(palettes, inspectors, canvases, headers, toolboxes, node/edge helpers)
from their barrels — those remain internal. `WorkflowCard` and
`WorkflowCardCompact` continue to be exported as standalone list-row
components.
