---
"@medalsocial/meda": major
---

Update ContextRail defaults and shell stability.

ContextRail now scrolls overflowing rail content by default. Navigation-style rails still show Meda's visible label header by default, while custom rendered rails hide the automatic visible header so consumers can render their own heading without duplicate labels. Use `header="visible"` to force Meda's header, `header="hidden"` to suppress it, and `scroll="none"` to manage overflow manually.

This release also stabilizes shell provider action identities and makes `useShellViewport()` fall back to `"desktop"` when `window.matchMedia` is unavailable.
