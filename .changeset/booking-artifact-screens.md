---
'@medalsocial/meda': minor
---

Booking screens, all opt-in:

- WhoScreen: `guestParty.adults` draws «Adults» as a stepper beside «Children» (two grown-ups in one booking), with the optional `who.party.lead` line under the heading and `who.party.togetherHint` while there are children and no grown-up.
- ServiceScreen: `searchFor(personIndex)` puts a search field over that person's list (a grown-up's long catalogue), with the `service.search*` labels.
- Confirmation: `layout="hero"` — the day as a large calendar leaf, a details card (service, stylist, where), calendar and directions as buttons, an optional «before you come» tip, and until when a change is free (`directionsHref`, `freeChangeUntilTs`, `CONFIRMATION_HERO_LABEL_KEYS`).
- New `BookingPanel` — the desktop's sticky «Your appointment» side panel: who, service, time, stylist (and «first available»), a switch to anyone else free at that minute, the total, «continue» and the small print.
- SummaryBar: while it shows a hint, it no longer also draws the placeholder beside it.
