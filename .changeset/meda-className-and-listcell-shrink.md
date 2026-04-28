---
"@medalsocial/meda": patch
---

Fix `KanbanBoardProps.className` not being applied to the board wrapper. Fix `ListCell.shrink` flag being inverted from its documented behavior — `shrink={true}` now correctly allows shrinking; `shrink={false}` adds `flex-shrink-0`. Backwards-compatible for default usage.
