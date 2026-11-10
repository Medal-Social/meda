---
'@medalsocial/meda': minor
---

`DetailsScreen` is easier to fill in with assistive technology (from a site audit, WCAG 2.2 AA 1.3.1, 3.3.1, 3.3.2, 4.1.3):

- Every field error — phone, name, e-mail and the terms box — has an id in its field's `aria-describedby` (after any help text). An error that appears when a field is left is announced with `role="alert"`. A refused submit still focuses the first field to fix, whose error is read as its description; the other errors that press revealed are not alerts, so they do not all speak at once.
- An unticked terms box on submit now shows a visible message (new opt-in `details.terms.error`, falling back to `details.error.invalidInput`) and is described by it, beside `aria-invalid`.
- The phone input and the terms box always carry `aria-required="true"`.
- New `requireName` prop (default `false`): a blank name is refused when the field is left and on submit, with the new opt-in `details.error.nameRequired` (falling back to `details.error.invalidInput`); the input carries `aria-required` and submit focuses it after the phone.
- New opt-in label keys `details.required` and `details.optional` draw a visible marker after the label of each required / optional field, in the same run of text as the label so it wraps after the last word. Without them nothing is drawn and the labels render as before.

The four new keys are `DETAILS_SCREEN_FORM_LABEL_KEYS`, part of `BookingOptionalLabelKey`.

`BookingPanel` takes `showWho` (default `true`); `showWho={false}` omits the «who» row, for a flow that never asks who the visit is for.
