# Foundation Primitives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `Skeleton`, `EmptyState`, and `FilterRail` as Meda root exports plus shadcn-compatible registry entries and Storybook foundation coverage.

**Architecture:** Add focused source files under `src/primitives/` and re-export them from `src/index.ts`. Keep these primitives stateless and token-driven: `Skeleton` owns loading shape, `EmptyState` owns empty/error surface layout, and `FilterRail` owns dense filter rail structure while consumers own filter state. Registry JSON entries copy local shadcn-style component source, while Storybook groups the primitives under `Foundation/Primitives/*`.

**Tech Stack:** React 19, TypeScript, Tailwind token classes, lucide-react icon types, Vitest + Testing Library, Storybook React Vite, shadcn registry JSON, Changesets.

---

## File Structure

- Create `src/primitives/skeleton.tsx`: small shadcn-shaped loading placeholder.
- Create `src/primitives/empty-state.tsx`: empty/error surface with variants and icon/action slots.
- Create `src/primitives/filter-rail.tsx`: stateless rail shell plus `FilterRail.Group`.
- Create `src/primitives/index.ts`: primitive barrel.
- Create `src/primitives/skeleton.test.tsx`: focused Skeleton behavior tests.
- Create `src/primitives/empty-state.test.tsx`: EmptyState behavior and variant tests.
- Create `src/primitives/filter-rail.test.tsx`: FilterRail structure and group tests.
- Create `src/primitives/root-exports.test.ts`: root package export regression test.
- Create `src/primitives/foundation-primitives.stories.tsx`: Storybook collection under `Foundation/Primitives/*`.
- Modify `src/index.ts`: root-export primitives.
- Modify `README.md`: document package and registry adoption.
- Modify `src/__stories__/docs/Adoption.mdx`: document foundation primitives in Storybook docs.
- Modify `registry/registry.json`: add registry index entries.
- Create `registry/r/meda-skeleton.json`: shadcn-compatible registry item.
- Create `registry/r/meda-empty-state.json`: shadcn-compatible registry item.
- Create `registry/r/meda-filter-rail.json`: shadcn-compatible registry item.
- Modify `registry/scripts/validate-registry.mjs`: include new registry item files.
- Modify `registry/README.md`: list new registry items.
- Create `.changeset/foundation-primitives.md`: minor release note.
- Generated after build: `dist/index.js`, `dist/index.d.ts`, and any `dist/primitives/*` files emitted by the build.

## Preflight

- [ ] **Step 1: Confirm branch and unrelated changes**

Run:

```bash
git --git-dir=/Users/ali/Documents/Code/medal-monorepo/.git/modules/open/meda --work-tree=/Users/ali/Documents/Code/medal-monorepo/open/meda status --short --branch
```

Expected: note any existing staged or unstaged changes. Do not revert them. If unrelated changes are staged, either leave them staged and use `git commit --only <paths>` for this plan's commits, or ask the owner to clear the index before implementation.

- [ ] **Step 2: Read the approved spec**

Run:

```bash
sed -n '1,260p' docs/superpowers/specs/2026-05-01-foundation-primitives-design.md
```

Expected: confirms the scope is only `Skeleton`, `EmptyState`, `FilterRail`, root exports, registry entries, docs, Storybook foundation collection, tests, changeset, and build output.

---

### Task 1: Add Skeleton Primitive

**Files:**
- Create: `src/primitives/skeleton.test.tsx`
- Create: `src/primitives/skeleton.tsx`
- Create: `src/primitives/index.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Write failing Skeleton tests**

Create `src/primitives/skeleton.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton } from './skeleton.js';

describe('Skeleton', () => {
  it('renders a hidden loading placeholder with Meda token classes', () => {
    render(<Skeleton data-testid="loading-title" className="h-4 w-32" />);

    const skeleton = screen.getByTestId('loading-title');
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-muted');
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('w-32');
  });

  it('allows consumers to override aria-hidden when the placeholder has an accessible role', () => {
    render(<Skeleton aria-hidden={false} role="status" aria-label="Loading account" />);

    const skeleton = screen.getByRole('status', { name: 'Loading account' });
    expect(skeleton).toHaveAttribute('aria-hidden', 'false');
  });
});
```

- [ ] **Step 2: Run Skeleton tests and verify failure**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/skeleton.test.tsx
```

Expected: fails because `src/primitives/skeleton.tsx` does not exist.

- [ ] **Step 3: Implement Skeleton and primitive barrel**

Create `src/primitives/skeleton.tsx`:

```tsx
'use client';

import type { ComponentProps } from 'react';
import { cn } from '../lib/utils.js';

export type SkeletonProps = ComponentProps<'div'>;

export function Skeleton({ className, 'aria-hidden': ariaHidden = true, ...props }: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden={ariaHidden}
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
}
```

