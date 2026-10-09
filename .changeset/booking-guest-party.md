---
"@medalsocial/meda": minor
---

`WhoScreen` takes `guestParty`: a guest picks how many children (a stepper, starting at one, so «next» is live from the first frame) and whether they come too (a «me too» row), up to `maxPeople` — «a child and me» in one booking without an account. Each change is a live answer (`advance: false`); the caller's «next» moves on. New opt-in label keys `who.party.children`, `who.party.childrenNote`, `who.party.adult`, `who.party.adultNote`, `who.party.fewer`, `who.party.more`, `who.party.count`. Without the prop the chips are unchanged.
