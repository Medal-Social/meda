---
'@medalsocial/meda': patch
---

IconRail now adapts to short viewports: items compact below 850px viewport height (smaller icon frame, tighter spacing, smaller label) and labels hide below 700px so the rail degrades to icon-only. The rail also scrolls vertically (hidden scrollbar) as a hard guarantee that every menu item stays reachable on small screens — previously items below the fold were unreachable on ~12" displays.
