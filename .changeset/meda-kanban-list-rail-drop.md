---
"@medalsocial/meda": minor
---

Add `KanbanBoard` (kanban subpath), `ListRow` (list subpath), `RailDropSlot` (shell), and `LaneTimeline` (timeline). New primitives `Checkbox` and `Collapsible` in `components/ui/`. Kanban accepts a `labels` prop for i18n and per-column `accentClass` + `icon` (no shared status registry). `LaneTimeline` is a swimlane Gantt with built-in time-window math, range selector (1h/6h/24h/7d), date switcher, now-line, and legend; consumer passes pre-grouped `Lane[]`. Adds `@dnd-kit/{core,sortable,utilities}` peer deps.
