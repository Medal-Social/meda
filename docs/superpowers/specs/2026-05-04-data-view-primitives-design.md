# Data View Primitives — Design Spec

**Date:** 2026-05-04
**Branch:** `feat/post-view` (off `dev`)
**Status:** Approved (pending implementation plan)

## Goal

Ship four reusable primitives under `Data Views/` in meda's Storybook taxonomy:

- `<ViewSwitcher>` — segmented toggle between view modes (board / list / calendar / any subset).
- `<DisplaySettings>` — popover panel with sort, group, and display-property controls.
- `useViewConfig` — hook that owns the `ViewConfig` state with optional localStorage and URL-param sync.
- `<GroupedList>` — list with collapsible group headers, plus a `useGroupExpansion` hook.

These are the orchestration layer that a follow-up PR will compose into `<PostsView>` (the post-management surface). Landing them first gives every studio (workflow, email, future AI) reusable building blocks immediately.

## Motivation

Today meda has the display layouts (`KanbanBoard`, `ListRow`, `Calendar`) but nothing that lets a consumer toggle between them or wire up sort/group/display controls. apps/web has a complete `data-view/` subsystem that solves this for posts/deals/ideas — those primitives belong in meda so other consumers (Picasso, pilot-talk, future studios) can adopt the same pattern without re-implementing.

## Non-goals

- `<PostsView>` composite — separate follow-up PR
- `<FilterPopover>` / `<ViewToolbar>` — premature; build when consumers ask
- Convex coupling — all primitives are prop-driven
- Built-in virtualization for `<GroupedList>` — virtualization-ready API but no virtualizer dependency in v1

## Public API

### `<ViewSwitcher>`

```ts
type ViewMode = 'board' | 'list' | 'calendar';

interface ViewSwitcherProps {
  value: ViewMode;
  onChange: (view: ViewMode) => void;
  /** Subset of views to expose. Default: ['board', 'list']. */
  views?: ViewMode[];
  /** Override per-view label. */
  labels?: Partial<Record<ViewMode, string>>;
  /** Override per-view icon. */
  icons?: Partial<Record<ViewMode, ComponentType<{ className?: string }>>>;
  className?: string;
}
```

Renders as a `<ToggleGroup>` styled to match meda's chrome. Pure controlled component — owns no state. Unaware of what each view displays.

### `<DisplaySettings>`

```ts
type SortDirection = 'asc' | 'desc';

interface SortOption {
  key: string;
  label: string;
  direction: SortDirection;
}

interface GroupingOption {
  value: string;
  labelKey: string;
}

interface DisplayProperty {
  key: string;
  label: string;
  defaultEnabled: boolean;
}

interface ViewConfig {
  view: ViewMode;
  sortBy: string;
  sortDirection: SortDirection;
  showEmptyColumns: boolean;
  displayProperties: Record<string, boolean>;
  groupConfig?: { groupBy: string };
}

interface DisplaySettingsProps {
  config: ViewConfig;
  onChange: (config: ViewConfig) => void;
  sortOptions: SortOption[];
  displayProperties: DisplayProperty[];
  groupOptions?: GroupingOption[];
  showBoardOptions?: boolean;
  /** Embeds a `<ViewSwitcher>` at the top of the panel when provided. Omit to hide. */
  viewSwitcherProps?: Pick<ViewSwitcherProps, 'views' | 'labels' | 'icons'>;
  /** Custom trigger element. When omitted, renders a default "Display" button with a Sliders icon. */
  trigger?: ReactNode;
}
```

Renders as a `<Popover>`. The trigger defaults to a "Display" button (Sliders icon) and can be swapped via the `trigger` prop. Emits `ViewConfig` updates immediately on each control change.

### `useViewConfig(options)`

```ts
interface UseViewConfigOptions {
  /** localStorage namespace; defaults to no persistence when omitted. */
  key?: string;
  defaultConfig: ViewConfig;
  /** Sync `view` mode with a URL search param. Default: false. */
  syncWithUrl?: boolean | { paramName?: string };
  /** Persist full config to localStorage. Default: true when `key` is set. */
  persistToStorage?: boolean;
  /** Adapter for storage; defaults to window.localStorage. */
  storage?: { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void };
  /** Adapter for URL params; defaults to window.location + history.replaceState. */
  urlAdapter?: { get(name: string): string | null; set(name: string, value: string): void };
}

interface UseViewConfigReturn {
  config: ViewConfig;
  setConfig: (next: ViewConfig | ((prev: ViewConfig) => ViewConfig)) => void;
  resetConfig: () => void;
}

export function useViewConfig(options: UseViewConfigOptions): UseViewConfigReturn;
export function createDefaultViewConfig(
  displayProperties: DisplayProperty[],
  sortOptions: SortOption[],
  defaultView?: ViewMode,
  defaultGroupConfig?: { groupBy: string },
): ViewConfig;
```

**Decisions confirmed in design discussion:**

- Both localStorage and URL sync are pluggable (any consumer can opt in or supply a custom adapter). meda doesn't depend on a specific router.
- localStorage defaults to enabled when `key` is provided; URL sync defaults to off.

### `<GroupedList>`

