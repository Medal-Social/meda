---
"@medalsocial/meda": patch
---

`ShellMain`'s default `workspace` layout now left-aligns content within its `max-w-[1280px]` cap instead of centering it. This removes the unused band that appeared on the left of the work area when `ContextRail` was collapsed. Pages that need horizontally centered reading should opt into `layout="centered"`; pages that want full bleed already use `layout="fullbleed"`.