Create `src/primitives/index.ts`:

```ts
export type { SkeletonProps } from './skeleton.js';
export { Skeleton } from './skeleton.js';
```

Modify `src/index.ts` to include the primitive barrel:

```ts
export * from './auth/public.js';
export * from './brand/public.js';
export * from './chat/public.js';
export * from './marketing/public.js';
export * from './panel/public.js';
export * from './primitives/index.js';
export * from './shell/index.js'; // v2 surface
export * from './theme/index.js';
export * from './timeline/public.js';
```

- [ ] **Step 4: Run Skeleton tests and verify pass**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/skeleton.test.tsx
```

Expected: all tests in `src/primitives/skeleton.test.tsx` pass.

- [ ] **Step 5: Commit Skeleton primitive**

Run:

```bash
git add src/primitives/skeleton.tsx src/primitives/skeleton.test.tsx src/primitives/index.ts src/index.ts
git commit -m "Add Skeleton primitive"
```

If unrelated files are staged, use:

```bash
git commit --only src/primitives/skeleton.tsx src/primitives/skeleton.test.tsx src/primitives/index.ts src/index.ts -m "Add Skeleton primitive"
```

---

### Task 2: Add EmptyState Primitive

**Files:**
- Create: `src/primitives/empty-state.test.tsx`
- Create: `src/primitives/empty-state.tsx`
- Modify: `src/primitives/index.ts`

- [ ] **Step 1: Write failing EmptyState tests**

Create `src/primitives/empty-state.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './empty-state.js';

