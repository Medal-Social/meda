# Foundation Primitives Design

Date: 2026-05-01
Status: Draft for review

## Goal

Address the foundation-primitives slice of issue #102 by adding reusable Meda primitives for common loading, empty, and filtering surfaces:

- `Skeleton`
- `EmptyState`
- `FilterRail`

These primitives should reduce repeated consumer code while preserving Meda's two adoption paths: package imports for teams that want future updates, and shadcn-compatible registry copy-in for teams that want local ownership.

## Scope

In scope:

- Add Meda-owned primitives under a new internal `src/primitives/` area.
- Export the primitives from the root package API.
- Add shadcn-compatible registry entries for the primitives.
- Add Storybook coverage, including a foundation/primitives collection so these are discoverable together.
- Add focused tests for rendering, accessibility-relevant structure, variants, root exports, registry validation, and build output.
- Update README and Storybook docs to describe package and registry adoption.

Out of scope:

- Banner stacking and priority behavior.
- Route-aware command auto-registration.
- Mobile gesture primitives.
- IconRail pinned-bottom persistence.
- Additional shell state or panel-view behavior changes.

## Public API

The canonical package import will be from the root package:

```tsx
import { EmptyState, FilterRail, Skeleton } from "@medalsocial/meda";
```

This keeps the primitives visible as part of the public design system and matches the existing consumer model: install the package for ongoing updates, or copy source from the registry.

No new public `@medalsocial/meda/primitives` subpath is required in this pass. If the primitive set grows substantially, a dedicated subpath can be added later without breaking root imports.

## Component Design

### Skeleton

`Skeleton` is intentionally small and shadcn-shaped:

```tsx
<Skeleton className="h-4 w-32" />
```

Behavior:

- Render a `div`.
- Accept normal `React.ComponentProps<"div">`.
- Apply `data-slot="skeleton"`.
- Use Meda token classes for muted background, radius, and pulse animation.
- Default to `aria-hidden="true"` unless a consumer explicitly overrides it.
- Avoid sizing props; consumers control dimensions with classes.

### EmptyState

`EmptyState` standardizes zero, empty, and error-like content surfaces:

```tsx
<EmptyState
  icon={Inbox}
  title="No messages"
  description="New conversations will appear here."
  action={<Button>Compose</Button>}
/>
```

Proposed props:

```ts
interface EmptyStateProps {
  icon?: LucideIcon | ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "panel" | "inline";
  className?: string;
}
```

Behavior:

- `default` is suitable for main content regions.
- `panel` uses tighter spacing for right panels or drawers.
- `inline` is compact for list sections and embedded surfaces.
- Icon rendering supports Lucide-style components and rendered React nodes.
- Title and description remain plain slots so consumers can localize or compose rich text.
- The component provides structure and spacing, not domain-specific copy.

### FilterRail

`FilterRail` is a dense operational filter surface, not a filtering engine. State and query logic stay with the consuming app.

Example:

```tsx
<FilterRail
  title="Filters"
  description="Refine the queue"
  search={<SearchInput />}
  footer={<Button variant="ghost">Reset</Button>}
>
  <FilterRail.Group title="Status">
    <CheckboxRow label="Open" />
    <CheckboxRow label="Waiting" />
  </FilterRail.Group>
</FilterRail>
```

Proposed props:

```ts
interface FilterRailProps {
  title?: ReactNode;
  description?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}

interface FilterRailGroupProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}
```

Behavior:

- Render a labelled complementary/filter surface suitable for side rails and dense panels.
- Provide consistent header, optional search, action, group, body, and footer slots.
- Keep filter state external; no built-in selected values, query parsing, or URL syncing.
- Support grouped controls via `FilterRail.Group`.
- Use Meda tokens and restrained spacing so it fits operational views.

## Registry Design

Add registry entries that support shadcn copy-in:

- `meda-skeleton`
- `meda-empty-state`
- `meda-filter-rail`

The first pass will use one registry entry per primitive. A grouped `meda-foundation-primitives` entry is out of scope until the repo has an established grouped-install convention for registry items.

The registry entries should copy source files and preserve the existing registry utility import pattern. The npm package remains the canonical implementation; registry files should be generated or kept in sync with source according to the existing repo scripts.

## Storybook Design

Add a Storybook foundation/primitives collection so these components are discoverable together instead of scattered across unrelated domains.

Stories:

- `Foundation/Primitives/Skeleton`
  - text lines
  - card placeholder
  - list row placeholder
- `Foundation/Primitives/EmptyState`
  - default
  - panel
  - inline
  - error/action example
- `Foundation/Primitives/FilterRail`
  - dense queue filters
  - search slot
  - grouped controls
  - footer actions

Docs should explain when to import from the package and when to use the shadcn registry copy path.

## Tests

Add focused unit coverage:

- Root exports expose `Skeleton`, `EmptyState`, and `FilterRail`.
- `Skeleton` renders `data-slot="skeleton"`, token classes, and default hidden semantics.
- `EmptyState` renders title, description, icon, action, and each variant.
- `FilterRail` renders header, description, search, actions, groups, children, and footer.
- `FilterRail.Group` renders its label and contents without owning filter state.
- Registry validation passes.
- Package build emits root JavaScript and type exports.

Full verification should include:

- targeted primitive tests
- `pnpm test`
- `pnpm lint`
- `pnpm registry:validate`
- `pnpm build`
- `git diff --check`

## Release Notes

This is an additive minor changeset for `@medalsocial/meda`.

Suggested changeset summary:

```md
Add foundation primitives for loading, empty, and filtering surfaces.

This release adds `Skeleton`, `EmptyState`, and `FilterRail` as root package exports and shadcn-compatible registry entries. These primitives standardize common Meda loading, zero-state, and dense filtering surfaces while leaving application state and query logic with consumers.
```

## Open Follow-Ups

The remaining issue #102 candidates should stay separate:

- Banner priority and stacking model.
- Route-aware command auto-registration.
- Mobile gesture primitives.
- IconRail pinned-bottom persistence.
- Any deeper global/local panel view API beyond the provider model already present in the current branch.
