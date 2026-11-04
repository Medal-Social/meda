---
'@medalsocial/meda': minor
---

`DetailsScreen` takes `emailRequired` (default `false`). When set, a blank e-mail is refused on submit with the new `details.email.required` label, the field is focused, and the input carries `required` / `aria-required`; a malformed address still shows `details.email.error`. New opt-in label key `details.email.required` (`DETAILS_SCREEN_EMAIL_REQUIRED_LABEL_KEYS`, part of `BookingOptionalLabelKey`); a pack without it falls back to `details.email.error`. Without the prop nothing changes.
