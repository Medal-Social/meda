---
"@medalsocial/meda": minor
---

Booking: three opt-in hooks for the multi-select service step and its buttons. `ServiceScreen` takes a `next` slot class for the sticky bar's «Next» button; `selection.disableUntilReady` holds «Next» back (`disabled`, `aria-disabled`, `data-disabled`, the Material 3 disabled look) while `canContinue` is `false`; and `BookingButton` / `bookingButtonClass` take `radius: 'full'` for pill-shaped corners. Defaults are unchanged.
