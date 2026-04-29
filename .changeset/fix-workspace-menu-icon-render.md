---
'@medalsocial/meda': patch
---

fix(shell): preserve icon on `href` workspace menu items and avoid icon-render crash

- `WorkspaceMenuItem` entries with `href` now render their icon. The previous
  implementation passed `<a href={item.href}>{item.label}</a>` to Base UI's
  `render` prop, and the cloned anchor's own children overrode the
  `DropdownMenuItem` children, silently dropping the icon. The anchor is now
  childless so Base UI merges the menuitem's icon + label children into it.
- `renderConfiguredIcon` no longer crashes when `icon` is a non-element
  `ReactNode` object (e.g. an array of nodes). Previously any non-primitive,
  non-element value fell through to `createElement`, producing
  "Element type is invalid". The function now only invokes `createElement` for
  callable components and `forwardRef`/`memo`-shaped objects, and renders any
  other `ReactNode` as-is.
