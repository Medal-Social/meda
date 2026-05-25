---
name: shell
description: Use when scaffolding or modifying shell regions (icon rail, context rail, header, right panel, command palette) in any app consuming `@medalsocial/meda` — Picasso, pilot-talk, NextMedal, apps/web. Load before adding a new rail item, panel surface, or top-level layout region. Required reading before any `IconRail` change.
---

# Meda Shell

## When to load this skill

- Scaffolding a new shell region or modifying an existing one.
- Adding an item to the icon rail.
- Building or restructuring the right panel.
- Wiring the command palette.
- Touching anything under `src/shell/` in `@medalsocial/meda`.

## Region taxonomy

| Region | Component | Responsibility |
|---|---|---|
| Icon rail | `IconRail` (`src/shell/icon-rail.tsx`) | Top-level navigation. Equal-weight icons. |
| Context rail | `ContextRail` (`src/shell/context-rail.tsx`) | Secondary navigation tied to the active icon-rail item. |
| Header | `ShellHeader` (`src/shell/shell-header.tsx`) | Workspace/context switcher, search, user menu. |
| Main | `ShellMain` (`src/shell/shell-main.tsx`) | The current view. |
| Right panel | `RightPanel` (`src/shell/right-panel.tsx`) | Detail or auxiliary surface, dismissible. |
| Command palette | `CommandPalette` (`src/shell/command-palette.tsx`) | Global keyboard-driven actions. |

The full shell wraps these in `AppShell` (`src/shell/app-shell.tsx`) with variants: `AppShellAuth`, `AppShellChat`, `AppShellWorkspace`.

## The flat-rail rule (critical)

**The `IconRail` is a flat list of equal-weight icons. No section headers, no per-group labels, no in-line dividers between groups.**

`IconRail` accepts `mainItems`, `utilityItems`, and a `footer`. Use those three slots — do NOT inject section labels or dividers via `renderLink`, custom items, or a wrapping component.

**Why:** A "Testing" divider above Journeys was specced and built three different ways in 2026-05 (renderLink-injected, a real `IconRailDivider` API in meda, and a consumer `pnpm patch`). All three were abandoned — meda PR #161 and labs PR #162 were closed unmerged; labs PR #163 removed the work. The icon-button slot is 44×44; anything wider overflows and overlaps the next icon, and an icon-only ~60px rail cannot host a text label legibly. **Do not re-propose dividers, group headers, or "mark this surface as testing/ops" rail treatments.**

If a surface needs a type indicator, it lives in the surface itself (a badge, a banner, a header pill) — never in the icon rail.

The existing `RailDivider` in `icon-rail.tsx` is a different pattern: a chevron toggle that **repositions** utility items between top and bottom of the rail. It is spatial, not a group label. Do not generalize it into section headers.

## IconRail item shape

```ts
interface IconRailItem {
  id: string;
  label: string;          // shown only in tooltip, never inline
  icon: LucideIcon;       // Lucide React only — no other icon libs
  to: string;
  badge?: ReactNode;      // small status indicator, top-right of the slot
}
```

Active state uses `bg-primary/12 text-primary`. Inactive uses `text-muted-foreground hover:bg-accent hover:text-foreground`. Slot is `h-11 w-11 rounded-xl`. Don't override these unless you're consciously diverging from the system.

## Right panel patterns

Use `RightPanel` for dismissible detail surfaces. Don't build a parallel right-side surface — multiple right panels in the same shell create state and dismiss-behavior conflicts. If you need a stacked detail experience, work with the existing `PanelViewsProvider` (`src/shell/panel-views-provider.tsx`).

## Theming

- `ShellProvider` (`src/shell/shell-provider.tsx`) owns layout state.
- Theme is wired via `theme.tsx` and `theme-next-themes.tsx` — choose one based on the consumer's framework (next-themes for Next.js apps).
- Layout viewport hooks: `useShellViewport`.

## Drag/drop

- `RailDropSlot`, `RailDropZones`, `DragModeBanner` are the canonical drag patterns. Don't add custom drag handlers to the rail — use these.

## Anti-patterns

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| Adding a section divider/header to `IconRail` | Three prior attempts abandoned; slot geometry can't host labels | Keep the rail flat; put type indicators in surfaces |
| Using `renderLink` to inject non-IconRailItem content | Wraps inside the 44×44 slot — overflows/overlaps | Use `mainItems` / `utilityItems` / `footer` only |
| Custom icon library | Inconsistent sizing + brand tone | Lucide React only |
| Multiple `RightPanel`s | Dismiss/state conflicts | Use `PanelViewsProvider` for stacked detail |
| Forking `ShellProvider` per app | Loses cross-consumer parity | Compose around it, don't fork it |