```ts
interface GroupHeaderContext<TItem> {
  groupId: string;
  label: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  items: TItem[];
}

interface GroupedListProps<TItem> {
  items: TItem[];
  /**
   * Function deriving the group id and label per item. Confirmed: function form, not string-name.
   * Returning a string is sugar for `{ id: <string>, label: <string> }`.
   */
  groupBy: (item: TItem) => string | { id: string; label?: string };
  renderGroupHeader: (ctx: GroupHeaderContext<TItem>) => ReactNode;
  renderItem: (item: TItem) => ReactNode;
  /** Initial expand state per group, or boolean for all/none. Default: true. */
  defaultExpanded?: boolean | ((groupId: string) => boolean);
  /** Stable order of group ids; defaults to insertion order. */
  groupOrder?: string[];
  /** External control of expanded state — falls back to internal `useGroupExpansion`. */
  expanded?: Set<string>;
  onExpandedChange?: (next: Set<string>) => void;
  className?: string;
}

interface UseGroupExpansionOptions {
  initialExpanded: Set<string> | boolean | ((id: string) => boolean);
  groupIds: string[];
}

interface UseGroupExpansionReturn {
  expanded: Set<string>;
  toggle: (groupId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  isExpanded: (groupId: string) => boolean;
}
```

Wraps the existing `<ListRow>` and renders group headers between sections. Virtualization-ready: items are flat-mapped per group with stable keys, so wrapping in `react-window` later is mechanical.

## Storybook

Every primitive lands under the `Data Views/` taxonomy from PR #132:

| Story | Variants |
|---|---|
| `Data Views/DataView/ViewSwitcher` | `Default`, `WithCalendar`, `CustomLabels`, `IconsOnly` |
| `Data Views/DataView/DisplaySettings` | `Default`, `WithGrouping`, `MinimalProperties`, `EmbeddedViewSwitcher` |
| `Data Views/List/GroupedList` | `Default`, `Collapsed`, `Empty`, `MixedExpansion` |

`useViewConfig` gets an MDX docs page with copy-pasteable code examples; no interactive story (hooks aren't directly storyable).

## Internal architecture

```
src/data-view/
├── view-switcher.tsx        — <ViewSwitcher>
├── view-switcher.test.tsx
├── view-switcher.stories.tsx
├── display-settings.tsx     — <DisplaySettings>
├── display-settings.test.tsx
├── display-settings.stories.tsx
├── use-view-config.ts       — useViewConfig + createDefaultViewConfig
├── use-view-config.test.ts
├── docs/use-view-config.mdx
├── types.ts                 — ViewMode, ViewConfig, SortOption, GroupingOption, DisplayProperty
├── internal/
│   ├── popover-trigger.tsx  — shared "Display" button styling
│   └── url-adapter.ts       — default window-based adapter
├── index.ts                 — subpath barrel
├── public.ts                — re-export for root barrel
└── wcag.test.tsx

src/list/
├── grouped-list.tsx         — <GroupedList>
├── grouped-list.test.tsx
├── grouped-list.stories.tsx
├── use-group-expansion.ts
└── use-group-expansion.test.ts
```

`src/list/index.ts` extends to re-export `GroupedList` and `useGroupExpansion`. `src/data-view/` is a new top-level subpath barrel.

## Bundle

- New subpath `dist/data-view/index.js` — budget **5 kB brotli** (small primitives + hook + the popover dependency already shared with shell).
- `dist/list/index.js` grows by `<GroupedList>` — budget bumped 5 kB → 7 kB brotli.
- Root barrel `dist/index.js` — budget bumped to absorb the new exports; expected ~1 kB increase.

## Tests

Each primitive ships with:

1. **Unit test** asserting the controlled API:
   - props in / events out
   - keyboard navigation (ToggleGroup arrow keys for `<ViewSwitcher>`)
   - controlled vs uncontrolled paths for `<GroupedList>`
2. **WCAG axe test** under `wcag.test.tsx`.
3. **Stories** double as Chromatic visual regression baselines.

`useViewConfig` unit tests cover:

- localStorage round-trip with custom storage adapter
- URL sync round-trip with custom URL adapter
- `resetConfig` reverts to the default
- SSR-safe (no `window` access during initial render)

## Backwards compatibility

Pure additions. No existing exports change. No public API changes to `<KanbanBoard>`, `<ListRow>`, or `<Calendar>`. The new `<GroupedList>` lives alongside `<ListRow>`, not on top of it.

## Changeset

```
---
'@medalsocial/meda': minor
---

Add Data View primitives: <ViewSwitcher>, <DisplaySettings>,
useViewConfig, and <GroupedList>. These are the orchestration layer
for any studio that needs to toggle between board / list / calendar
views with sort / group / display-property controls.

Pluggable storage (localStorage by default, opt-in URL sync) keeps
the primitives router-agnostic. <GroupedList> uses a function-form
groupBy for power; string-name sugar can come later.

Follow-up PR will compose these into <PostsView> under Apps/Post/View.
```

## Out of scope (revisit later)

- `<PostsView>` composite (follow-up PR)
- `Apps/AI` placeholder doc page (bundle with composite PR)
- `<FilterPopover>` and `<ViewToolbar>` (build when adopters need them)
- `<PresetViewTabs>` from apps/web (Linear-style saved-view tabs — adopt later if needed)
- React Server Components flag — primitives use `'use client'` since they own state
