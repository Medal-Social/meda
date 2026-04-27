---
'@medalsocial/meda': minor
---

Add three new subpath exports backing the pilot-talk Activity surface and any other Medal app needing timeline/chat/inspector primitives:

- **`@medalsocial/meda/timeline`** — `<TimelineRail>` (composite) plus `<DateSwitcher>`, `<LiveIndicator>`, `<EventCard>`, `<TimelineTape>`, `<ScrubBar>`. Generic over a `TimelineEvent[]` shape; sticky LIVE pinning + auto-follow + jump-to-live built in.
- **`@medalsocial/meda/chat`** — `<TranscriptStream>` (composite) plus `<TurnCard>`, `<ToolCallBlock>`, `<LatencyBadge>`, `<LatencyBreakdown>`. Per-turn play, per-stage latency, inline tool blocks.
- **`@medalsocial/meda/panel`** — `<Inspector>` (composite) plus `<InspectorField>`, `<InspectorJSON>`. Tabbed property panel with token-keyed JSON pretty-print.

All primitives are pure presentational, consume Meda's shadcn-semantic tokens, ship a Storybook-style demo route in `demo/`, and pass `vitest-axe` WCAG AA.
