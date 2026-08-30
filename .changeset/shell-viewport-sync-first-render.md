---
'@medalsocial/meda': patch
---

Shell perceived-speed fixes from the Medal Social app-shell audit (2026-08-30):

- `useShellViewport` now resolves the viewport band synchronously on the first
  client render via `useSyncExternalStore` (matchMedia as the store, 'desktop'
  as the server snapshot). Previously the hook seeded `useState('desktop')`
  and corrected itself in a post-mount effect, so phones mounted the full
  desktop shell tree (header, rails, right panel — and whatever subscriptions
  consumers hang off them) and immediately tore it down: throwaway work on the
  mobile critical path on every load. SSR consumers keep the exact previous
  behavior via the server snapshot.

- `AppShellWorkspace` mobile scroll reserve reduced from 80px to 64px + safe
  area, matching the bar-variant dock's intrinsic height — the old value left
  16px of permanently unreachable space at the bottom of every mobile surface.
