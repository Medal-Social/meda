---
name: components
description: Use when implementing a UI component in any app consuming `@medalsocial/meda` — building a card, dialog, status pill, empty state, dropdown, tooltip — or picking a primitive vs a shadcn-style adapter vs a domain folder. Required reading before generating any new visual code; the `meda-storybook` MCP server is the source of truth for what already exists.
---

# Meda Components

## When to load this skill

- About to author or modify a React component that renders UI.
- Choosing where a new component lives (primitive / ui-adapter / domain / recipe).
- Composing `Card`, `EmptyState`, `StatusPill`, or another exported primitive.
- Picking between primitives and shadcn-style ui adapters.
- Writing or updating a `*.stories.tsx`.
- Importing `MarkdownView` or another optional-peer-deps component.

## Look up first, generate second

**Before writing any new visual component, query the `meda-storybook` MCP server.** It exposes the running Storybook (`pnpm storybook` on `http://localhost:6006`) and is the authoritative index of what already exists. Many "new" components are existing primitives composed differently.

If the MCP is not running, start it:

```bash
pnpm storybook
```

The MCP is registered in `.mcp.json`.

## Where things live

| Folder | What it is |
|---|---|
| `src/primitives/` | Standalone visual building blocks. Each owns its own styling. |
| `src/components/ui/` | shadcn-style adapters that wrap `@base-ui/react`. |
| `src/shell/` | Layout regions — see the `shell` skill. |
| `src/{chat,kanban,calendar,timeline,marketing,workflow-builder,...}/` | Domain folders for higher-level composed surfaces. |
| `src/recipes/` | Framework-specific glue (e.g. `recipes/next.ts`). |
| `src/lib/` | Shared utilities (`cn()`, etc.). |

**Don't invent a new top-level layer** (primitives/ui/recipes). Adding a new *domain* folder for a real product area is fine; check with a maintainer first if uncertain.

## Primitive vs ui-adapter vs domain — picking where to add

| If you need… | Reach for | Example |
|---|---|---|
| A self-contained visual element with no behavior dependency | `src/primitives/` | `Card`, `StatusPill`, `EmptyState`, `Skeleton`, `FilterRail` |
| An overlay / menu / form control wrapping `@base-ui/react` | `src/components/ui/` | `DropdownMenu`, `Dialog`, `Drawer`, `Tooltip`, `Command`, `Checkbox`, `Collapsible` |
| A composed surface tied to a product area | A domain folder | A chat thread (`src/chat/`), a kanban column (`src/kanban/`) |
| Framework-specific glue | `src/recipes/` | `recipes/next.ts` |

## Primitives layer

**`@base-ui/react` is the canonical primitives layer.** Forbidden in new code: `@radix-ui/*` packages. shadcn-style adapters in `src/components/ui/` wrap `@base-ui/react` — follow the existing patterns in `dropdown-menu.tsx` / `tooltip.tsx`.

## Card — compound component

```tsx
import { Card } from '@medalsocial/meda';

<Card>
  <Card.Header>
    <h3 className="text-h4">Workspace usage</h3>
  </Card.Header>
  <Card.Body>
    Body content here.
  </Card.Body>
  <Card.Footer>
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </Card.Footer>
</Card>
```

`Card`, `Card.Header`, `Card.Body`, `Card.Footer` are all `<div>`-typed and accept any standard div props. The header/footer auto-hide their borders when adjacent to the body (`last:border-b-0` / `first:border-t-0`), so a header-only or body-only card has no orphan border. Always use the subcomponents — don't reach into the card with raw padded `<div>`s.

## EmptyState — variants matter

```tsx
import { EmptyState } from '@medalsocial/meda';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={Inbox}
  title="No messages yet"
  description="When someone messages your workspace, it'll show up here."
  action={<Button>Invite teammates</Button>}
  variant="panel"
/>
```

Variants:
- `'default'` — full-page empty state, generous vertical spacing.
- `'panel'` — panel-sized empty state (e.g. inside a right panel or card).
- `'inline'` — compact, for list-row or table-row empty states.

The `icon` prop accepts a Lucide component (`Inbox`) OR a rendered element (custom inline SVG). Lucide components are auto-sized; rendered elements are placed in an `inline-flex` span and you control their size.

