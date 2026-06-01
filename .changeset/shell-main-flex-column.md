---
"@medalsocial/meda": patch
---

fix(shell): make `ShellMain` a flex column (`flex flex-col`).

Full-height content regions that use `flex-1` to fill the main area need a
flex-column parent with a definite height. Without it those regions collapse to
their min content height and, when combined with `overflow-hidden`, clip their
content — pages such as the posts list/calendar rendered into the DOM but stayed
visually blank. Adding `flex flex-col` to `<main>` restores the height contract
those pages rely on (purely additive; padded/scrolling `workspace` layouts are
unaffected).
