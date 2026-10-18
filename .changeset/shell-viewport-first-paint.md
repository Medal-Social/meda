---
'@medalsocial/meda': minor
---

Add opt-in `ShellViewportHintProvider` and `ShellViewportHintContext` exports from `@medalsocial/meda/shell`. Apps can pass a request-derived device class as the server and hydration snapshot, so phones receive mobile shell HTML before JavaScript loads. Without a hint, server rendering retains the desktop default; live client behavior continues to use the existing synchronous viewport store. The provider is a client component that can be rendered from an App Router server component.
