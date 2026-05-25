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
| `'workspace'` | Logged-in product shell. Has icon rail + context rail + header + main + optional right panel. | `iconRail`, `contextRail`, `rightPanel`, `workspace` (menu items override), `appTabs` (router integration), `headerCenter`, `banners`, `mainLayout`, `globalActions` |
| `'chat'` | Chat-first surfaces (full-bleed messaging UI; no rails). | `globalActions` |

`AppShellWorkspace.workspace.menuItems` REPLACES the default workspace dropdown ("Manage workspaces / Settings / Profile / Sign out") when provided. **The theme toggle is preserved automatically** — consumers do not have to re-implement theme cycling.

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
