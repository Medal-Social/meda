---
'@medalsocial/meda': minor
---

Fix the phone first-paint desktop flash: `useShellViewport` now reads matchMedia synchronously through `useSyncExternalStore`, so React reconciles the viewport band before the browser paints instead of correcting it in a post-mount effect (which guaranteed one painted desktop frame on phones on every SSR page load). New opt-in `ShellViewportHintProvider` (plus the underlying `ShellViewportHintContext`, both exported from `@medalsocial/meda/shell`) lets apps pass a server-detected device class (e.g. from `Sec-CH-UA-Mobile` / User-Agent) as the server/hydration snapshot, so phones can receive mobile shell HTML from the first byte; it ships as a client component because App Router server components cannot render a Context provider directly. The desktop `ShellHeader` root now carries a stable `data-meda-shell-header` attribute (mirroring `data-meda-mobile-header`) for styling/QA hooks such as pre-hydration CSS guards.
