---
'@medalsocial/meda': patch
---

`ContextRail` and `RightPanel` no longer animate their `width`. Collapsing the rail (⌘B) and opening, closing or cycling the right panel (⌘I / ⌘E) are keyboard actions used many times a day, and the 200–240 ms width transition re-wrapped the whole main column on every frame. Both now snap, on the keyboard, on a click and while drag-resizing. No API change.
