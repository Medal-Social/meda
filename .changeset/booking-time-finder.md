---
"@medalsocial/meda": minor
---

`TimeScreen` can answer «when is the first time?» before a day is picked. `soonest` draws a «free soon» row above the days: the earliest starts across the window as one-tap cards with the day, the time and (through `resolveStylist`) who each is with, booking exactly the slot `onPick` would. `dayFullness` gives each day chip marks for how many starts it has free, or «full» (only for an open day asked for everyone), as a 44 px target; a weekend card shows its surcharge. `DefaultDayChip` takes the new optional `free` / `freeLabel`, and `dayFreeMarks` is exported. New opt-in label keys: `time.soonest.heading`, `time.soonest.pick`, `time.soonest.with`, `time.dayChip.free`, `time.dayChip.freeOne`, `time.dayChip.full`. Both are off unless passed.
