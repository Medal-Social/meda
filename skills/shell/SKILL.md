---
name: shell
description: Use when scaffolding or modifying shell regions (icon rail, context rail, header, panel, command palette) in any app consuming `@medalsocial/meda` — Picasso, pilot-talk, NextMedal, apps/web. Required reading before adding a rail item, picking an AppShell variant (auth/workspace/chat), wiring command palette actions, configuring `MedaShellProvider`, or any `IconRail` change.
---

# Meda Shell

## When to load this skill

- Scaffolding a new shell — picking `AppShell` variant and configuring `MedaShellProvider`.
- Adding/removing/reordering icon rail items.
- Registering command palette actions.
- Wiring the workspace switcher or theme toggle in the header.
- Building or modifying the right panel.
- Touching anything under `src/shell/` in `@medalsocial/meda`.

## App shell variants

The package exports a single `<AppShell>` component with a discriminated `variant` prop. Pick exactly one variant per route group:

| Variant | When to use | Key config |
|---|---|---|
| `'auth'` | Sign-in / sign-up / password reset / OAuth callbacks. Lets the form scroll past viewport (dense forms, high zoom). | `auth`, `branding`, optional `preview` (right-side art) + `actions` (top-right) |
| `'workspace'` | Logged-in product shell. Has icon rail + context rail + header + main + optional right panel. | `iconRail`, `contextRail`, `rightPanel`, `workspace` (menu items override), `appTabs` (router integration), `headerCenter`, `headerLeading`, `headerLayout`, `banners`, `mainLayout`, `globalActions`, `mobileNav` |
| `'chat'` | Chat-first surfaces (full-bleed messaging UI; no rails). | `globalActions` |

`AppShellWorkspace.workspace.menuItems` REPLACES the default workspace dropdown ("Manage workspaces / Settings / Profile / Sign out") when provided. **The theme toggle is preserved automatically** — consumers do not have to re-implement theme cycling.

## Header layout — `split` (default) vs `rail`

`headerLayout` picks the desktop header grid. `split` is the historic layout and stays the default.

| | `split` (default) | `rail` |
|---|---|---|
| Grid | `[1fr, auto, 1fr]` when `headerCenter` is set, else flex | `[rail width, minmax(0,1fr), auto]` |
| Column 1 | workspace switcher (`chip`) + `headerLeading` | workspace switcher (`tile`), centred on the rail's axis |
| Column 2 | `headerCenter` | `headerLeading`, `min-w-0`, **all** remaining width |
| Column 3 | `globalActions` + `PanelToggle` | `globalActions` + `PanelToggle` |
| `headerCenter` | rendered | **ignored** |
| Padding | `px-4` | none on the left, `pr-4` |

Reach for `rail` when the app's section tabs live in the header: in `split` they are capped at
roughly half the window AND they shift horizontally with the workspace name, because the switcher
sizes to that name. In `rail` the switcher is boxed into the rail column, so the tabs start at a
fixed x — the same x the main region starts at below.

Column 1's width comes from `iconRail.labelVisibility`: `--shell-rail-label-width` for `visible`,
`--shell-rail-width` for the default `tooltip`. `AppShell` wires this for you; if you render
`<ShellHeader>` by hand, mirror it into `railLabelVisibility` yourself or the header and the rail
will disagree.

**Target the header with `data-meda-shell-header`**, present on both layouts (alongside
`data-meda-header-layout="split" | "rail"`). Do NOT reach for it structurally — a selector like
`.flex.h-svh > header` breaks silently on any markup change.

## WorkspaceSwitcher variants

`variant="chip"` (default) is the horizontal mark · name · chevron button. `variant="tile"` is the
rail-column shape the `rail` header uses: a full-width button with the mark on the rail axis, the
name beneath it in `data-slot="icon-rail-label"` type (2-line clamp, hidden below 700px viewport
height like every other rail label), and a small chevron hung off the mark so the mark itself
never leaves the axis. Its accessible name is `"<workspace name> workspace menu"`. Pass
`showLabel={false}` in icon-only rail mode. The dropdown — items, theme toggle, footer, keyboard
and dismiss behaviour — is identical in both.

## Keeping panel views without the header toggle

`rightPanel.showToggle: false` drops the header's `PanelToggle` while the views stay registered and
openable from anywhere else (`useMedaShell().panel.focus(id)`, a command, a route). It cannot do
the reverse — a toggle with no views is still hidden, because it would be a dead end. Do NOT hide
the toggle with consumer CSS such as `[data-meda-global-actions] + * { display: none }`; that is
what this prop replaces.

