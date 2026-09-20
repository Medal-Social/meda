---
'@medalsocial/meda': minor
---

Five additive shell capabilities for header and mobile-nav adopters. Every one
is opt-in: a consumer that passes none of the new props renders exactly as
before.

- **`AppShell`/`ShellHeader` `headerLayout?: 'split' | 'rail'`** (default
  `split`, today's markup). `rail` lays the desktop header out as
  `[rail column | fill | actions]`: column 1 is exactly the icon rail's width
  and holds the workspace switcher as a tile on the rail's axis, column 2 is
  `headerLeading` with `min-w-0` and every remaining pixel, column 3 is
  `globalActions` plus the panel toggle. No left padding, `pr-4`.
  `headerCenter` is ignored in this layout. The column width follows the rail's
  own label mode: `AppShell` forwards `iconRail.labelVisibility` into the new
  `ShellHeader` prop `railLabelVisibility`. This fixes header section tabs both
  shifting horizontally with the workspace name and being capped at roughly
  half the window.
- **`data-meda-shell-header`** on the `<header>` in BOTH layouts, with
  `data-meda-header-layout="split" | "rail"` beside it, so consumers stop
  selecting the header structurally.
- **`WorkspaceSwitcher` `variant?: 'chip' | 'tile'`** (default `chip`) plus
  `showLabel?: boolean`. The tile is a rail-column button: the size-8 mark with
  the same ring and radius, the workspace name beneath it in the icon-rail
  label type, and a chevron hung off the mark so the mark stays on the axis.
  Accessible name is `"<workspace name> workspace menu"`; the dropdown content,
  keyboard handling and dismiss behaviour are the chip's.
- **`rightPanel.showToggle?: boolean`** (default `true`) so a consumer can keep
  its panel views and drop the header toggle, instead of hiding it with CSS.
- **`mobileNav.activeId?: string`** — the active app's id. The dock lights on
  `item.id === activeId` rather than an exact `to` match, so it stays lit on
  every route inside that app; the workspace sheet opens with that row expanded
  and scrolled into view, resetting on each open and still collapsible by hand.
  Without `activeId` both surfaces keep comparing against `activeTo`.
  **`mobileNav.currentFirst?: boolean`** additionally renders that row first in
  its group.

Also newly exported: the `ShellHeaderLayout` and `WorkspaceSwitcherVariant`
types, and the `ShellHeaderProps` / `WorkspaceSwitcherProps` interfaces.
