---
"@medalsocial/meda": patch
---

Fix `<AppShell variant="workspace">` IconRail layout collapsing when consumed via Tailwind v4. Meda's exported `theme.css` now declares `@source "../**/*.js"` so utility classes used only by meda components (e.g. `h-full`, `mt-auto`, `py-3.5`, `bg-shell-rail`) are generated even when the consumer app doesn't reference them itself.

Without this directive, Tailwind v4 silently dropped those classes and the IconRail rendered with content height instead of full viewport height — utility items stacked tight against the divider near the top of the rail instead of pinning to the bottom, and the first icon sat flush against the header. The directive is resolved relative to the CSS file location at build time, so it scans the package's own dist output regardless of where it's installed.
