---
'@medalsocial/meda': patch
---

Add `.js` extensions to all relative imports in source so the emitted `dist/` is valid under Node ESM and Vitest's ESM loader.

Previously, bundlers (Vite/rolldown/webpack) would fill in missing extensions at build time, so apps that bundled the library worked fine. But consumers running the library under raw Node ESM — notably Vitest — hit `Cannot find module './shell/public'` because the emitted JS carried bare `./X` imports that Node ESM won't resolve. This patch fixes packaging without changing any runtime behavior or public API.
