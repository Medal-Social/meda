---
"@medalsocial/meda": minor
---

Add `@medalsocial/meda/booking` (and `@medalsocial/meda/booking/styles.css`): unbranded, presentational booking screens — the wizard steps (`WhoScreen`, `ServiceScreen`, `StylistScreen`, `TimeScreen`, `DetailsScreen`, `SummaryBar`, `Confirmation`, `BookingSkeleton`, `AddChildSheet`), `ManageScreen`, login (`LoginSheet`, `LoginPanel`, `OtpSlots`, `VippsButton`) and portal screens (`PortalShell`, `UpcomingBookings`, `VisitHistory`, `ChildCards`, `RebookCards`, `FamilyEditor`, `ProfileForm`, `DataControls`, `AccountCard`, `PortalUnreachable`, `LogoutButton`, `VippsLinkRow`, `AgeConfirmCard`). Screens are props in / callbacks out, take all copy through a typed `labels` record (`BookingLabels`, `BOOKING_LABEL_KEYS`), format dates and prices through an injected `BookingFormat`, accept per-slot `classNames`, and let card renderers be replaced through `components` (defaults exported). Colours come only from the theme bridge's shadcn variables.
