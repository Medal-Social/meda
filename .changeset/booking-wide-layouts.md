---
"@medalsocial/meda": minor
---

Booking layouts for wide screens, both opt-in:

- `TimeScreen` `layout="adaptive"`: on a phone the days, month and weekend note stay together with no gap before the first time; from `md` the days are a column beside the chosen day's times; from `lg` the week is a seven-column grid of times (each day headed with how full it is, folding after eight times, «Ingen ledige» or a family's simultaneous time on an empty day). The grid needs the new optional `time.week.none` and `time.week.more` labels and a strip of at most seven days; without them the columns layout is used.
- `StylistScreen` `row`: the phone's avatar row at every width, so a desktop reaches the times without scrolling past every stylist, with the chosen stylist's bio shown under the row.

The default layouts are unchanged.
