---
name: brand
description: Use when picking a CTA color, choosing brand-vs-semantic tokens, building a button/badge/pill, styling a chart or sidebar, configuring focus rings, editing any file under `src/styles/`, or scaffolding theme tokens in a new app that consumes `@medalsocial/meda`. Required reading before any visual work — covers the constant-brand CTA rule, the full token contract, and Tailwind v4 wiring.
---

# Meda Brand & Tokens

## When to load this skill

- Editing `tokens.css`, `theme.css`, `globals.css`, or any file under `src/styles/`.
- Choosing a color for a CTA, link, badge, status pill, sidebar item, or chart series.
- Adding, renaming, or removing a token.
- Picking typography (font family, weight, size scale).
- Configuring focus rings, radii, or spacing.
- Wiring a brand logo or accent color in a consumer app.

## Overview

`@medalsocial/meda` is **purple-forward with a zinc-aligned neutral base** — not a custom warm/cool scheme. Two coexisting layers of tokens:

- **Primitive ramps** — `brand-*`, `neutral-*`, `error-*`, `info-*`, `success-*`, `warning-*`, plus dark-mode `surface-*` constants. Constant across themes.
- **Semantic tokens** — `--primary`, `--accent`, `--background`, `--card`, `--sidebar`, `--chart-1`...`--chart-5`, `--text-*`. Flip by theme.

Most components reference semantic tokens. Primary CTAs and brand-identity surfaces pin to the brand ramp directly — see the rule below.

CSS framework: **Tailwind v4**, CSS-first via `@theme inline` in `src/styles/theme.css`. **No `tailwind.config.js`**, no JS preset. Primitives are exposed as Tailwind theme keys (`--color-brand-*`, `--color-neutral-*`, `--color-chart-*`, etc.), so `bg-brand-500`, `text-success-600`, `bg-chart-3` work natively. Dark mode uses the Tailwind `dark:` variant on the `<html>` root.

## Brand ramp (constant across themes — purple, 11 stops)

| Stop | Hex |
|---|---|
| brand-50  | `#FAFAFD` |
| brand-100 | `#EEEAF5` |
| brand-200 | `#DCD4E8` |
| brand-300 | `#B8A3D2` |
| brand-400 | `#9A6AC2` |
| brand-500 | `#7E3FAC` |
| brand-600 | `#6A2E96` |
| brand-700 | `#482070` |
| brand-800 | `#2F1552` |
| brand-900 | `#1C0E38` |
| brand-950 | `#120A24` |

## The constant-brand CTA rule (critical)

**Primary CTAs and brand-identity surfaces use `bg-brand-500 hover:bg-brand-600 text-white` in BOTH light and dark themes. Do NOT use `bg-primary` / `text-primary-foreground` for primary CTAs.**

**Why:** `--primary` deliberately flips — `brand-800` in light, `brand-100` in dark. `brand-100` is a pale near-white, so `bg-primary` renders a primary CTA as a washed-out near-white pill in dark mode. Medal's brand identity is the rich `#7E3FAC` purple applied constantly, not theme-inverted.

**`bg-primary` is fine when used as a tint/overlay** (e.g. `bg-primary/12 text-primary` for an active rail item — see the `shell` skill). The prohibition is specifically about solid CTA fills where the user expects a vivid brand presence.

```tsx
// ❌ Wrong: pale in dark
<Button className="bg-primary text-primary-foreground">Get started</Button>

// ✅ Right: constant brand-purple in both themes
<Button className="bg-brand-500 hover:bg-brand-600 text-white">Get started</Button>

// ✅ Also right (active state, tinted overlay)
<Link className="bg-primary/12 text-primary">Dashboard</Link>
```

Logos and brand marks render in `var(--color-brand-500)`, not `currentColor`.

## Neutral ramp (zinc-aligned)

| Stop | Hex | Tailwind zinc |
|---|---|---|
| neutral-50  | `#FAFAFA` | zinc-50 |
| neutral-100 | `#F4F4F5` | zinc-100 |
| neutral-200 | `#E4E4E7` | zinc-200 |
| neutral-300 | `#A1A1AA` | zinc-400 |
| neutral-400 | `#71717A` | zinc-500 |
| neutral-500 | `#52525B` | zinc-600 |
| neutral-600 | `#3F3F46` | zinc-700 |
| neutral-700 | `#27272A` | zinc-800 |
| neutral-800 | `#18181B` | zinc-900 |
| neutral-900 | `#111113` | between zinc-900/950 |
| neutral-950 | `#09090B` | zinc-950 |

**Do not** ship a generic gray neutral palette (Apple-style cool grays, Tailwind `gray-*`). Use the zinc-aligned ramp.

## Status ramps

| Status | Family | Mid (600) |
|---|---|---|
| error | rose | `#E11D48` |
| info | blue | `#2563EB` |
| **success** | **teal**, not green | `#0D9488` |
| warning | amber | `#D97706` |

Each ramp has 10 stops (50, 100–900).

## Surface primitives (dark-mode constants)

- `--surface-bg`: `#09090B`
- `--surface-card`: `#18181B`
- `--surface-muted`: `#27272A`
- `--surface-border`: `#2E2E33`
- `--surface-sidebar`: `#0F0F12`