## MedaShellProvider — the runtime root

Wrap your app once with `<MedaShellProvider>` (typically in the root layout). Props:

```ts
interface MedaShellProviderProps {
  workspace: WorkspaceDefinition;                                 // required
  workspaces?: WorkspaceDefinition[];                             // for the switcher
  apps: AppDefinition[];                                          // required, non-empty (throws if empty)
  defaultActiveApp?: string;                                      // app id; defaults to apps[0]
  storage?: ShellStorageAdapter;                                  // defaults to localStorage adapter
  mobileBottomNav?: MobileBottomNavItem[];                        // mobile nav config
  commandPaletteHotkey?: string;                                  // e.g. 'mod+k' (default)
  themeAdapter?: 'default' | 'next-themes' | ThemeAdapter;        // pick per-framework
  children: ReactNode;
}
```

- **`themeAdapter: 'next-themes'`** for Next.js apps using `next-themes`. The adapter is lazy-loaded so default-adapter consumers don't pay for the bridge.
- **`themeAdapter: 'default'`** uses the built-in adapter (no external dep).
- Pass a custom `ThemeAdapter` object to integrate with any other theme system.
- `apps` MUST have at least one entry — the provider throws on empty array.

## Regions and component map

| Region | Component | Source |
|---|---|---|
| Icon rail | `IconRail` | `src/shell/icon-rail.tsx` |
| Context rail | `ContextRail` | `src/shell/context-rail.tsx` |
| Header | `ShellHeader` + `WorkspaceSwitcher` | `src/shell/shell-header.tsx` |
| Main | `ShellMain` | `src/shell/shell-main.tsx` |
| Right panel | `RightPanel` | `src/shell/right-panel.tsx` |
| Command palette | `CommandPalette` + `CommandRegistryContext` | `src/shell/command-palette.tsx` |

## The flat-rail rule (critical)

**The `IconRail` is a flat list of equal-weight icons. No section headers, no per-group labels, no in-line dividers between groups.**

`IconRail` accepts `mainItems`, `utilityItems`, and a `footer`. Use those three slots — do NOT inject section labels or dividers via `renderLink`, custom items, or a wrapping component.

**Why:** A "Testing" divider above Journeys was specced and built three different ways in 2026-05 (renderLink-injected, a real `IconRailDivider` API in meda, and a consumer `pnpm patch`). All three were abandoned — meda PR #161 and labs PR #162 were closed unmerged; labs PR #163 removed the work. The icon-button slot is 44×44; anything wider overflows and overlaps the next icon, and an icon-only ~60px rail cannot host a text label legibly. **Do not re-propose dividers, group headers, or "mark this surface as testing/ops" rail treatments.**

If a surface needs a type indicator, it lives in the surface itself (a banner, a header pill, a column-header badge) — never in the icon rail.

The existing `RailDivider` in `icon-rail.tsx` is a different pattern: a chevron toggle that **repositions** utility items between top and bottom of the rail. It is spatial, not a group label. Do not generalize it into section headers.

## IconRail item shape + active styling

```ts
interface IconRailItem {
  id: string;
  label: string;          // shown only in tooltip, never inline
  icon: LucideIcon;       // Lucide React only — no other icon libs
  to: string;
  badge?: ReactNode;      // small status indicator, top-right of the slot
}
```