## StatusPill — solid tones, two sizes

```tsx
import { StatusPill } from '@medalsocial/meda';

<StatusPill tone="success">Synced</StatusPill>
<StatusPill tone="warning" size="md">Action required</StatusPill>
<StatusPill tone="danger" dot={false}>Failed</StatusPill>
```

- `tone`: `'neutral' | 'info' | 'success' | 'warning' | 'danger'`
- `size`: `'sm'` (default, 11px text) or `'md'` (12px text)
- `dot`: `true` (default) to show a leading dot

**Why solid backgrounds (not tinted):** the 11px small size needs ≥4.5:1 contrast to pass WCAG AA. Tinted backgrounds (`bg-info/15 text-info`) fail axe gates at this size. Solid `bg-info text-info-foreground` etc. always passes via the theme tokens. If you need a tinted variant, use it at `size="md"` or larger only, and verify with `vitest-axe`.

## ui-adapter examples

shadcn-style adapters in `src/components/ui/` wrap `@base-ui/react`. They follow the canonical shadcn API surface:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@medalsocial/meda';

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader><DialogTitle>Confirm</DialogTitle></DialogHeader>
    Body
  </DialogContent>
</Dialog>
```

Same pattern for `DropdownMenu`, `Tooltip`, `Drawer`, `Command`, `Checkbox`, `Collapsible`. When you need a new adapter, scaffold from the existing `dropdown-menu.tsx` or `tooltip.tsx` — they show the base-ui binding pattern.

## Optional peer dependencies — MarkdownView pattern

`MarkdownView` has optional peers (`react-markdown`, `remark-gfm`, `rehype-highlight`). It is **intentionally not re-exported from `src/primitives/index.ts`** — even type re-exports cause TS to follow the chain and break consumers who haven't installed the peers. Import via the dedicated subpath:

```ts
import { MarkdownView, type MarkdownViewProps } from '@medalsocial/meda/markdown-view';
```

When you add another optional-peer component, follow this pattern: own subpath, no root re-export, peers declared as `peerDependenciesMeta.*.optional`.

## Storybook discipline

**Every exported component has a `*.stories.tsx`.** New components without stories fail review.

Stories live next to the component (`card.tsx` + `card.stories.tsx`). Use the `__stories__/` folder only for cross-component demos (full shell stories, theme-switcher demos).

Visual snapshots run through Chromatic on every PR.

## Icons

**Lucide React only.** No other icon libraries in new code. Never use emojis as UI icons. Custom-drawn icons require explicit review.

Shell sizes: 22px (rails), 16px (header), 14px (inline). Inside primitives like `EmptyState`, the icon auto-sizes to match the variant.

## className composition

Use `cn()` from `src/lib/utils`. Do not use `[...].join(' ')` or template-string concatenation — noisy and merge-unsafe.

```tsx
import { cn } from '@medalsocial/meda';

<div className={cn('base classes', isActive && 'active', className)} />
```

## Anti-patterns

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| Generating UI without checking Storybook first | Duplicates existing primitives | Query `meda-storybook` MCP first |
| `@radix-ui/*` in new code | Deprecated primitives layer | Wrap `@base-ui/react` in `src/components/ui/` |
| Re-exporting `MarkdownView` from root | Breaks consumers without optional peers | Import from `@medalsocial/meda/markdown-view` |
| Tinted `StatusPill` at `size="sm"` | Fails WCAG AA at 11px (vitest-axe gate) | Use solid tones at `sm`; tints only at `md`+ with a11y verification |
| Raw `<div>` inside `<Card>` with custom padding | Bypasses border-collapse logic; off-grid spacing | Use `Card.Header` / `Card.Body` / `Card.Footer` |
| Adding emojis as UI icons | Inconsistent sizing + brand | Use Lucide equivalents (`Clock`, `Check`, `AlertTriangle`) |
| Inventing a new top-level layer folder | Loses the established taxonomy | Use primitives / ui / domain / recipes |
| Skipping `*.stories.tsx` for an exported component | Breaks the lookup-first discipline for the next contributor | Always ship a story |
| `[...].join(' ')` for classes | Error-prone | Use `cn()` |
