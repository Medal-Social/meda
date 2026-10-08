---
"@medalsocial/meda": minor
---

`BookingRecap` (`@medalsocial/meda/booking`): what is about to be booked, for the top of the details step — a calendar leaf for the day, the hours, each person's services and stylist, the total, an «edit» back to the time step, and, when «first available» resolved to one stylist while others are free at the same minute, a one-tap swap. New opt-in label keys (`BookingOptionalLabelKey`): `recap.label`, `recap.time`, `recap.line`, `recap.lineFor`, `recap.anyStylist`, `recap.total`, `recap.edit`, `recap.editLabel`, `recap.alsoFree`, `recap.swapTo`. `details.submit` also fills `{day}` and `{time}`, so the button can name what it books.
