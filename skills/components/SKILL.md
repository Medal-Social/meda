---
name: components
description: Use when implementing a UI component in any app that consumes `@medalsocial/meda`, choosing between a primitive and a shadcn-style UI adapter, scaffolding a Storybook story, or picking an icon. Required reading before generating any new visual code — the `meda-storybook` MCP server is the source of truth for what already exists.
---

# Meda Components

## When to load this skill

- About to author or modify a React component that renders UI.
- Choosing where to put a new component (primitive vs ui-adapter vs domain folder).
- Writing or updating a `*.stories.tsx`.
- Picking an icon or composing an empty-state.

## Look up first, generate second

**Before writing any new visual component, query the `meda-storybook` MCP server.** It exposes the running Storybook (`pnpm storybook` on `http://localhost:6006`) and is the authoritative index of what already exists. Many "new" components are existing primitives composed differently.

The MCP is registered in `.mcp.json`:

```json
{
  "mcpServers": {
    "meda-storybook": {
      "type": "http",
      "url": "http://localhost:6006/mcp"
    }
  }
}
```

If the MCP is not running, start it:

```bash
pnpm storybook
```

## Where things live

| Folder | What it is |
|---|---|
| `src/primitives/` | Standalone, framework-agnostic visual building blocks. Card, EmptyState, FilterRail, Skeleton, StatusPill. Each owns its own styling. |
| `src/components/ui/` | shadcn-style adapters that wrap `@base-ui/react`. Checkbox, Collapsible, Command, Dialog, Drawer, DropdownMenu, Tooltip. |
| `src/shell/` | Layout regions (rail, header, panel, palette). See the `meda-shell` skill. |
| `src/components/` (domain folders: `chat/`, `kanban/`, `calendar/`, etc.) | Higher-level composed components for specific surfaces. |
| `src/recipes/` | Opinionated wiring for specific frameworks (e.g. `next.ts`). |

## Primitive vs. ui-adapter vs. domain component

| If you need… | Reach for | Example |
|---|---|---|
| A self-contained visual element with no behavior dependency | `src/primitives/` (or add one) | `Card`, `StatusPill` |
| A shadcn-style overlay/menu/control wrapping `@base-ui/react` | `src/components/ui/` | `DropdownMenu`, `Dialog` |
| A composed surface specific to a product area | A domain folder (`src/chat/`, etc.) | A chat thread, a kanban column |
| Framework-specific glue (Next.js, etc.) | `src/recipes/` | `recipes/next.ts` |

**Don't invent a new top-level folder.** If your work doesn't fit, ask before adding one.

## Primitives layer

**`@base-ui/react` is the canonical primitives layer.** Forbidden in new code: `@radix-ui/*` packages. shadcn-style adapters in `src/components/ui/` wrap `@base-ui/react` — follow the existing pattern in `dropdown-menu.tsx` / `tooltip.tsx`.

## Optional peer dependencies — MarkdownView pattern

`MarkdownView` has optional peers (`react-markdown`, `remark-gfm`, `rehype-highlight`). It is **intentionally not re-exported from `src/primitives/index.ts`** — even type re-exports cause TS to follow the chain and break consumers who haven't installed the peers. Import via the dedicated subpath:

```ts
import { MarkdownView, type MarkdownViewProps } from '@medalsocial/meda/markdown-view';
```

When you add another optional-peer component, follow this pattern: own subpath, no root re-export.

## Storybook discipline

**Every exported component has a `*.stories.tsx`.** New components without stories fail review.

Stories live next to the component (`card.tsx` + `card.stories.tsx`). Use the `__stories__/` folder only for cross-component demos (full shell stories, theme-switcher demos).

## Icons

**Lucide React only.** No other icon libraries in new code. Never use emojis as UI icons. Custom-drawn icons require explicit review.

Shell sizes: 22px (rails), 16px (header), 14px (inline).

## className composition

Use `cn()` from `src/lib/utils`. Do not use `[...].join(' ')` or template-string concatenation — noisy and merge-unsafe.

## Anti-patterns

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| Generating UI without checking Storybook first | Duplicates existing primitives | Query `meda-storybook` MCP first |
| `@radix-ui/*` in new code | Deprecated primitives layer | Wrap `@base-ui/react` in `src/components/ui/` |
| Re-exporting `MarkdownView` from root | Breaks consumers without optional peers | Import from `@medalsocial/meda/markdown-view` |
| Adding emojis as UI icons | Inconsistent sizing + brand | Use Lucide equivalents (`Clock`, `Check`, `AlertTriangle`) |
| Inventing a new top-level folder | Loses the established taxonomy | Use primitives / ui / domain / recipes — ask before adding |
| Skipping a `*.stories.tsx` for an exported component | Breaks the lookup-first discipline for the next contributor | Always ship a story |
| `[...].join(' ')` for classes | Error-prone | Use `cn()` |