describe('EmptyState', () => {
  it('renders title, description, Lucide icon, and action', () => {
    render(
      <EmptyState
        icon={Inbox}
        title="No messages"
        description="New conversations will appear here."
        action={<button type="button">Compose</button>}
      />
    );

    expect(screen.getByRole('heading', { name: 'No messages' })).toBeInTheDocument();
    expect(screen.getByText('New conversations will appear here.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compose' })).toBeInTheDocument();
    expect(screen.getByTestId('empty-state-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders a custom icon node', () => {
    render(
      <EmptyState
        icon={<span data-testid="custom-icon">!</span>}
        title="Could not load records"
        description="Refresh the page and try again."
      />
    );

    expect(screen.getByTestId('custom-icon')).toHaveTextContent('!');
    expect(screen.getByRole('heading', { name: 'Could not load records' })).toBeInTheDocument();
  });

  it('applies variant classes for default, panel, and inline density', () => {
    const { rerender } = render(<EmptyState title="Default empty" data-testid="state" />);
    expect(screen.getByTestId('state')).toHaveAttribute('data-variant', 'default');
    expect(screen.getByTestId('state')).toHaveClass('py-16');

    rerender(<EmptyState title="Panel empty" variant="panel" data-testid="state" />);
    expect(screen.getByTestId('state')).toHaveAttribute('data-variant', 'panel');
    expect(screen.getByTestId('state')).toHaveClass('py-10');

    rerender(<EmptyState title="Inline empty" variant="inline" data-testid="state" />);
    expect(screen.getByTestId('state')).toHaveAttribute('data-variant', 'inline');
    expect(screen.getByTestId('state')).toHaveClass('py-6');
  });
});
```

- [ ] **Step 2: Run EmptyState tests and verify failure**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/empty-state.test.tsx
```

Expected: fails because `src/primitives/empty-state.tsx` does not exist.

- [ ] **Step 3: Implement EmptyState**

Create `src/primitives/empty-state.tsx`:

```tsx
'use client';

import type { LucideIcon } from 'lucide-react';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../lib/utils.js';

export type EmptyStateVariant = 'default' | 'panel' | 'inline';

export interface EmptyStateProps extends ComponentPropsWithoutRef<'div'> {
  icon?: LucideIcon | ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: EmptyStateVariant;
}

function renderIcon(icon: EmptyStateProps['icon']) {
  if (!icon) return null;
  if (typeof icon === 'function') {
    const Icon = icon;
    return <Icon data-testid="empty-state-icon" className="size-10" aria-hidden="true" />;
  }
  return (
    <span data-testid="empty-state-icon" aria-hidden="true" className="inline-flex">
      {icon}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      data-variant={variant}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'default' && 'px-6 py-16',
        variant === 'panel' && 'px-4 py-10',
        variant === 'inline' && 'px-3 py-6',
        className
      )}
      {...props}
    >
      {icon ? (
        <div
          data-slot="empty-state-icon"
          className={cn(
            'mb-4 inline-flex items-center justify-center rounded-md text-muted-foreground',
            variant === 'inline' ? 'size-9' : 'size-12'
          )}
        >
          {renderIcon(icon)}
        </div>
      ) : null}
      <h3
        data-slot="empty-state-title"
        className={cn(
          'font-semibold text-foreground',
          variant === 'default' && 'text-lg',
          variant === 'panel' && 'text-base',
          variant === 'inline' && 'text-sm'
        )}
      >
        {title}
      </h3>
      {description ? (
        <p
          data-slot="empty-state-description"
          className={cn(
            'mt-1 max-w-sm text-muted-foreground',
            variant === 'inline' ? 'text-xs' : 'text-sm'
          )}
        >
          {description}
        </p>
      ) : null}
      {action ? (
        <div data-slot="empty-state-action" className="mt-5">
          {action}
        </div>
      ) : null}
    </div>
  );
}
```

Modify `src/primitives/index.ts`:

```ts
export type { EmptyStateProps, EmptyStateVariant } from './empty-state.js';
export { EmptyState } from './empty-state.js';
export type { SkeletonProps } from './skeleton.js';
export { Skeleton } from './skeleton.js';
```

- [ ] **Step 4: Run EmptyState tests and verify pass**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/empty-state.test.tsx
```

Expected: all tests in `src/primitives/empty-state.test.tsx` pass.

- [ ] **Step 5: Run existing primitive tests**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/skeleton.test.tsx src/primitives/empty-state.test.tsx
```

Expected: Skeleton and EmptyState tests pass.

- [ ] **Step 6: Commit EmptyState primitive**

Run:

```bash
git add src/primitives/empty-state.tsx src/primitives/empty-state.test.tsx src/primitives/index.ts
git commit -m "Add EmptyState primitive"
```

If unrelated files are staged, use:

```bash
git commit --only src/primitives/empty-state.tsx src/primitives/empty-state.test.tsx src/primitives/index.ts -m "Add EmptyState primitive"
```

---

### Task 3: Add FilterRail Primitive

**Files:**
- Create: `src/primitives/filter-rail.test.tsx`
- Create: `src/primitives/filter-rail.tsx`
- Create: `src/primitives/root-exports.test.ts`
- Modify: `src/primitives/index.ts`

- [ ] **Step 1: Write failing FilterRail tests**

Create `src/primitives/filter-rail.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FilterRail } from './filter-rail.js';

describe('FilterRail', () => {
  it('renders header, description, search, actions, children, and footer', () => {
    render(
      <FilterRail
        title="Filters"
        description="Refine the queue"
        search={<input type="search" aria-label="Search filters" />}
        actions={<button type="button">Clear</button>}
        footer={<button type="button">Apply</button>}
      >
        <FilterRail.Group title="Status" description="Conversation state">
          <label>
            <input type="checkbox" /> Open
          </label>
        </FilterRail.Group>
      </FilterRail>
    );

    expect(screen.getByRole('complementary', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Refine the queue')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Search filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByText('Conversation state')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Open' })).toBeInTheDocument();
  });

  it('supports an explicit aria-label without a visible title', () => {
    render(
      <FilterRail aria-label="Queue filters">
        <FilterRail.Group title="Priority">
          <button type="button">High</button>
        </FilterRail.Group>
      </FilterRail>
    );

    expect(screen.getByRole('complementary', { name: 'Queue filters' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Queue filters' })).not.toBeInTheDocument();
  });

  it('applies custom classes to the rail and group', () => {
    render(
      <FilterRail title="Filters" className="custom-rail">
        <FilterRail.Group title="Team" className="custom-group">
          <button type="button">Support</button>
        </FilterRail.Group>
      </FilterRail>
    );

    expect(screen.getByRole('complementary', { name: 'Filters' })).toHaveClass('custom-rail');
    expect(screen.getByRole('group', { name: 'Team' })).toHaveClass('custom-group');
  });
});
```

- [ ] **Step 2: Run FilterRail tests and verify failure**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/filter-rail.test.tsx
```

Expected: fails because `src/primitives/filter-rail.tsx` does not exist.

- [ ] **Step 3: Implement FilterRail**

Create `src/primitives/filter-rail.tsx`:

```tsx
'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '../lib/utils.js';

export interface FilterRailProps extends ComponentPropsWithoutRef<'aside'> {
  title?: ReactNode;
  description?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export interface FilterRailGroupProps extends ComponentPropsWithoutRef<'fieldset'> {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}

function FilterRailGroup({
  title,
  description,
  children,
  className,
  ...props
}: FilterRailGroupProps) {
  return (
    <fieldset
      data-slot="filter-rail-group"
      className={cn('space-y-2 border-0 p-0', className)}
      {...props}
    >
      {title ? (
        <legend data-slot="filter-rail-group-title" className="text-xs font-semibold text-foreground">
          {title}
        </legend>
      ) : null}
      {description ? (
        <p data-slot="filter-rail-group-description" className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div data-slot="filter-rail-group-content" className="space-y-1.5">
        {children}
      </div>
    </fieldset>
  );
}

function FilterRailRoot({
  title,
  description,
  search,
  actions,
  footer,
  children,
  className,
  'aria-label': ariaLabel,
  ...props
}: FilterRailProps) {
  const label = ariaLabel ?? (typeof title === 'string' ? title : undefined);

  return (
    <aside
      data-slot="filter-rail"
      aria-label={label}
      className={cn(
        'flex min-h-0 w-full flex-col border-border bg-card text-card-foreground',
        className
      )}
      {...props}
    >
      {title || description || actions ? (
        <div
          data-slot="filter-rail-header"
          className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3"
        >
          <div className="min-w-0">
            {title ? (
              <h2 data-slot="filter-rail-title" className="text-sm font-semibold text-foreground">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p data-slot="filter-rail-description" className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div data-slot="filter-rail-actions" className="shrink-0">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      {search ? (
        <div data-slot="filter-rail-search" className="shrink-0 border-b border-border p-3">
          {search}
        </div>
      ) : null}
      <div data-slot="filter-rail-content" className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
        {children}
      </div>
      {footer ? (
        <div data-slot="filter-rail-footer" className="shrink-0 border-t border-border p-3">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export const FilterRail = Object.assign(FilterRailRoot, {
  Group: FilterRailGroup,
});
```

Modify `src/primitives/index.ts`:

```ts
export type { EmptyStateProps, EmptyStateVariant } from './empty-state.js';
export { EmptyState } from './empty-state.js';
export type { FilterRailGroupProps, FilterRailProps } from './filter-rail.js';
export { FilterRail } from './filter-rail.js';
export type { SkeletonProps } from './skeleton.js';
export { Skeleton } from './skeleton.js';
```

- [ ] **Step 4: Run FilterRail tests and verify pass**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/filter-rail.test.tsx
```

Expected: all tests in `src/primitives/filter-rail.test.tsx` pass.

- [ ] **Step 5: Run all primitive tests**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/skeleton.test.tsx src/primitives/empty-state.test.tsx src/primitives/filter-rail.test.tsx
```

Expected: all primitive tests pass.

- [ ] **Step 6: Add root export regression test**

Create `src/primitives/root-exports.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { EmptyState, FilterRail, Skeleton } from '../index.js';

describe('foundation primitive root exports', () => {
  it('exports Skeleton, EmptyState, and FilterRail from the package root', () => {
    expect(Skeleton).toBeTypeOf('function');
    expect(EmptyState).toBeTypeOf('function');
    expect(FilterRail).toBeTypeOf('function');
    expect(FilterRail.Group).toBeTypeOf('function');
  });
});
```

- [ ] **Step 7: Run root export and primitive tests**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/skeleton.test.tsx src/primitives/empty-state.test.tsx src/primitives/filter-rail.test.tsx src/primitives/root-exports.test.ts
```

Expected: all primitive and root export tests pass.

- [ ] **Step 8: Commit FilterRail primitive and root export test**

Run:

```bash
git add src/primitives/filter-rail.tsx src/primitives/filter-rail.test.tsx src/primitives/root-exports.test.ts src/primitives/index.ts
git commit -m "Add FilterRail primitive"
```

If unrelated files are staged, use:

```bash
git commit --only src/primitives/filter-rail.tsx src/primitives/filter-rail.test.tsx src/primitives/root-exports.test.ts src/primitives/index.ts -m "Add FilterRail primitive"
```

---

### Task 4: Add Storybook Foundation Primitive Collection

**Files:**
- Create: `src/primitives/foundation-primitives.stories.tsx`

- [ ] **Step 1: Create Storybook stories**

Create `src/primitives/foundation-primitives.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertTriangle, Inbox } from 'lucide-react';
import { EmptyState } from './empty-state.js';
import { FilterRail } from './filter-rail.js';
import { Skeleton } from './skeleton.js';

const meta = {
  title: 'Foundation/Primitives',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const SkeletonStates: Story = {
  name: 'Skeleton',
  render: () => (
    <div className="grid max-w-4xl gap-6 md:grid-cols-3">
      <section className="space-y-3 rounded-md border border-border p-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </section>
      <section className="space-y-3 rounded-md border border-border p-4">
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </section>
      <section className="space-y-2 rounded-md border border-border p-4">
        {['one', 'two', 'three'].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </section>
    </div>
  ),
};

export const EmptyStates: Story = {
  name: 'EmptyState',
  render: () => (
    <div className="grid max-w-5xl gap-6 md:grid-cols-3">
      <div className="rounded-md border border-border">
        <EmptyState
          icon={Inbox}
          title="No messages"
          description="New conversations will appear here."
          action={<button className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Compose</button>}
        />
      </div>
      <div className="rounded-md border border-border">
        <EmptyState
          variant="panel"
          icon={AlertTriangle}
          title="Could not load"
          description="Refresh the panel and try again."
          action={<button className="rounded-md border border-border px-3 py-2 text-sm">Retry</button>}
        />
      </div>
      <div className="rounded-md border border-border">
        <EmptyState variant="inline" title="No filters selected" description="Choose filters to narrow the list." />
      </div>
    </div>
  ),
};

export const FilterRailStates: Story = {
  name: 'FilterRail',
  render: () => (
    <div className="h-[520px] max-w-80 overflow-hidden rounded-md border border-border">
      <FilterRail
        title="Filters"
        description="Refine the queue"
        search={
          <input
            type="search"
            aria-label="Search filters"
            placeholder="Search filters"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        }
        actions={<button className="text-xs font-medium text-muted-foreground">Reset</button>}
        footer={<button className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">Apply filters</button>}
      >
        <FilterRail.Group title="Status" description="Conversation state">
          {['Open', 'Waiting', 'Resolved'].map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" /> {label}
            </label>
          ))}
        </FilterRail.Group>
        <FilterRail.Group title="Priority">
          {['High', 'Medium', 'Low'].map((label) => (
            <label key={label} className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" /> {label}
            </label>
          ))}
        </FilterRail.Group>
      </FilterRail>
    </div>
  ),
};
```

- [ ] **Step 2: Run story checker**

Run:

```bash
pnpm check:stories
```

Expected: command exits `0`. Existing soft-cap warnings are acceptable only if the command exits `0`.

- [ ] **Step 3: Commit Storybook foundation collection**

Run:

```bash
git add src/primitives/foundation-primitives.stories.tsx
git commit -m "Add foundation primitive stories"
```

If unrelated files are staged, use:

```bash
git commit --only src/primitives/foundation-primitives.stories.tsx -m "Add foundation primitive stories"
```

---

### Task 5: Add Registry Entries

**Files:**
- Modify: `registry/registry.json`
- Create: `registry/r/meda-skeleton.json`
- Create: `registry/r/meda-empty-state.json`
- Create: `registry/r/meda-filter-rail.json`
- Modify: `registry/scripts/validate-registry.mjs`
- Modify: `registry/README.md`

- [ ] **Step 1: Add registry item JSON files**

Create `registry/r/meda-skeleton.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "meda-skeleton",
  "type": "registry:component",
  "title": "Meda Skeleton",
  "description": "Install the Meda loading placeholder primitive.",
  "dependencies": [],
  "files": [
    {
      "path": "registry/meda/meda-skeleton/skeleton.tsx",
      "content": "import type { ComponentProps } from 'react'\nimport { cn } from '@/lib/utils'\n\nexport type SkeletonProps = ComponentProps<'div'>\n\nexport function Skeleton({ className, 'aria-hidden': ariaHidden = true, ...props }: SkeletonProps) {\n  return (\n    <div\n      data-slot=\"skeleton\"\n      aria-hidden={ariaHidden}\n      className={cn('animate-pulse rounded-md bg-muted', className)}\n      {...props}\n    />\n  )\n}\n",
      "type": "registry:component",
      "target": "components/meda/skeleton.tsx"
    }
  ]
}
```

Create `registry/r/meda-empty-state.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "meda-empty-state",
  "type": "registry:component",
  "title": "Meda Empty State",
  "description": "Install the Meda empty, zero, and error state primitive.",
  "dependencies": ["lucide-react"],
  "files": [
    {
      "path": "registry/meda/meda-empty-state/empty-state.tsx",
      "content": "import type { LucideIcon } from 'lucide-react'\nimport type { ComponentPropsWithoutRef, ReactNode } from 'react'\nimport { cn } from '@/lib/utils'\n\nexport type EmptyStateVariant = 'default' | 'panel' | 'inline'\n\nexport interface EmptyStateProps extends ComponentPropsWithoutRef<'div'> {\n  icon?: LucideIcon | ReactNode\n  title: ReactNode\n  description?: ReactNode\n  action?: ReactNode\n  variant?: EmptyStateVariant\n}\n\nfunction renderIcon(icon: EmptyStateProps['icon']) {\n  if (!icon) return null\n  if (typeof icon === 'function') {\n    const Icon = icon\n    return <Icon data-testid=\"empty-state-icon\" className=\"size-10\" aria-hidden=\"true\" />\n  }\n  return (\n    <span data-testid=\"empty-state-icon\" aria-hidden=\"true\" className=\"inline-flex\">\n      {icon}\n    </span>\n  )\n}\n\nexport function EmptyState({ icon, title, description, action, variant = 'default', className, ...props }: EmptyStateProps) {\n  return (\n    <div\n      data-slot=\"empty-state\"\n      data-variant={variant}\n      className={cn(\n        'flex flex-col items-center justify-center text-center',\n        variant === 'default' && 'px-6 py-16',\n        variant === 'panel' && 'px-4 py-10',\n        variant === 'inline' && 'px-3 py-6',\n        className\n      )}\n      {...props}\n    >\n      {icon ? (\n        <div\n          data-slot=\"empty-state-icon\"\n          className={cn(\n            'mb-4 inline-flex items-center justify-center rounded-md text-muted-foreground',\n            variant === 'inline' ? 'size-9' : 'size-12'\n          )}\n        >\n          {renderIcon(icon)}\n        </div>\n      ) : null}\n      <h3\n        data-slot=\"empty-state-title\"\n        className={cn(\n          'font-semibold text-foreground',\n          variant === 'default' && 'text-lg',\n          variant === 'panel' && 'text-base',\n          variant === 'inline' && 'text-sm'\n        )}\n      >\n        {title}\n      </h3>\n      {description ? (\n        <p\n          data-slot=\"empty-state-description\"\n          className={cn('mt-1 max-w-sm text-muted-foreground', variant === 'inline' ? 'text-xs' : 'text-sm')}\n        >\n          {description}\n        </p>\n      ) : null}\n      {action ? <div data-slot=\"empty-state-action\" className=\"mt-5\">{action}</div> : null}\n    </div>\n  )\n}\n",
      "type": "registry:component",
      "target": "components/meda/empty-state.tsx"
    }
  ]
}
```

Create `registry/r/meda-filter-rail.json`:

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "meda-filter-rail",
  "type": "registry:component",
  "title": "Meda Filter Rail",
  "description": "Install the Meda dense filter rail primitive.",
  "dependencies": [],
  "files": [
    {
      "path": "registry/meda/meda-filter-rail/filter-rail.tsx",
      "content": "import type { ComponentPropsWithoutRef, ReactNode } from 'react'\nimport { cn } from '@/lib/utils'\n\nexport interface FilterRailProps extends ComponentPropsWithoutRef<'aside'> {\n  title?: ReactNode\n  description?: ReactNode\n  search?: ReactNode\n  actions?: ReactNode\n  footer?: ReactNode\n  children?: ReactNode\n}\n\nexport interface FilterRailGroupProps extends ComponentPropsWithoutRef<'fieldset'> {\n  title?: ReactNode\n  description?: ReactNode\n  children?: ReactNode\n}\n\nfunction FilterRailGroup({ title, description, children, className, ...props }: FilterRailGroupProps) {\n  return (\n    <fieldset data-slot=\"filter-rail-group\" className={cn('space-y-2 border-0 p-0', className)} {...props}>\n      {title ? <legend data-slot=\"filter-rail-group-title\" className=\"text-xs font-semibold text-foreground\">{title}</legend> : null}\n      {description ? <p data-slot=\"filter-rail-group-description\" className=\"text-xs text-muted-foreground\">{description}</p> : null}\n      <div data-slot=\"filter-rail-group-content\" className=\"space-y-1.5\">{children}</div>\n    </fieldset>\n  )\n}\n\nfunction FilterRailRoot({ title, description, search, actions, footer, children, className, 'aria-label': ariaLabel, ...props }: FilterRailProps) {\n  const label = ariaLabel ?? (typeof title === 'string' ? title : undefined)\n\n  return (\n    <aside\n      data-slot=\"filter-rail\"\n      aria-label={label}\n      className={cn('flex min-h-0 w-full flex-col border-border bg-card text-card-foreground', className)}\n      {...props}\n    >\n      {title || description || actions ? (\n        <div data-slot=\"filter-rail-header\" className=\"flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-3\">\n          <div className=\"min-w-0\">\n            {title ? <h2 data-slot=\"filter-rail-title\" className=\"text-sm font-semibold text-foreground\">{title}</h2> : null}\n            {description ? <p data-slot=\"filter-rail-description\" className=\"mt-0.5 text-xs text-muted-foreground\">{description}</p> : null}\n          </div>\n          {actions ? <div data-slot=\"filter-rail-actions\" className=\"shrink-0\">{actions}</div> : null}\n        </div>\n      ) : null}\n      {search ? <div data-slot=\"filter-rail-search\" className=\"shrink-0 border-b border-border p-3\">{search}</div> : null}\n      <div data-slot=\"filter-rail-content\" className=\"min-h-0 flex-1 space-y-5 overflow-y-auto p-4\">{children}</div>\n      {footer ? <div data-slot=\"filter-rail-footer\" className=\"shrink-0 border-t border-border p-3\">{footer}</div> : null}\n    </aside>\n  )\n}\n\nexport const FilterRail = Object.assign(FilterRailRoot, { Group: FilterRailGroup })\n",
      "type": "registry:component",
      "target": "components/meda/filter-rail.tsx"
    }
  ]
}
```

- [ ] **Step 2: Add items to registry index**

Modify `registry/registry.json` by appending these objects to the `items` array after `meda-workbench-layout` and before `meda-next-app-shell`:

```json
    {
      "$schema": "https://ui.shadcn.com/schema/registry-item.json",
      "name": "meda-skeleton",
      "type": "registry:component",
      "title": "Meda Skeleton",
      "description": "Install the Meda loading placeholder primitive.",
      "dependencies": [],
      "files": [
        {
          "path": "registry/meda/meda-skeleton/skeleton.tsx",
          "type": "registry:component",
          "target": "components/meda/skeleton.tsx"
        }
      ]
    },
    {
      "$schema": "https://ui.shadcn.com/schema/registry-item.json",
      "name": "meda-empty-state",
      "type": "registry:component",
      "title": "Meda Empty State",
      "description": "Install the Meda empty, zero, and error state primitive.",
      "dependencies": ["lucide-react"],
      "files": [
        {
          "path": "registry/meda/meda-empty-state/empty-state.tsx",
          "type": "registry:component",
          "target": "components/meda/empty-state.tsx"
        }
      ]
    },
    {
      "$schema": "https://ui.shadcn.com/schema/registry-item.json",
      "name": "meda-filter-rail",
      "type": "registry:component",
      "title": "Meda Filter Rail",
      "description": "Install the Meda dense filter rail primitive.",
      "dependencies": [],
      "files": [
        {
          "path": "registry/meda/meda-filter-rail/filter-rail.tsx",
          "type": "registry:component",
          "target": "components/meda/filter-rail.tsx"
        }
      ]
    },
```

- [ ] **Step 3: Update registry validator file list**

Modify the `files` array in `registry/scripts/validate-registry.mjs` to include the new registry item JSON files:

```js
const files = [
  'registry.json',
  'r/meda-shell.json',
  'r/meda-shell-state.json',
  'r/meda-workbench-layout.json',
  'r/meda-skeleton.json',
  'r/meda-empty-state.json',
  'r/meda-filter-rail.json',
  'r/meda-next-app-shell.json',
  'r/meda-marketing.json',
  'r/meda-marketing-callout.json',
  'r/meda-marketing-contact.json',
  'r/meda-marketing-lead-magnet.json',
];
```

- [ ] **Step 4: Update registry README**

Modify `registry/README.md` so the current item list includes:

```md
- `meda-skeleton`
- `meda-empty-state`
- `meda-filter-rail`
```

Place those entries after `meda-workbench-layout` and before `meda-next-app-shell`.

- [ ] **Step 5: Validate registry**

Run:

```bash
pnpm registry:validate
```

Expected: exits `0` and prints `Validated 12 Meda registry JSON files.`

- [ ] **Step 6: Commit registry entries**

Run:

```bash
git add registry/registry.json registry/r/meda-skeleton.json registry/r/meda-empty-state.json registry/r/meda-filter-rail.json registry/scripts/validate-registry.mjs registry/README.md
git commit -m "Add foundation primitive registry entries"
```

If unrelated files are staged, use:

```bash
git commit --only registry/registry.json registry/r/meda-skeleton.json registry/r/meda-empty-state.json registry/r/meda-filter-rail.json registry/scripts/validate-registry.mjs registry/README.md -m "Add foundation primitive registry entries"
```

---

### Task 6: Add Docs And Changeset

**Files:**
- Modify: `README.md`
- Modify: `src/__stories__/docs/Adoption.mdx`
- Create: `.changeset/foundation-primitives.md`

- [ ] **Step 1: Update README usage docs**

In `README.md`, after the workspace shell composition example and before the app-scoped brand tokens section, add:

````md
## Foundation primitives

Meda includes small foundation primitives for repeated loading, empty, and filtering surfaces:

```tsx
import { EmptyState, FilterRail, Skeleton } from '@medalsocial/meda';
```

`Skeleton` mirrors shadcn's simple loading placeholder shape. `EmptyState` standardizes zero/error states across panels and content areas. `FilterRail` provides a dense filter surface while leaving selected values, URL syncing, and query logic in the consuming app.

The same primitives are available from the shadcn-compatible registry when an app wants local source ownership:

```bash
npx shadcn add https://meda.medalsocial.com/r/meda-skeleton.json
npx shadcn add https://meda.medalsocial.com/r/meda-empty-state.json
npx shadcn add https://meda.medalsocial.com/r/meda-filter-rail.json
```
````

- [ ] **Step 2: Update Storybook adoption docs**

In `src/__stories__/docs/Adoption.mdx`, add this section after the introductory three-layer adoption list and before `## Next.js links`:

````mdx
## Foundation primitives

Use root package imports for reusable loading, empty, and filtering surfaces:

```tsx
import { EmptyState, FilterRail, Skeleton } from '@medalsocial/meda';
```

These primitives are also exposed as copyable registry items:

```bash
npx shadcn add https://meda.medalsocial.com/r/meda-skeleton.json
npx shadcn add https://meda.medalsocial.com/r/meda-empty-state.json
npx shadcn add https://meda.medalsocial.com/r/meda-filter-rail.json
```

Storybook groups the visual examples under `Foundation/Primitives`.
````

- [ ] **Step 3: Add minor changeset**

Create `.changeset/foundation-primitives.md`:

```md
---
"@medalsocial/meda": minor
---

Add foundation primitives for loading, empty, and filtering surfaces.

This release adds `Skeleton`, `EmptyState`, and `FilterRail` as root package exports and shadcn-compatible registry entries. These primitives standardize common Meda loading, zero-state, and dense filtering surfaces while leaving application state and query logic with consumers.
```

- [ ] **Step 4: Run docs-related checks**

Run:

```bash
pnpm check:stories
pnpm registry:validate
```

Expected: both commands exit `0`. Existing Storybook soft-cap warnings are acceptable only if the command exits `0`.

- [ ] **Step 5: Commit docs and changeset**

Run:

```bash
git add README.md src/__stories__/docs/Adoption.mdx .changeset/foundation-primitives.md
git commit -m "Document foundation primitives"
```

If unrelated files are staged, use:

```bash
git commit --only README.md src/__stories__/docs/Adoption.mdx .changeset/foundation-primitives.md -m "Document foundation primitives"
```

---

### Task 7: Build, Verify, And Commit Dist

**Files:**
- Modify generated files under `dist/`

- [ ] **Step 1: Run targeted primitive suite**

Run:

```bash
pnpm exec vitest run --environment jsdom src/primitives/skeleton.test.tsx src/primitives/empty-state.test.tsx src/primitives/filter-rail.test.tsx src/primitives/root-exports.test.ts
```

Expected: all primitive tests pass.

- [ ] **Step 2: Build package output**

Run:

```bash
pnpm build
```

Expected: exits `0`. TypeScript emits `dist/primitives/*` and updates root `dist/index.js` / `dist/index.d.ts`.

- [ ] **Step 3: Inspect generated output**

Run:

```bash
git status --short
git diff --stat
```

Expected: source/docs/registry/changeset changes are already committed. Remaining unstaged changes should be generated `dist/` files only, plus any unrelated pre-existing work that was present before this plan.

- [ ] **Step 4: Verify root exports from source and dist**

Run:

```bash
rg "Skeleton|EmptyState|FilterRail" src/index.ts dist/index.d.ts dist/index.js
```

Expected: `src/index.ts`, `dist/index.d.ts`, and `dist/index.js` expose the primitive exports.

- [ ] **Step 5: Run full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm registry:validate
pnpm check:stories
pnpm build
git diff --check
```

Expected:

- `pnpm test` passes.
- `pnpm lint` exits `0`; current Biome warnings are acceptable only if the command exits `0`.
- `pnpm registry:validate` exits `0`.
- `pnpm check:stories` exits `0`; current soft-cap warnings are acceptable only if the command exits `0`.
- `pnpm build` exits `0`.
- `git diff --check` exits `0`.

- [ ] **Step 6: Commit generated dist output**

Run:

```bash
git add dist
git commit -m "Regenerate package output for foundation primitives"
```

If unrelated files are staged, use:

```bash
git commit --only dist -m "Regenerate package output for foundation primitives"
```

- [ ] **Step 7: Final status check**

Run:

```bash
git status --short --branch
```

Expected: no uncommitted changes from this plan remain. If unrelated pre-existing changes remain, list them in the final handoff instead of reverting them.

---

## Self-Review Checklist

- Spec coverage:
  - `Skeleton` root primitive: Task 1.
  - `EmptyState` root primitive: Task 2.
  - `FilterRail` root primitive: Task 3.
  - Root export from `@medalsocial/meda`: Task 1, Task 3, and Task 7.
  - Storybook foundation/primitives collection: Task 4.
  - One registry entry per primitive: Task 5.
  - README and Storybook adoption docs: Task 6.
  - Minor changeset: Task 6.
  - Build/dist verification: Task 7.
- Type consistency:
  - `SkeletonProps`, `EmptyStateProps`, `EmptyStateVariant`, `FilterRailProps`, and `FilterRailGroupProps` are exported from `src/primitives/index.ts`.
  - Root export uses `export * from './primitives/index.js';`.
  - Registry files copy local shadcn-style source and use the same prop/type names as package exports.
- Scope:
  - No banner stacking, route command auto-registration, mobile gestures, or IconRail persistence changes are included.
