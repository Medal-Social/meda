---
"@medalsocial/meda": patch
---

Replace the `themeAdapter="next-themes"` bridge internals so Meda no longer renders next-themes' inline script through React, avoiding the React 19 script-tag warning in consumer apps.