Slot is `h-11 w-11 rounded-xl`. Active state uses `bg-primary/12 text-primary` (a 12%-alpha brand tint, NOT a solid brand fill — this is the legitimate `bg-primary` use case from the `brand` skill's note). Inactive uses `text-muted-foreground hover:bg-accent hover:text-foreground`. Don't override unless you're consciously diverging.

Pass `activeId` to mark which item is active; usually derived from your router's current path.

## `renderLink` — when to use it

`IconRail` and other rail components accept a `renderLink` prop that wraps the default `<a>`:

```tsx
renderLink={({ item, isActive, className, children, linkProps }) => (
  <NextLink href={item.to} className={className} {...linkProps}>
    {children}
  </NextLink>
)}
```

**Use it for:** integrating with Next.js `Link`, TanStack Router, React Router — anything that needs client-side navigation hooks.

**Do NOT use it for:** injecting dividers, headers, badges outside the slot, or any non-link content (see the flat-rail rule). The `className` parameter constrains your wrapper to the 44×44 slot — non-link content overflows.

## Command palette

`CommandPalette` is registry-driven. Components register their commands via the **public hooks** `useCommands` and `useCommandGroup` from `@medalsocial/meda/shell` — both must run inside a `<CommandPalette>` (they throw otherwise).

```tsx
import { useCommands, useCommandGroup } from '@medalsocial/meda/shell';

function MyFeature() {
  // Optional: register the group first so its label + ordering are known.
  useCommandGroup({ id: 'tools', label: 'Tools', priority: 50 });

  useCommands([
    { id: 'my.action', label: 'Run my action', group: 'tools', run: () => doIt() },
  ]);

  return null; // or your real UI
}
```

Each hook auto-handles register-on-mount and unregister-on-unmount via `useEffect`. Lower `priority` numbers render the group earlier (default 100).

`CommandRegistryContext` is internal — don't import or `useContext` it directly. The hooks are the supported API.

The default palette hotkey is `'mod+k'` — override via `MedaShellProvider.commandPaletteHotkey`. Hotkey matching is strict modifier-aware: `'mod+k'` does NOT fire on `mod+shift+k`. Use `'mod'` (resolves to ⌘ on macOS, Ctrl on Windows/Linux), not platform-specific keywords.

## Mobile dock + workspace sheet — light by app, open where you are

`mobileNav.activeTo` is the exact address of the active row. On its own it makes the dock go dark
as soon as the user leaves an app's first tab, because a dock slot only lights on
`item.to === activeTo`. Pass `mobileNav.activeId` — the active APP's id — alongside it:

- **Dock:** a slot is active iff `item.id === activeId`. Action slots (`open-sheet`, `open-ai`,
  `open-command-palette`) light only through `activeId`, never through the `activeTo` fallback.
- **Workspace sheet:** that row is expanded and scrolled into view on every open. The user can
  still collapse it, and it re-expands on the next open. With no `activeId` the sheet derives the
  row from `activeTo` — an exact `to` match first, then the row that owns `activeTo` among its
  preset `views`.
- **`mobileNav.currentFirst`:** renders that row first inside its group.

Omit `activeId` and both surfaces behave exactly as they did before it existed.

## Right panel patterns

Use a single `RightPanel` per shell. Don't build a parallel right-side surface — multiple right panels create state and dismiss-behavior conflicts. For a stacked detail experience, register multiple `PanelView`s with the existing `PanelViewsProvider` (`src/shell/panel-views-provider.tsx`).

## Drag patterns

`RailDropSlot`, `RailDropZones`, `DragModeBanner` are the canonical drag patterns. Don't add custom drag handlers to the rail — use these so the visual + a11y behavior matches across consumers.

## Anti-patterns

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| Adding a section divider/header to `IconRail` | Three prior attempts abandoned; slot geometry can't host labels | Keep the rail flat; put type indicators in surfaces |
| Using `renderLink` for non-link content | Wraps inside the 44×44 slot — overflows/overlaps | Use `mainItems` / `utilityItems` / `footer` only |
| Picking `'workspace'` variant on a sign-in route | Renders rails on routes with no app context | Use `'auth'` variant; switch to `'workspace'` after auth |
| Re-implementing the theme toggle when overriding `workspace.menuItems` | The package inserts the toggle automatically | Just ship your menu items; toggle is added between items and footer |
| Custom icon library | Inconsistent sizing + brand tone | Lucide React only |
| Multiple `RightPanel`s in one shell | Dismiss/state conflicts | Use `PanelViewsProvider` for stacked detail |
| Forking `MedaShellProvider` per app | Loses cross-consumer parity | Compose around it; pass a custom `ThemeAdapter` for theme integration |
| Hard-coded modifier in hotkey strings (`'cmd+k'`) | Breaks on Windows/Linux | Use `'mod+k'` — resolves per-platform |
| Selecting the header structurally (`.flex.h-svh > header`) | Breaks silently on any markup change | Target `[data-meda-shell-header]` |
| Hiding the panel toggle with consumer CSS | Depends on internal sibling order | `rightPanel={{ showToggle: false }}` |
| Passing `headerCenter` together with `headerLayout="rail"` | The rail grid has no centre column; the node never renders | Put the content in `headerLeading` |
| Lighting the mobile dock from `activeTo` alone | Goes dark on every route past an app's first tab | Also pass `mobileNav.activeId` |
