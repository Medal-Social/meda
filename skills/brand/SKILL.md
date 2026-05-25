---
name: meda-brand
description: Use when picking a CTA color, editing color/typography tokens, authoring or modifying any `*.css` file under `src/styles/`, or choosing brand-vs-semantic tokens for any component in `@medalsocial/meda` or apps that consume it (Picasso, pilot-talk, NextMedal, apps/web).
---

# Meda Brand & Tokens

## When to load this skill

- Editing `tokens.css`, `theme.css`, or any file under `src/styles/`.
- Choosing a color for a CTA, link, badge, status pill, or chart element.
- Adding or renaming a token.
- Picking typography (font family, weight, size scale).
- Wiring a brand logo or accent color in a consumer app.

## Overview

`@medalsocial/meda` is **purple-forward with a zinc-aligned neutral base** — not a custom warm/cool scheme. Two coexisting layers:

- **Brand ramp** — constant across light and dark themes. The brand identity.
- **Semantic tokens** (`--primary`, `--accent`, `--surface`, etc.) — flip between themes.

Most components reference semantic tokens. Primary CTAs and brand identity surfaces pin to the brand ramp directly — see the rule below.

## Brand ramp (constant across themes)

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

**Primary CTAs and brand identity surfaces use `bg-brand-500 hover:bg-brand-600 text-white` in BOTH light and dark themes. Do NOT use the semantic `bg-primary` / `text-primary-foreground` pair for primary CTAs.**

**Why:** meda's `--primary` deliberately flips — `brand-800` in light, `brand-100` in dark. `brand-100` is a pale near-white, so `bg-primary` renders a primary CTA as a washed-out near-white pill in dark mode. Medal's brand identity is the rich `#7E3FAC` purple applied constantly, not theme-inverted.

**Apply when:** building a `<Button variant="primary">`, picking the dominant accent for an onboarding/sign-up panel, rendering a brand logo or workspace mark.

**Do not apply to:** secondary buttons, ghost buttons, status surfaces, or any element where pale-in-dark is the intended affordance. Those should use semantic tokens and let them flip.

**Bonus:** fixed bg + fixed light text avoids flipping-foreground-on-fixed-bg contrast bugs that code-review bots catch (Codex P2).

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

**Do not** ship a generic gray neutral palette (Apple-style cool grays, Tailwind `gray-*`). Use the zinc-aligned ramp above.

## Status ramps

- **error** (rose): `#FFF1F2` → `#E11D48` (600) → `#881337` (900)
- **info** (blue): `#EFF6FF` → `#2563EB` (600) → `#172554` (900)
- **success** (**teal**, not green): `#F0FDFA` → `#0D9488` (600) → `#134E4A` (900)
- **warning** (amber): `#FFFBEB` → `#D97706` (600) → `#78350F` (900)

**Success is teal, not green.** Common mistake.

## Semantic tokens (flip by theme)

| Token | Light | Dark |
|---|---|---|
| `--background` | `neutral-50` | `surface-bg` |
| `--foreground` | `neutral-950` | `neutral-50` |
| **`--primary`** | **`brand-800`** | **`brand-100`** |
| `--primary-foreground` | `brand-50` | `brand-900` |
| `--accent` | `neutral-200` | `surface-muted` |
| `--accent-foreground` | `neutral-950` | `neutral-50` |
| `--destructive` | `error-600` | `error-400` |
| `--border` | `neutral-200` | `surface-border` |
| `--ring` | `brand-600` | `brand-400` |

**Critical:** `--accent` is a NEUTRAL, not a brand color. Use brand tokens directly when you want brand color.

## Typography — Geist only

- `--font-family-sans`: **`"Geist"`**
- `--font-family-mono`: **`"Geist Mono"`**

**No Inter, no system stacks.** Geist + Geist Mono only.

Size scale: `display` 36px, `h1` 30, `h2` 24, `h3` 20, `h4` 18, `body-lg` 16, `body` 14, `body-sm` 13, `caption` 11, `overline` 10.

## CSS framework

- **Tailwind v4** — CSS-first via `@theme inline` in `src/styles/theme.css`.
- **No `tailwind.config.js`**, no JS preset.
- The theme bridge exposes primitives as Tailwind theme keys (`--color-brand-*`, `--color-neutral-*`, `--color-error-*`), so `bg-brand-500`, `text-error-600`, `bg-success-50` work natively.

## Anti-patterns

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| `bg-primary` for a primary CTA | `--primary` flips to pale brand-100 in dark | Use `bg-brand-500 text-white` (constant) |
| Generic gray neutrals | Medal is zinc-aligned, not cool gray | Use `neutral-*` from the ramp above |
| `--primary` mapped to brand-500 | Lib has primary as brand-800 light / brand-100 dark | Map exactly — light=brand-800, dark=brand-100 |
| Treating `--accent` as a brand color | `--accent` is neutral by contract | Use `brand-*` tokens directly |
| Adding Inter or system fonts | Canonical is Geist + Geist Mono | Stick to the two families |
| `success` as green | Canonical success is teal | Use the teal scale |
| `[...].join(' ')` for classNames | Noisy, error-prone | Use `cn()` |