## Semantic tokens (flip by theme)

### shadcn-shape core

| Token | Light | Dark |
|---|---|---|
| `--background` | `neutral-50` | `surface-bg` |
| `--foreground` | `neutral-950` | `neutral-50` |
| `--card` | `neutral-50` | `surface-card` |
| `--card-foreground` | `neutral-950` | `neutral-50` |
| `--popover` | `neutral-50` | `surface-card` |
| **`--primary`** | **`brand-800`** | **`brand-100`** |
| `--primary-foreground` | `brand-50` | `brand-900` |
| `--secondary` | `neutral-200` | `surface-muted` |
| `--muted` | `neutral-100` | `surface-muted` |
| `--muted-foreground` | `neutral-500` | `neutral-300` |
| `--accent` | `neutral-200` | `surface-muted` |
| `--destructive` | `error-600` | `error-400` |
| `--border` | `neutral-200` | `surface-border` |
| `--input` | `neutral-200` | `surface-muted` |
| `--ring` | `brand-600` | `brand-400` |

**Critical:** `--accent` is a NEUTRAL by contract (not a brand color). Use `brand-*` tokens directly when you want brand color. `--ring` (focus ring) is brand-keyed and theme-flips between brand-600 and brand-400.

### Status (semantic)

| Token | Light | Dark |
|---|---|---|
| `--success` / `--success-foreground` | `success-600` / `neutral-950` | `success-400` / `neutral-950` |
| `--warning` / `--warning-foreground` | `warning-600` / `neutral-950` | `warning-400` / `neutral-950` |
| `--info` / `--info-foreground` | `info-600` / `neutral-50` | `info-400` / `neutral-950` |
| `--danger` (alias for destructive) | `error-600` | `error-400` |

### Sidebar

| Token | Light | Dark |
|---|---|---|
| `--sidebar` | `neutral-100` | `surface-sidebar` |
| `--sidebar-foreground` | `neutral-950` | `neutral-50` |
| `--sidebar-primary` | `brand-700` | `brand-400` |
| `--sidebar-accent` | `neutral-50` | `surface-card` |
| `--sidebar-border` | `neutral-200` | `surface-border` |
| `--sidebar-ring` | `brand-500` | `brand-400` |

### Chart (5 series)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--chart-1` | `brand-600` | `brand-500` | Brand purple |
| `--chart-2` | `info-600` | `info-500` | Blue |
| `--chart-3` | `success-600` | `success-400` | Teal |
| `--chart-4` | `warning-600` | `warning-500` | Amber |
| `--chart-5` | `error-600` | `error-400` | Rose |

Always cycle in this order — `--chart-1` first — so brand purple owns the primary series across consumers.

### Text

| Token | Light | Dark |
|---|---|---|
| `--text` | `neutral-950` | `neutral-50` |
| `--text-muted` | `neutral-500` | `neutral-300` |
| `--text-link` | `brand-600` | `brand-400` |
| `--text-primary` | `neutral-950` | `neutral-100` |
| `--text-secondary` | `neutral-600` | `neutral-300` |

## Typography — Geist only

- `--font-family-sans`: **`"Geist"`**
- `--font-family-mono`: **`"Geist Mono"`**

**No Inter, no system stacks.** Geist + Geist Mono only.

Size scale: `display` 36, `h1` 30, `h2` 24, `h3` 20, `h4` 18, `body-lg` 16, `body` 14, `body-sm` 13, `caption` 11, `overline` 10.

## Radii

`--radius` (base) 8px. Scale: `radius-sm` 4, `radius-md` 6, `radius-lg` 8, `radius-xl` 12, `radius-2xl` 16, `radius-3xl` 20, `radius-4xl` 24, `radius-full` 9999.

## Spacing

`xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 24, `2xl` 32, `3xl` 48, `4xl` 64 (px). Use the named tokens, not raw px values, so consumer overrides flow through.

## Anti-patterns

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| `bg-primary` for a primary CTA | `--primary` flips to pale brand-100 in dark — washed-out CTAs | `bg-brand-500 text-white` (constant) |
| Generic gray neutrals (Tailwind `gray-*`) | Medal is zinc-aligned, not cool gray | Use `neutral-*` from the ramp |
| `--primary` mapped to brand-500 | Lib has primary as brand-800 light / brand-100 dark | Map exactly — light=brand-800, dark=brand-100 |
| Treating `--accent` as a brand color | `--accent` is neutral by contract | Use `brand-*` tokens directly |
| Hard-coded `ring-blue-500` for focus rings | Focus rings are brand-keyed via `--ring` | `focus-visible:ring-2 focus-visible:ring-ring` |
| Picking chart colors ad-hoc per app | Loses cross-consumer parity | Cycle `--chart-1`..`--chart-5` in order |
| Adding Inter or system fonts | Canonical is Geist + Geist Mono | Stick to the two families |
| `success` as green | Canonical success is teal | Use the teal scale |
| `[...].join(' ')` for classNames | Noisy, error-prone | Use `cn()` from `src/lib/utils` |
| Raw px (e.g. `pt-[12px]`) for spacing | Bypasses consumer overrides | Use the named spacing tokens |
