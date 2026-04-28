# Storybook cleanup and AppShell unification — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut Storybook from 120 stories to ~30 by adopting Chromatic viewport modes, baking mobile chrome into `<AppShell variant="auth" | "workspace" | "chat">`, deleting the old hand-composed mobile and auth components, and enforcing the new conventions via a lint script.

**Architecture:** Single PR, single major version bump. No deprecation shim — no consumers are on `@medalsocial/meda` yet. Order: foundation (modes + lint + STORIES.md) → new AppShell variants → story migration + prune → delete legacy components → enable lint as failing → release.

**Tech Stack:** Storybook 10.3, `@storybook/addon-themes`, `@storybook/addon-vitest`, Chromatic 16, Vitest 4 (browser mode), Biome, Husky, Changesets, OIDC publishing.

**Spec:** `docs/superpowers/specs/2026-04-28-storybook-cleanup-design.md`

---

## Phase 1 — Foundation (no behavior change)

These tasks land first and do not change any rendered component. They prepare the rails for the bigger changes.

### Task 1: Add Chromatic viewport modes to preview

**Files:**
- Modify: `.storybook/preview.ts`

- [ ] **Step 1: Add the `chromatic.modes` block to the existing `parameters` object**

Open `.storybook/preview.ts`. Inside `const preview: Preview = { parameters: { ... } }`, add a `chromatic` key alongside the existing `layout`, `backgrounds`, `options`, `controls`, `a11y` keys. The full final shape of `parameters`:

```ts
parameters: {
  layout: 'padded',
  backgrounds: { disable: true },
  chromatic: {
    modes: {
      desktop: { viewport: 1280 },
      ipad:    { viewport: 768  },
      mobile:  { viewport: 390  },
    },
  },
  options: {
    storySort: { /* unchanged */ },
  },
  controls: { /* unchanged */ },
  a11y: { /* unchanged */ },
},
```

- [ ] **Step 2: Run Storybook to verify nothing broke**

Run: `pnpm storybook`
Expected: Storybook starts at port 6006 with no errors. The new modes do not affect Storybook UI; they only take effect during Chromatic snapshotting.

- [ ] **Step 3: Stop the dev server (Ctrl-C) and commit**

```bash
git add .storybook/preview.ts
git commit -m "feat(storybook): add chromatic viewport modes (desktop/ipad/mobile)"
```

---

### Task 2: Create the story-lint script (warn-only mode)

**Files:**
- Create: `scripts/check-stories.mjs`
- Create: `scripts/__tests__/check-stories.test.mjs`
- Create: `scripts/__tests__/fixtures/banned-name.stories.tsx`
- Create: `scripts/__tests__/fixtures/banned-param.stories.tsx`
- Create: `scripts/__tests__/fixtures/over-budget.stories.tsx`
- Create: `scripts/__tests__/fixtures/clean.stories.tsx`

The script statically scans `src/**/*.stories.tsx` (text-based regex/AST is fine — these are simple checks). It prints violations as `path:line: message` and exits 1 if any are found. In this task we add a `--warn` flag so the same code can run as warn-only first; we flip to fail-mode in Phase 6.

- [ ] **Step 1: Write the test fixtures**

Create `scripts/__tests__/fixtures/clean.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = { title: 'Clean', component: () => null } satisfies Meta<unknown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const WithIcon: Story = {};
```

Create `scripts/__tests__/fixtures/banned-name.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = { title: 'Banned', component: () => null } satisfies Meta<unknown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const DarkTheme: Story = {};
export const MobileCombined: Story = {};
```

Create `scripts/__tests__/fixtures/banned-param.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = { title: 'BannedParam', component: () => null } satisfies Meta<unknown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  parameters: { themes: { themeOverride: 'dark' } },
};
export const WithViewport: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
```

Create `scripts/__tests__/fixtures/over-budget.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
const meta = { title: 'OverBudget', component: () => null } satisfies Meta<unknown>;
export default meta;
type Story = StoryObj<typeof meta>;
export const A: Story = {};
export const B: Story = {};
export const C: Story = {};
export const D: Story = {};
export const E: Story = {};
export const F: Story = {};
```

- [ ] **Step 2: Write the failing test**

Create `scripts/__tests__/check-stories.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { checkStoryFile } from '../check-stories.mjs';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => {
  const path = join(here, 'fixtures', name);
  return { path, source: readFileSync(path, 'utf8') };
};

describe('checkStoryFile', () => {
  it('passes a clean file', () => {
    const f = fixture('clean.stories.tsx');
    expect(checkStoryFile(f.path, f.source)).toEqual([]);
  });

  it('rejects banned export names', () => {
    const f = fixture('banned-name.stories.tsx');
    const violations = checkStoryFile(f.path, f.source);
    expect(violations.map((v) => v.message)).toEqual([
      expect.stringContaining('DarkTheme'),
      expect.stringContaining('MobileCombined'),
    ]);
  });

  it('rejects banned parameter shapes', () => {
    const f = fixture('banned-param.stories.tsx');
    const violations = checkStoryFile(f.path, f.source);
    expect(violations.map((v) => v.message)).toEqual([
      expect.stringContaining('themeOverride'),
      expect.stringContaining('defaultViewport'),
    ]);
  });

  it('flags files that exceed the story budget', () => {
    const f = fixture('over-budget.stories.tsx');
    const violations = checkStoryFile(f.path, f.source);
    expect(violations.some((v) => v.message.includes('exceeds budget'))).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm vitest run scripts/__tests__/check-stories.test.mjs`
Expected: FAIL with "Cannot find module '../check-stories.mjs'"

- [ ] **Step 4: Implement the script**

Create `scripts/check-stories.mjs`:

```js
#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const BANNED_NAME_RE = /^(Dark|Light|Mobile|Tablet|Desktop)\w*/;
const EXPORT_RE = /^export const (\w+)\s*:/gm;
const THEME_OVERRIDE_RE = /themes\s*:\s*\{[^}]*themeOverride/;
const DEFAULT_VIEWPORT_RE = /viewport\s*:\s*\{[^}]*defaultViewport/;
const BUDGET_FAIL = 5;
const BUDGET_WARN = 3;

export function checkStoryFile(path, source) {
  const violations = [];
  const exports = [];
  const lines = source.split('\n');

  // Collect export names with line numbers
  let m;
  EXPORT_RE.lastIndex = 0;
  while ((m = EXPORT_RE.exec(source)) !== null) {
    const name = m[1];
    const line = source.slice(0, m.index).split('\n').length;
    exports.push({ name, line });
  }

  // Banned export names
  for (const { name, line } of exports) {
    if (BANNED_NAME_RE.test(name)) {
      violations.push({
        path,
        line,
        severity: 'error',
        message: `banned story name "${name}" — use Chromatic modes or the toolbar theme toggle instead`,
      });
    }
  }

  // Banned parameter shapes
  if (THEME_OVERRIDE_RE.test(source)) {
    const line = lines.findIndex((l) => /themeOverride/.test(l)) + 1;
    violations.push({
      path,
      line,
      severity: 'error',
      message: `parameters.themes.themeOverride is banned — use the toolbar theme toggle`,
    });
  }
  if (DEFAULT_VIEWPORT_RE.test(source)) {
    const line = lines.findIndex((l) => /defaultViewport/.test(l)) + 1;
    violations.push({
      path,
      line,
      severity: 'error',
      message: `parameters.viewport.defaultViewport is banned — use Chromatic modes`,
    });
  }

  // Story budget
  if (exports.length > BUDGET_FAIL) {
    violations.push({
      path,
      line: 1,
      severity: 'error',
      message: `${exports.length} stories exceeds budget of ${BUDGET_FAIL} per file — restructure into AppShell variants or controls`,
    });
  } else if (exports.length > BUDGET_WARN) {
    violations.push({
      path,
      line: 1,
      severity: 'warn',
      message: `${exports.length} stories exceeds soft cap of ${BUDGET_WARN} — consider collapsing into controls`,
    });
  }

  return violations;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const warnOnly = args.has('--warn');
  const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
  const files = globSync('src/**/*.stories.tsx', { cwd: repoRoot });
  let errorCount = 0;
  let warnCount = 0;

  for (const rel of files) {
    const path = join(repoRoot, rel);
    const source = readFileSync(path, 'utf8');
    const violations = checkStoryFile(path, source);
    for (const v of violations) {
      const severity = warnOnly ? 'warn' : v.severity;
      if (severity === 'error') errorCount++;
      else warnCount++;
      console.error(`${relative(repoRoot, v.path)}:${v.line}: ${severity}: ${v.message}`);
    }
  }

  if (warnCount > 0) console.error(`\n${warnCount} warning(s)`);
  if (errorCount > 0) {
    console.error(`${errorCount} error(s)`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `pnpm vitest run scripts/__tests__/check-stories.test.mjs`
Expected: PASS — all 4 tests green.

- [ ] **Step 6: Add the script to package.json (warn-only initially)**

Open `package.json`. In the `scripts` block, add a `check:stories` entry alongside the existing `lint`, `lint:fix`, etc.:

```json
"check:stories": "node scripts/check-stories.mjs --warn",
```

- [ ] **Step 7: Run the script against the real repo to confirm it executes**

Run: `pnpm check:stories`
Expected: prints a list of warnings (DarkTheme, MobileCombined, etc. found in the existing stories — these will be cleaned up in later tasks). Exit code 0 because of `--warn`.

- [ ] **Step 8: Commit**

```bash
git add scripts/check-stories.mjs scripts/__tests__/ package.json
git commit -m "feat(scripts): add check:stories lint (warn-only)"
```

---

### Task 3: Write STORIES.md authoring guide

**Files:**
- Create: `docs/STORIES.md`

- [ ] **Step 1: Create the document**

Create `docs/STORIES.md` with this exact content:

```markdown
# Story Authoring Guide

This guide is the standard for every `*.stories.tsx` file in `@medalsocial/meda`. The lint script `pnpm check:stories` enforces it.

## Philosophy

One story per visually distinct shape. Everything else is a Storybook control.

A story exists if and only if it shows you something you cannot reach by toggling controls in Storybook's UI. "What does this look like with three workspaces vs one?" is a control. "What does the empty state look like?" is a story only if the empty state has bespoke UI.

## Story budget

- Soft cap: 3 stories per file. Above this, the lint script warns.
- Hard cap: 5 stories per file. Above this, the lint script fails.
- AppShell is the one exception (3 variants × 3 viewports — but still 3 story exports).

## Mode budget (Chromatic)

| Category                         | Modes shot                  | Snapshots/story |
|----------------------------------|-----------------------------|-----------------|
| AppShell variants                | desktop, ipad, mobile       | 3               |
| Marketing surfaces               | desktop, mobile             | 2               |
| Everything else                  | desktop                     | 1               |
| Animation-only                   | none (`disableSnapshot`)    | 0               |

Set per story:

```tsx
export const Workspace: Story = {
  parameters: {
    chromatic: { modes: { desktop: { viewport: 1280 }, ipad: { viewport: 768 }, mobile: { viewport: 390 } } },
  },
  // ...
};
```

## Theme is not a Chromatic mode

The toolbar toggle (`withThemeByDataAttribute`) covers human verification. Do not write `DarkTheme` stories. Do not set `parameters.themes.themeOverride`. The lint script rejects both.

## Ignore policy

Three tiers, smallest scope wins.

1. **`<div data-chromatic="ignore">`** wrapping only the moving subtree (preferred):

   ```tsx
   <span data-chromatic="ignore">{ms}ms</span>
   ```

2. **`parameters.chromatic.ignoreSelectors`** at meta level when the same moving region appears across many stories of the component.

3. **`parameters.chromatic.disableSnapshot: true`** when the entire component IS the animation (`VoiceOrb`, `VoiceLevel` Bars/Wave).

For time-based components, prefer pinning the `now` prop over ignoring the region. Only reach for ignores when pinning is impossible.

## Anti-patterns

| Don't                                               | Do                                                                |
|-----------------------------------------------------|-------------------------------------------------------------------|
| `export const DarkTheme: Story = { ... }`           | Use the toolbar toggle. Delete the story.                         |
| `export const MobileCombined: Story = { ... }`      | Use Chromatic mobile mode on the canonical story.                 |
| `export const Empty: Story = { args: { items: [] } }` if there's no special empty UI | Default story with `items: []` control. Delete the story. |
| Hand-composing `<MobileHeader>` in a consumer       | Use `<AppShell variant="...">`. Mobile chrome is internal.        |
| Six stories on one component                        | Collapse arg-variants into controls. Restructure into AppShell variants if it really has six visual modes. |

## AppShell composition

Consumers compose one `<AppShell>` with a config:

```tsx
<AppShell
  variant="workspace"
  iconRail={{ mainItems, utilityItems }}
  contextRail={{ module }}
  rightPanel={{ panelViews, defaultView: 'inspector' }}
  globalActions={<NewButton />}
>
  {children}
</AppShell>
```

The variant decides which chrome renders. The viewport decides whether desktop or mobile chrome is used internally. Consumers do not import `MobileHeader`, `MobileBottomNav`, or `MobileDrawers` directly — those are no longer exported.
```

- [ ] **Step 2: Commit**

```bash
git add docs/STORIES.md
git commit -m "docs: add STORIES.md authoring guide"
```

---

### Task 4: Wire `check:stories` into pre-commit and CI

**Files:**
- Modify: `.husky/pre-commit`
- Modify: `.github/workflows/chromatic.yml`

- [ ] **Step 1: Add check:stories to the pre-commit hook**

Open `.husky/pre-commit`. The current contents are:

```sh
pnpm lint
pnpm test
```

Replace with:

```sh
pnpm lint
pnpm test
pnpm check:stories
```

- [ ] **Step 2: Add check:stories to the chromatic workflow**

Open `.github/workflows/chromatic.yml`. Find the step that runs `pnpm chromatic`. Insert a new step immediately before it:

```yaml
      - name: Lint stories
        if: steps.chromatic-token.outputs.available == 'true'
        run: pnpm check:stories
```

- [ ] **Step 3: Verify the hook runs locally**

Run: `pnpm check:stories`
Expected: warnings printed (existing DarkTheme, MobileCombined, etc.), exit code 0.

- [ ] **Step 4: Commit**

```bash
git add .husky/pre-commit .github/workflows/chromatic.yml
git commit -m "ci: run check:stories in pre-commit and chromatic workflow"
```

---

## Phase 2 — AppShell variants

Build the new variant API alongside the existing `AppShell`. Stories migrate in Phase 3; old code is deleted in Phase 4.

### Task 5: Define the variant prop and types

**Files:**
- Modify: `src/shell/types.ts`
- Modify: `src/shell/app-shell.tsx`

- [ ] **Step 1: Add the AppShellVariant type**

Open `src/shell/types.ts`. Add at the end of the file:

```ts
export type AppShellVariant = 'auth' | 'workspace' | 'chat';

export interface AppShellIconRailConfig {
  mainItems: import('./icon-rail.js').IconRailItem[];
  utilityItems?: import('./icon-rail.js').IconRailItem[];
  footer?: ReactNode;
  activeId?: string;
}

export interface AppShellContextRailConfig {
  appId: string;
  module: ContextModule;
  activeItemId?: string;
}

export interface AppShellRightPanelConfig {
  panelViews: PanelView[];
  defaultView?: string;
}

export interface AppShellAuthConfig {
  title: ReactNode;
  description?: ReactNode;
  brandName?: ReactNode;
  brandMark?: ReactNode;
  eyebrow?: ReactNode;
  preview?: ReactNode;
  actions?: ReactNode;
}
```

If `ReactNode` is not already imported at the top of `types.ts`, add `import type { ReactNode } from 'react';`.

- [ ] **Step 2: Write a failing test for the variant prop**

Create `src/shell/app-shell-variants.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './app-shell.js';
import { MedaShellProvider } from './shell-provider.js';

const baseProvider = (children: React.ReactNode) => (
  <MedaShellProvider
    workspace={{ id: 'w', name: 'W', icon: null }}
    workspaces={[{ id: 'w', name: 'W', icon: null }]}
    apps={[{ id: 'a', label: 'A', icon: () => null as unknown as JSX.Element }]}
    storage={{ load: () => null, save: () => {} }}
    themeAdapter="default"
  >
    {children}
  </MedaShellProvider>
);

describe('AppShell variant', () => {
  it('renders the auth variant when variant="auth"', () => {
    render(baseProvider(
      <AppShell variant="auth" auth={{ title: 'Sign in' }}>
        <input aria-label="email" />
      </AppShell>
    ));
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText('email')).toBeInTheDocument();
  });

  it('renders the workspace variant when variant="workspace"', () => {
    render(baseProvider(
      <AppShell
        variant="workspace"
        iconRail={{ mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: () => null as unknown as JSX.Element }] }}
      >
        <main aria-label="content">hi</main>
      </AppShell>
    ));
    expect(screen.getByLabelText('content')).toBeInTheDocument();
  });

  it('renders the chat variant when variant="chat"', () => {
    render(baseProvider(
      <AppShell variant="chat">
        <div data-testid="transcript">…</div>
      </AppShell>
    ));
    expect(screen.getByTestId('transcript')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `pnpm test src/shell/app-shell-variants.test.tsx`
Expected: FAIL — `variant`, `auth`, `iconRail` are not valid props on `AppShell`.

- [ ] **Step 4: Refactor AppShell to be a variant switch**

Replace the entire contents of `src/shell/app-shell.tsx` with:

```tsx
'use client';

import type { ReactNode } from 'react';
import { cn } from '../lib/utils.js';
import { AppShellAuth } from './app-shell-auth.js';
import { AppShellChat } from './app-shell-chat.js';
import { AppShellWorkspace } from './app-shell-workspace.js';
import { useMedaShell } from './shell-provider.js';
import type {
  AppShellAuthConfig,
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
  AppShellVariant,
} from './types.js';

export interface AppShellProps {
  variant: AppShellVariant;
  children: ReactNode;
  className?: string;

  // workspace + chat
  iconRail?: AppShellIconRailConfig;
  contextRail?: AppShellContextRailConfig;
  rightPanel?: AppShellRightPanelConfig;
  globalActions?: ReactNode;

  // auth
  auth?: AppShellAuthConfig;
}

export function AppShell({ variant, children, className, ...rest }: AppShellProps) {
  const { workspace, activeAppId } = useMedaShell();

  const wrapper = (content: ReactNode) => (
    <div
      data-meda-app={activeAppId}
      data-meda-workspace={workspace.id}
      data-meda-variant={variant}
      className={cn('h-screen overflow-hidden bg-background text-foreground', className)}
    >
      {content}
    </div>
  );

  switch (variant) {
    case 'auth':
      return wrapper(<AppShellAuth {...(rest.auth ?? { title: '' })}>{children}</AppShellAuth>);
    case 'workspace':
      return wrapper(
        <AppShellWorkspace
          iconRail={rest.iconRail}
          contextRail={rest.contextRail}
          rightPanel={rest.rightPanel}
          globalActions={rest.globalActions}
        >
          {children}
        </AppShellWorkspace>
      );
    case 'chat':
      return wrapper(<AppShellChat globalActions={rest.globalActions}>{children}</AppShellChat>);
  }
}

export function AppShellBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-[calc(100vh-var(--shell-header-height))] overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Variant components do not exist yet — create stubs so the refactor compiles**

Create `src/shell/app-shell-auth.tsx`:

```tsx
'use client';
import type { ReactNode } from 'react';
import type { AppShellAuthConfig } from './types.js';

export function AppShellAuth({
  title,
  children,
}: AppShellAuthConfig & { children: ReactNode }) {
  return (
    <section data-testid="app-shell-auth">
      <h1>{title}</h1>
      {children}
    </section>
  );
}
```

Create `src/shell/app-shell-workspace.tsx`:

```tsx
'use client';
import type { ReactNode } from 'react';
import type {
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
} from './types.js';

export function AppShellWorkspace({
  children,
}: {
  iconRail?: AppShellIconRailConfig;
  contextRail?: AppShellContextRailConfig;
  rightPanel?: AppShellRightPanelConfig;
  globalActions?: ReactNode;
  children: ReactNode;
}) {
  return <div data-testid="app-shell-workspace">{children}</div>;
}
```

Create `src/shell/app-shell-chat.tsx`:

```tsx
'use client';
import type { ReactNode } from 'react';

export function AppShellChat({
  children,
}: {
  globalActions?: ReactNode;
  children: ReactNode;
}) {
  return <div data-testid="app-shell-chat">{children}</div>;
}
```

- [ ] **Step 6: Run the variant test — it should now pass with the stubs**

Run: `pnpm test src/shell/app-shell-variants.test.tsx`
Expected: PASS — all three tests green.

- [ ] **Step 7: Run the full test suite to confirm nothing else broke**

Run: `pnpm test`
Expected: all existing tests still pass. The old `<AppShell>{children}</AppShell>` callsite from existing stories will fail typecheck (variant is required) — that is expected and is fixed in Phase 3.

- [ ] **Step 8: Commit**

```bash
git add src/shell/types.ts src/shell/app-shell.tsx src/shell/app-shell-auth.tsx \
        src/shell/app-shell-workspace.tsx src/shell/app-shell-chat.tsx \
        src/shell/app-shell-variants.test.tsx
git commit -m "feat(shell): add AppShell variant switch (auth/workspace/chat) with stubs"
```

---

### Task 6: Implement AppShellWorkspace (the existing combined layout)

**Files:**
- Modify: `src/shell/app-shell-workspace.tsx`
- Reference: `src/shell/app-shell.stories.tsx` (the existing `Combined` and `MobileCombined` stories show the desired composition)

- [ ] **Step 1: Write a failing test that asserts both desktop and mobile chrome render**

Create `src/shell/app-shell-workspace.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Inbox } from 'lucide-react';
import { AppShellWorkspace } from './app-shell-workspace.js';
import { MedaShellProvider } from './shell-provider.js';

vi.mock('./use-shell-viewport.js', () => ({
  useShellViewport: vi.fn(),
}));
import { useShellViewport } from './use-shell-viewport.js';

const Provider = ({ children }: { children: React.ReactNode }) => (
  <MedaShellProvider
    workspace={{ id: 'w', name: 'W', icon: null }}
    workspaces={[{ id: 'w', name: 'W', icon: null }]}
    apps={[{ id: 'a', label: 'A', icon: Inbox }]}
    storage={{ load: () => null, save: () => {} }}
    themeAdapter="default"
  >
    {children}
  </MedaShellProvider>
);

const config = {
  iconRail: { mainItems: [{ id: 'i', label: 'Inbox', to: '/i', icon: Inbox }] },
  contextRail: { appId: 'a', module: { id: 'i', label: 'Inbox', items: [] } },
  rightPanel: { panelViews: [{ id: 'inspector', label: 'Inspector', icon: Inbox, render: () => null }] },
};

describe('AppShellWorkspace', () => {
  it('renders desktop chrome (icon rail + context rail + right panel) on desktop', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');
    render(
      <Provider>
        <AppShellWorkspace {...config}>
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );
    expect(screen.getByTestId('icon-rail')).toBeInTheDocument();
    expect(screen.getByTestId('context-rail')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-bottom-nav')).not.toBeInTheDocument();
  });

  it('renders mobile chrome (header + bottom nav + drawers) on mobile', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('mobile');
    render(
      <Provider>
        <AppShellWorkspace {...config}>
          <main aria-label="content">hi</main>
        </AppShellWorkspace>
      </Provider>
    );
    expect(screen.queryByTestId('icon-rail')).not.toBeInTheDocument();
    expect(screen.getByTestId('mobile-header')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/shell/app-shell-workspace.test.tsx`
Expected: FAIL — the stub renders nothing identifiable.

- [ ] **Step 3: Add data-testids to the source components if missing**

Open each of these files and add `data-testid` to the root element of the component if it does not already have one:
- `src/shell/icon-rail.tsx` → `data-testid="icon-rail"` on the outermost element
- `src/shell/context-rail.tsx` → `data-testid="context-rail"` on the outermost element
- `src/shell/mobile/mobile-header.tsx` → `data-testid="mobile-header"` on the outermost element
- `src/shell/mobile/mobile-bottom-nav.tsx` → `data-testid="mobile-bottom-nav"` on the outermost element

(If a testid already exists with a different value, leave it; we will reference the existing one in the test instead. Verify by grepping each file: `grep -n data-testid src/shell/icon-rail.tsx`.)

- [ ] **Step 4: Add internal aliases on the existing mobile files (do this before Step 5 so the imports resolve)**

In each of:
- `src/shell/mobile/mobile-header.tsx` — append `export { MobileHeader as MobileHeaderInternal };`
- `src/shell/mobile/mobile-bottom-nav.tsx` — append `export { MobileBottomNav as MobileBottomNavInternal };`
- `src/shell/mobile/mobile-drawers.tsx` — append `export { MobileDrawers as MobileDrawersInternal };`

- [ ] **Step 5: Implement AppShellWorkspace**

Replace `src/shell/app-shell-workspace.tsx` with:

```tsx
'use client';
import type { ReactNode } from 'react';
import { AppShellBody } from './app-shell.js';
import { ContextRail } from './context-rail.js';
import { IconRail } from './icon-rail.js';
import { MobileBottomNavInternal } from './mobile/mobile-bottom-nav.js';
import { MobileDrawersInternal } from './mobile/mobile-drawers.js';
import { MobileHeaderInternal } from './mobile/mobile-header.js';
import { RightPanel } from './right-panel.js';
import { ShellHeader } from './shell-header.js';
import { ShellMain } from './shell-main.js';
import type {
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
} from './types.js';
import { useShellViewport } from './use-shell-viewport.js';

export interface AppShellWorkspaceProps {
  iconRail?: AppShellIconRailConfig;
  contextRail?: AppShellContextRailConfig;
  rightPanel?: AppShellRightPanelConfig;
  globalActions?: ReactNode;
  children: ReactNode;
}

export function AppShellWorkspace({
  iconRail,
  contextRail,
  rightPanel,
  globalActions,
  children,
}: AppShellWorkspaceProps) {
  const viewport = useShellViewport();
  const isMobile = viewport === 'mobile';

  if (isMobile) {
    return (
      <>
        <MobileHeaderInternal />
        <AppShellBody>
          <ShellMain layout="workspace">{children}</ShellMain>
        </AppShellBody>
        <MobileBottomNavInternal />
        <MobileDrawersInternal
          menuItems={iconRail?.mainItems ?? []}
          module={contextRail?.module}
          panelViews={rightPanel?.panelViews ?? []}
        />
      </>
    );
  }

  return (
    <>
      <ShellHeader globalActions={globalActions} />
      <AppShellBody>
        {iconRail && (
          <IconRail
            mainItems={iconRail.mainItems}
            utilityItems={iconRail.utilityItems}
            footer={iconRail.footer}
            activeId={iconRail.activeId}
          />
        )}
        {contextRail && (
          <ContextRail
            appId={contextRail.appId}
            module={contextRail.module}
            activeItemId={contextRail.activeItemId}
          />
        )}
        <ShellMain layout="workspace">{children}</ShellMain>
        {rightPanel && (
          <RightPanel
            panelViews={rightPanel.panelViews}
            defaultView={rightPanel.defaultView}
          />
        )}
      </AppShellBody>
    </>
  );
}
```

Note: `MobileHeaderInternal` / `MobileBottomNavInternal` / `MobileDrawersInternal` do not exist yet. The next sub-step renames the public exports.

- [ ] **Step 6: Run the workspace test**

Run: `pnpm test src/shell/app-shell-workspace.test.tsx`
Expected: PASS — both desktop and mobile assertions hold.

- [ ] **Step 7: Run the full test suite**

Run: `pnpm test`
Expected: all tests pass except story-touching ones (`app-shell.stories.tsx` callsites still fail typecheck — fixed in Phase 3).

- [ ] **Step 8: Commit**

```bash
git add src/shell/app-shell-workspace.tsx src/shell/app-shell-workspace.test.tsx \
        src/shell/mobile/mobile-header.tsx src/shell/mobile/mobile-bottom-nav.tsx \
        src/shell/mobile/mobile-drawers.tsx \
        src/shell/icon-rail.tsx src/shell/context-rail.tsx
git commit -m "feat(shell): implement AppShellWorkspace with internal mobile chrome"
```

---

### Task 7: Implement AppShellAuth (port from ShellAuthFrame)

**Files:**
- Modify: `src/shell/app-shell-auth.tsx`
- Reference: `src/shell/shell-auth-frame.tsx` (full source — port the layout into the new internal component)

- [ ] **Step 1: Write a failing test**

Create `src/shell/app-shell-auth.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShellAuth } from './app-shell-auth.js';

describe('AppShellAuth', () => {
  it('renders the title, description, and form children', () => {
    render(
      <AppShellAuth title="Sign in" description="Welcome back" brandName="Meda">
        <input aria-label="email" />
      </AppShellAuth>
    );
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText('email')).toBeInTheDocument();
  });

  it('renders the brand name on the marketing panel', () => {
    render(
      <AppShellAuth title="Sign in" brandName="Meda">
        <input aria-label="email" />
      </AppShellAuth>
    );
    expect(screen.getAllByText('Meda').length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test src/shell/app-shell-auth.test.tsx`
Expected: FAIL — the stub does not render description or brand name.

- [ ] **Step 3: Port ShellAuthFrame body into AppShellAuth**

Open `src/shell/shell-auth-frame.tsx`. Read the full `ShellAuthFrame` function body (the JSX). Copy it into `src/shell/app-shell-auth.tsx`, replacing the stub. The new file:

```tsx
'use client';
import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import type { AppShellAuthConfig } from './types.js';

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function DefaultBrandMark() {
  return (
    <span className="inline-flex size-10 items-center justify-center rounded-lg bg-white/14 text-white ring-1 ring-white/20 shadow-lg shadow-black/20">
      <Sparkles className="size-5" aria-hidden />
    </span>
  );
}

export function AppShellAuth({
  children,
  title,
  description,
  brandName = 'Meda',
  brandMark,
  eyebrow,
  preview,
  actions,
}: AppShellAuthConfig & { children: ReactNode }) {
  const resolvedBrandMark = brandMark ?? <DefaultBrandMark />;

  return (
    <section
      data-testid="app-shell-auth"
      className={cx(
        'grid min-h-screen overflow-hidden bg-background text-foreground',
        'lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]'
      )}
    >
      <aside className="relative flex min-h-[24rem] flex-col overflow-hidden bg-[radial-gradient(circle_at_24%_18%,var(--color-info-500)_0,transparent_25%),radial-gradient(circle_at_84%_24%,var(--color-brand-400)_0,transparent_28%),linear-gradient(135deg,var(--color-brand-800),var(--color-brand-700)_42%,var(--color-brand-500))] px-6 py-6 text-white sm:min-h-[30rem] sm:px-8 lg:min-h-screen lg:px-10 lg:py-8">
        <div className="relative z-10 flex items-center gap-3">
          {resolvedBrandMark}
          <span className="text-sm font-semibold tracking-wide">{brandName}</span>
        </div>
        {eyebrow ? <div className="relative z-10 mt-8 text-sm uppercase tracking-[0.2em] text-white/70">{eyebrow}</div> : null}
        {preview ? <div className="relative z-10 mt-auto pt-12">{preview}</div> : null}
      </aside>
      <main className="relative flex flex-col justify-center bg-background px-6 py-10 sm:px-10 lg:px-14">
        {actions ? <div className="absolute right-6 top-6 sm:right-10">{actions}</div> : null}
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
        <div className="mt-8">{children}</div>
      </main>
    </section>
  );
}
```

If you find that the original `ShellAuthFrame` JSX includes additional structure not captured here (e.g. extra layers, classes), copy them verbatim. The visual must match — this is a port, not a redesign.

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/shell/app-shell-auth.test.tsx`
Expected: PASS — both tests green.

- [ ] **Step 5: Commit**

```bash
git add src/shell/app-shell-auth.tsx src/shell/app-shell-auth.test.tsx
git commit -m "feat(shell): implement AppShellAuth (ports ShellAuthFrame visuals)"
```

---

### Task 8: Implement AppShellChat (transcript-dominant layout)

**Files:**
- Modify: `src/shell/app-shell-chat.tsx`

This is the smallest variant. It renders header + transcript area (children) + footer slot (handled by children). Most of the chat composition lives outside the shell — this variant just provides the chrome.

- [ ] **Step 1: Write a failing test**

Create `src/shell/app-shell-chat.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./use-shell-viewport.js', () => ({
  useShellViewport: vi.fn().mockReturnValue('desktop'),
}));

import { AppShellChat } from './app-shell-chat.js';

describe('AppShellChat', () => {
  it('renders the chat scaffolding and global actions slot', () => {
    render(
      <AppShellChat globalActions={<button type="button">New chat</button>}>
        <div data-testid="transcript">messages</div>
      </AppShellChat>
    );
    expect(screen.getByTestId('app-shell-chat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New chat' })).toBeInTheDocument();
    expect(screen.getByTestId('transcript')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/shell/app-shell-chat.test.tsx`
Expected: FAIL — the stub does not render `globalActions`.

- [ ] **Step 3: Implement AppShellChat**

Replace `src/shell/app-shell-chat.tsx` with:

```tsx
'use client';
import type { ReactNode } from 'react';
import { useShellViewport } from './use-shell-viewport.js';

export interface AppShellChatProps {
  globalActions?: ReactNode;
  children: ReactNode;
}

export function AppShellChat({ globalActions, children }: AppShellChatProps) {
  const viewport = useShellViewport();
  const isMobile = viewport === 'mobile';

  return (
    <section
      data-testid="app-shell-chat"
      className="flex h-screen flex-col bg-background text-foreground"
    >
      <header className="flex h-12 items-center justify-between border-b border-border px-4">
        <span className="text-sm font-medium text-foreground">Chat</span>
        {globalActions ? <div className="flex items-center gap-2">{globalActions}</div> : null}
      </header>
      <div className={isMobile ? 'flex-1 overflow-y-auto px-2 py-3' : 'flex-1 overflow-y-auto px-6 py-4'}>
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test src/shell/app-shell-chat.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/shell/app-shell-chat.tsx src/shell/app-shell-chat.test.tsx
git commit -m "feat(shell): implement AppShellChat (transcript-dominant layout)"
```

---

## Phase 3 — Story migration

Rewrite the AppShell stories to use the three variants. Apply the prune table (delete duplicates, internalize others). Apply ignore policy.

### Task 9: Rewrite app-shell.stories.tsx with three variants

**Files:**
- Modify: `src/shell/app-shell.stories.tsx`
- Reference: existing stories file for fixtures

- [ ] **Step 1: Replace the entire file with the three-variant version**

Open `src/shell/app-shell.stories.tsx`. Replace the entire file contents with:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Activity,
  Building2,
  Calendar,
  HelpCircle,
  Inbox,
  Info,
  Mail,
  Settings,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { AppShell } from './app-shell.js';
import { MedaShellProvider } from './shell-provider.js';
import type {
  AppDefinition,
  ContextItem,
  ContextModule,
  PanelView,
  WorkspaceDefinition,
} from './types.js';

// Fixtures
const WORKSPACE: WorkspaceDefinition = {
  id: 'ws-acme',
  name: 'Acme Corp',
  icon: <Building2 size={20} aria-hidden />,
};
const APPS: AppDefinition[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'mail', label: 'Mail', icon: Mail },
  { id: 'settings', label: 'Settings', icon: Settings },
];
const RAIL_MAIN = [
  { id: 'inbox', label: 'Inbox', to: '/inbox', icon: Inbox },
  { id: 'calendar', label: 'Calendar', to: '/calendar', icon: Calendar },
  { id: 'users', label: 'People', to: '/people', icon: Users },
];
const RAIL_UTILITY = [{ id: 'help', label: 'Help', to: '/help', icon: HelpCircle }];
const INBOX_ITEMS: ContextItem[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' },
];
const INBOX_MODULE: ContextModule = {
  id: 'inbox',
  label: 'Inbox',
  description: 'Mail + drafts',
  items: INBOX_ITEMS,
};
const PANEL_VIEWS: PanelView[] = [
  {
    id: 'inspector',
    label: 'Inspector',
    icon: Info,
    render: () => (
      <div className="p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Inspector</p>
        <p>Select an item to inspect its properties.</p>
      </div>
    ),
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: Activity,
    render: () => <div className="p-4 text-sm text-muted-foreground">Activity</div>,
  },
];

function memoryStorage() {
  const store = new Map<string, unknown>();
  return {
    load: (key: string) => store.get(key) ?? null,
    save: (key: string, value: unknown) => store.set(key, value),
  };
}

function withProvider(Story: () => ReactNode) {
  return (
    <MedaShellProvider
      workspace={WORKSPACE}
      workspaces={[WORKSPACE]}
      apps={APPS}
      storage={memoryStorage()}
      themeAdapter="default"
    >
      <Story />
    </MedaShellProvider>
  );
}

const ALL_VIEWPORTS = {
  desktop: { viewport: 1280 },
  ipad: { viewport: 768 },
  mobile: { viewport: 390 },
};

const meta = {
  title: 'AppShell',
  component: AppShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => withProvider(Story)],
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Auth: Story = {
  parameters: { chromatic: { modes: ALL_VIEWPORTS } },
  render: () => (
    <AppShell
      variant="auth"
      auth={{
        title: 'Welcome back',
        description: 'Sign in to your Meda workspace.',
        eyebrow: 'Meda',
      }}
    >
      <form className="flex flex-col gap-3">
        <input
          aria-label="email"
          placeholder="you@example.com"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          aria-label="password"
          type="password"
          placeholder="••••••••"
          className="rounded-md border border-border px-3 py-2 text-sm"
        />
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
        >
          Continue
        </button>
      </form>
    </AppShell>
  ),
};

export const Workspace: Story = {
  parameters: { chromatic: { modes: ALL_VIEWPORTS } },
  render: () => (
    <AppShell
      variant="workspace"
      iconRail={{ mainItems: RAIL_MAIN, utilityItems: RAIL_UTILITY, activeId: 'inbox' }}
      contextRail={{ appId: 'inbox', module: INBOX_MODULE, activeItemId: 'inbox' }}
      rightPanel={{ panelViews: PANEL_VIEWS, defaultView: 'inspector' }}
      globalActions={
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
        >
          + New
        </button>
      }
    >
      <h1 className="text-2xl font-semibold text-foreground mb-2">Inbox</h1>
      <p className="text-muted-foreground">
        Workspace shell — desktop renders rails + panel; mobile renders header + bottom nav.
      </p>
    </AppShell>
  ),
};

export const Chat: Story = {
  parameters: { chromatic: { modes: ALL_VIEWPORTS } },
  render: () => (
    <AppShell
      variant="chat"
      globalActions={
        <button type="button" className="text-sm text-muted-foreground">
          New chat
        </button>
      }
    >
      <div className="flex flex-col gap-3 max-w-2xl mx-auto">
        <div className="self-end max-w-[80%] rounded-2xl bg-primary px-3 py-2 text-sm text-primary-foreground">
          Hey, can you summarize the latest support tickets?
        </div>
        <div className="self-start max-w-[80%] rounded-2xl bg-muted px-3 py-2 text-sm text-foreground">
          Sure — there are 12 open tickets. The top three categories are billing, onboarding,
          and integrations.
        </div>
      </div>
    </AppShell>
  ),
};
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS for `app-shell.stories.tsx`. Other story files (mobile, shell-auth-frame) may still error — those files are deleted in Phase 4.

- [ ] **Step 3: Run Storybook visually**

Run: `pnpm storybook`
Expected: navigate to `AppShell / Auth`, `AppShell / Workspace`, `AppShell / Chat`. Each renders. Toggle the toolbar viewport to see desktop/iPad/mobile responsiveness. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/shell/app-shell.stories.tsx
git commit -m "feat(storybook): rewrite app-shell stories as three variants × three viewports"
```

---

### Task 10: Move Brand → Foundations

**Files:**
- Modify: `src/brand/medal-social-mark.stories.tsx`

- [ ] **Step 1: Update the story title**

Open `src/brand/medal-social-mark.stories.tsx`. Find the `meta` object (top of file). Change the `title` field from `'Brand/MedalSocialMark'` (or similar) to `'Foundations/Mark'`. Leave everything else.

- [ ] **Step 2: Update the storySort order in `.storybook/preview.ts`**

Open `.storybook/preview.ts`. In `parameters.options.storySort.order`, the current Foundations entry includes `Iconography` last. Add `Mark` after it:

```ts
'Foundations',
[
  'Color',
  'Typography',
  'Spacing',
  'Radii',
  'Shadows',
  'Motion',
  'Z-Index',
  'Iconography',
  'Mark',
],
```

Remove `'Brand'` from the order list if it appears.

- [ ] **Step 3: Verify Storybook navigation**

Run: `pnpm storybook`
Expected: `Foundations / Mark` exists; no `Brand` group remains. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/brand/medal-social-mark.stories.tsx .storybook/preview.ts
git commit -m "refactor(storybook): move Brand/Mark under Foundations"
```

---

### Task 11: Group voice components under Audio

**Files:**
- Modify: `src/voice/voice-orb.stories.tsx`
- Modify: `src/voice/voice-level.stories.tsx`
- Modify: `src/voice/voice-status-pill.stories.tsx`
- Modify: `.storybook/preview.ts`

- [ ] **Step 1: Update each title**

For each of the three voice story files, change the `meta.title` from `'Voice/VoiceOrb'` (etc.) to `'Audio/VoiceOrb'`, `'Audio/VoiceLevel'`, `'Audio/VoiceStatusPill'`.

- [ ] **Step 2: Update storySort**

In `.storybook/preview.ts`, replace `'Voice'` in `parameters.options.storySort.order` with `'Audio'`.

- [ ] **Step 3: Collapse each voice story file to one Default story with controls**

Replace the contents of `src/voice/voice-orb.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceOrb } from './voice-orb.js';

const meta = {
  title: 'Audio/VoiceOrb',
  component: VoiceOrb,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
} satisfies Meta<typeof VoiceOrb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { phase: 'idle', material: 'aurora' },
};
```

Replace `src/voice/voice-level.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceLevel } from './voice-level.js';

const meta = {
  title: 'Audio/VoiceLevel',
  component: VoiceLevel,
  tags: ['autodocs'],
  parameters: { chromatic: { disableSnapshot: true } },
} satisfies Meta<typeof VoiceLevel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { level: 0.6, variant: 'ring' },
};
```

Replace `src/voice/voice-status-pill.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { VoiceStatusPill } from './voice-status-pill.js';

const meta = {
  title: 'Audio/VoiceStatusPill',
  component: VoiceStatusPill,
  tags: ['autodocs'],
} satisfies Meta<typeof VoiceStatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { phase: 'idle' },
};
```

- [ ] **Step 4: Run check:stories to confirm story budget compliance**

Run: `pnpm check:stories`
Expected: voice files no longer flagged. (Other files still flagged — that's fine for now.)

- [ ] **Step 5: Commit**

```bash
git add src/voice/*.stories.tsx .storybook/preview.ts
git commit -m "refactor(storybook): group voice under Audio, collapse to Default + controls"
```

---

### Task 12: Establish Studios group with Inspector and Timeline

**Files:**
- Modify: `src/panel/inspector.stories.tsx`
- Modify: `src/timeline/timeline-tape.stories.tsx`
- Modify: `.storybook/preview.ts`
- Delete: `src/panel/inspector-field.stories.tsx`
- Delete: `src/panel/inspector-json.stories.tsx`
- Delete: `src/timeline/date-switcher.stories.tsx`
- Delete: `src/timeline/event-card.stories.tsx`
- Delete: `src/timeline/live-indicator.stories.tsx`
- Delete: `src/timeline/scrub-bar.stories.tsx`
- Delete: `src/timeline/timeline-rail.stories.tsx`

- [ ] **Step 1: Update Inspector story title and collapse to Default**

Replace `src/panel/inspector.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Inspector } from './inspector.js';

const meta = {
  title: 'Studios/Inspector',
  component: Inspector,
  tags: ['autodocs'],
} satisfies Meta<typeof Inspector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    tabs: [
      { id: 'props', label: 'Properties', render: () => <div className="p-4">Property editor</div> },
      { id: 'history', label: 'History', render: () => <div className="p-4">Change history</div> },
    ],
  },
};
```

(If the actual `Inspector` component takes different props, adapt the args to match. Confirm by reading `src/panel/inspector.tsx` first.)

- [ ] **Step 2: Update TimelineTape story title and collapse to Default**

Replace `src/timeline/timeline-tape.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TimelineTape } from './timeline-tape.js';

const meta = {
  title: 'Studios/Timeline',
  component: TimelineTape,
  tags: ['autodocs'],
} satisfies Meta<typeof TimelineTape>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { pxPerSec: 1.2 },
};
```

(Adapt args based on actual `TimelineTape` props.)

- [ ] **Step 3: Delete the per-primitive story files**

Run:

```bash
rm src/panel/inspector-field.stories.tsx
rm src/panel/inspector-json.stories.tsx
rm src/timeline/date-switcher.stories.tsx
rm src/timeline/event-card.stories.tsx
rm src/timeline/live-indicator.stories.tsx
rm src/timeline/scrub-bar.stories.tsx
rm src/timeline/timeline-rail.stories.tsx
```

- [ ] **Step 4: Update storySort**

In `.storybook/preview.ts`, in `parameters.options.storySort.order`, replace `'Timeline'` and `'Panel'` with a single `'Studios'`. Remove `'Inbox'` if it exists. Final order should be:

```ts
order: [
  'Get Started',
  ['Introduction', 'Installation', 'Theming'],
  'Foundations',
  ['Color', 'Typography', 'Spacing', 'Radii', 'Shadows', 'Motion', 'Z-Index', 'Iconography', 'Mark'],
  'AppShell',
  'Marketing',
  'Audio',
  'Studios',
  '*',
],
```

- [ ] **Step 5: Verify Storybook nav**

Run: `pnpm storybook`
Expected: `Studios / Inspector` and `Studios / Timeline` exist. No `Panel` or `Timeline` top-level groups remain. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/panel/ src/timeline/ .storybook/preview.ts
git commit -m "refactor(storybook): establish Studios group, collapse Inspector + Timeline"
```

---

### Task 13: Collapse remaining chat/marketing/shell stories

**Files:**
- Delete: `src/chat/latency-badge.stories.tsx`
- Delete: `src/chat/latency-breakdown.stories.tsx`
- Delete: `src/chat/tool-call-block.stories.tsx`
- Delete: `src/chat/transcript-stream.stories.tsx`
- Delete: `src/chat/turn-card.stories.tsx`
- Delete: `src/shell/command-palette.stories.tsx`
- Delete: `src/shell/context-rail.stories.tsx`
- Delete: `src/shell/icon-rail.stories.tsx`
- Delete: `src/shell/right-panel.stories.tsx`
- Delete: `src/shell/shell-header-v2.stories.tsx`
- Delete: `src/shell/shell-main.stories.tsx`
- Modify: `src/shell/resizable-shell.stories.tsx` — collapse to 1 Default story
- Modify: `src/marketing/marketing-callout.stories.tsx` — collapse to 1 Default
- Modify: `src/marketing/marketing-contact.stories.tsx` — collapse to 1 Default
- Modify: `src/marketing/marketing-lead-magnet.stories.tsx` — collapse to 1 Default

These shell components (icon-rail, context-rail, etc.) keep their source files and tests — only the .stories.tsx files are deleted. They are now visible only as parts of `AppShell Workspace`.

- [ ] **Step 1: Delete the chat and shell story files**

```bash
rm src/chat/latency-badge.stories.tsx \
   src/chat/latency-breakdown.stories.tsx \
   src/chat/tool-call-block.stories.tsx \
   src/chat/transcript-stream.stories.tsx \
   src/chat/turn-card.stories.tsx \
   src/shell/command-palette.stories.tsx \
   src/shell/context-rail.stories.tsx \
   src/shell/icon-rail.stories.tsx \
   src/shell/right-panel.stories.tsx \
   src/shell/shell-header-v2.stories.tsx \
   src/shell/shell-main.stories.tsx
```

- [ ] **Step 2: Collapse resizable-shell to one story**

Replace `src/shell/resizable-shell.stories.tsx` with:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResizableHandle, ResizableShell, ResizableShellPanel } from './resizable-shell.js';

const meta = {
  title: 'AppShell/Internals/ResizableShell',
  component: ResizableShell,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ResizableShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ResizableShell direction="horizontal" className="h-screen">
      <ResizableShellPanel defaultSize={20}><div className="p-3 text-sm">Sidebar</div></ResizableShellPanel>
      <ResizableHandle />
      <ResizableShellPanel><div className="p-3 text-sm">Main</div></ResizableShellPanel>
    </ResizableShell>
  ),
};
```

- [ ] **Step 3: Collapse each marketing file to its first story**

For `src/marketing/marketing-callout.stories.tsx`, `marketing-contact.stories.tsx`, `marketing-lead-magnet.stories.tsx`: keep only the first `export const` (rename to `Default` if needed). Add the marketing mode budget:

```ts
parameters: {
  chromatic: { modes: { desktop: { viewport: 1280 }, mobile: { viewport: 390 } } },
},
```

at the meta level for each.

- [ ] **Step 4: Run check:stories**

Run: `pnpm check:stories`
Expected: zero remaining warnings. (The lint script runs in `--warn` mode so even errors print as warnings; what we care about is the count dropping to zero.)

- [ ] **Step 5: Run Storybook**

Run: `pnpm storybook`
Expected: tree matches the spec — Get Started, Foundations (with Mark), AppShell (Auth/Workspace/Chat), Marketing (3), Audio (3), Studios (Inspector + Timeline). Roughly 15 component-level stories total plus docs.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(storybook): apply prune table — internalize shell + chat primitives"
```

---

### Task 14: Apply Chromatic ignore policy

**Files:**
- Modify: `src/chat/latency-badge.tsx` (or the spans where `ms` is rendered)
- Modify: `src/chat/latency-breakdown.tsx`
- Modify: `src/chat/turn-card.tsx`
- Modify: `src/timeline/scrub-bar.tsx`
- Modify: `src/timeline/event-card.tsx`
- Modify: `src/timeline/live-indicator.tsx`

The ignore wrappers belong on the source components, not the stories — this way every consumer of the component (and every story that includes them) benefits. Wrap only the moving subtree.

- [ ] **Step 1: Wrap rendered `ms` text in LatencyBadge**

Open `src/chat/latency-badge.tsx`. Find the JSX that renders the `ms` number (e.g., `<span>{ms}ms</span>` or similar). Wrap that span with `data-chromatic="ignore"`:

```tsx
<span data-chromatic="ignore">{ms}ms</span>
```

- [ ] **Step 2: Same for LatencyBreakdown**

Open `src/chat/latency-breakdown.tsx`. Find each rendered ms value and add `data-chromatic="ignore"` to its containing span.

- [ ] **Step 3: Wrap streaming caret in TurnCard**

Open `src/chat/turn-card.tsx`. Find the streaming caret element (likely a span or div rendered when `isStreaming` is true). Add `data-chromatic="ignore"` to it.

- [ ] **Step 4: Wrap now-line in ScrubBar / EventCard / LiveIndicator**

In each file, find the element representing the live now-line (the moving cursor that follows current time). Add `data-chromatic="ignore"` to it. If `now` is already a prop, you may instead pin it in the consuming story and skip the ignore.

- [ ] **Step 5: Run all tests**

Run: `pnpm test`
Expected: PASS — adding a data attribute does not break tests.

- [ ] **Step 6: Commit**

```bash
git add src/chat/ src/timeline/
git commit -m "chore(visual): wrap time/animation regions with data-chromatic=ignore"
```

---

## Phase 4 — Delete legacy components

### Task 15: Delete ShellAuthFrame, MobileHeader, MobileBottomNav, MobileDrawers

**Files:**
- Delete: `src/shell/shell-auth-frame.tsx`
- Delete: `src/shell/shell-auth-frame.test.tsx`
- Delete: `src/shell/shell-auth-frame.stories.tsx`
- Delete: `src/shell/mobile/mobile-header.tsx`
- Delete: `src/shell/mobile/mobile-header.test.tsx`
- Delete: `src/shell/mobile/mobile-header.stories.tsx`
- Delete: `src/shell/mobile/mobile-bottom-nav.tsx`
- Delete: `src/shell/mobile/mobile-bottom-nav.test.tsx`
- Delete: `src/shell/mobile/mobile-bottom-nav.stories.tsx`
- Delete: `src/shell/mobile/mobile-drawers.tsx`
- Delete: `src/shell/mobile/mobile-drawers.test.tsx`
- Delete: `src/shell/mobile/mobile-drawers.stories.tsx`
- Modify: `src/shell/index.ts`
- Modify: `src/shell/app-shell-workspace.tsx`

- [ ] **Step 1: Re-home the mobile components inside the shell module**

The new `AppShellWorkspace` imports `MobileHeaderInternal`, `MobileBottomNavInternal`, `MobileDrawersInternal` from `./mobile/`. Since we are deleting those files, copy the rendering logic into three new internal-only files at `src/shell/internal/`:

```bash
mkdir -p src/shell/internal
```

For each of the three components, create a new file under `src/shell/internal/` that contains the full rendering logic from the file being deleted, but renamed to `MobileHeader`, `MobileBottomNav`, `MobileDrawers` (no `Internal` suffix needed since the file is now unmistakably internal). Read the existing source first to capture the exact JSX:

- `src/shell/internal/mobile-header.tsx` ← from `src/shell/mobile/mobile-header.tsx`
- `src/shell/internal/mobile-bottom-nav.tsx` ← from `src/shell/mobile/mobile-bottom-nav.tsx`
- `src/shell/internal/mobile-drawers.tsx` ← from `src/shell/mobile/mobile-drawers.tsx`

Adjust relative imports as needed (one level deeper from `internal/`).

- [ ] **Step 2: Update AppShellWorkspace imports**

Open `src/shell/app-shell-workspace.tsx`. Replace the three `./mobile/...` imports with:

```ts
import { MobileBottomNav } from './internal/mobile-bottom-nav.js';
import { MobileDrawers } from './internal/mobile-drawers.js';
import { MobileHeader } from './internal/mobile-header.js';
```

Update the JSX to use the renamed components (drop the `Internal` suffix in callsites).

- [ ] **Step 3: Delete the old files**

```bash
rm -r src/shell/mobile/
rm src/shell/shell-auth-frame.tsx \
   src/shell/shell-auth-frame.test.tsx \
   src/shell/shell-auth-frame.stories.tsx
```

- [ ] **Step 4: Update src/shell/index.ts**

Open `src/shell/index.ts`. Remove these export lines:

```ts
export { MobileBottomNav } from './mobile/mobile-bottom-nav.js';
export { MobileDrawers } from './mobile/mobile-drawers.js';
export { MobileHeader } from './mobile/mobile-header.js';
export type {
  ShellAuthFrameProps,
  ShellAuthTheme,
  ShellAuthThemeToggleProps,
} from './shell-auth-frame.js';
export { ShellAuthFrame, ShellAuthThemeToggle } from './shell-auth-frame.js';
```

Also remove the `MobileBottomNavItem` type from the type re-exports if it is only used by the deleted MobileBottomNav.

Add new exports if any are needed for AppShell variants (the `AppShellVariant`, `AppShellAuthConfig`, etc. types from `types.ts`):

```ts
export type {
  AppShellAuthConfig,
  AppShellContextRailConfig,
  AppShellIconRailConfig,
  AppShellRightPanelConfig,
  AppShellVariant,
} from './types.js';
```

- [ ] **Step 5: Run typecheck**

Run: `pnpm typecheck`
Expected: PASS. Any callsite that referenced the deleted exports must now use `<AppShell variant="..." />`.

- [ ] **Step 6: Run all tests**

Run: `pnpm test`
Expected: PASS. The deleted components had their own tests; those test files are also deleted.

- [ ] **Step 7: Run Storybook to confirm no broken stories**

Run: `pnpm storybook`
Expected: no error overlays. Stop the dev server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor(shell): delete public mobile + auth components (now internal to AppShell)"
```

---

## Phase 5 — Enable enforcement

### Task 16: Switch check:stories from warn to fail

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Drop the `--warn` flag**

Open `package.json`. Change the `check:stories` script from:

```json
"check:stories": "node scripts/check-stories.mjs --warn",
```

to:

```json
"check:stories": "node scripts/check-stories.mjs",
```

- [ ] **Step 2: Run check:stories — must pass cleanly**

Run: `pnpm check:stories`
Expected: zero output, exit code 0. If any violation remains, fix the offending story (rename, restructure, or split) before continuing.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "ci: switch check:stories from warn-only to failing"
```

---

## Phase 6 — Release

### Task 17: Final verification (storybook build + tests + typecheck)

- [ ] **Step 1: Run the full quality gate**

Run: `pnpm quality`
Expected: PASS — lint, typecheck, lint:tokens, test all green.

- [ ] **Step 2: Build Storybook to confirm static build succeeds**

Run: `pnpm storybook:build`
Expected: build completes successfully, output in `storybook-static/`.

- [ ] **Step 3: Build the package**

Run: `pnpm build`
Expected: `dist/` is produced cleanly. No type errors.

- [ ] **Step 4: Confirm the public surface dropped the deleted exports**

Run: `grep -E "MobileHeader|MobileBottomNav|MobileDrawers|ShellAuthFrame" dist/index.d.ts dist/shell/index.d.ts`
Expected: no matches.

---

### Task 18: Create changeset for major bump

**Files:**
- Create: `.changeset/storybook-cleanup.md`

- [ ] **Step 1: Create the changeset file**

Create `.changeset/storybook-cleanup.md`:

```markdown
---
"@medalsocial/meda": major
---

Storybook cleanup and AppShell unification.

**Breaking changes:**
- `<AppShell>` now requires a `variant` prop: `"auth" | "workspace" | "chat"`. Composition is config-driven via `iconRail`, `contextRail`, `rightPanel`, `globalActions`, and `auth` props.
- `MobileHeader`, `MobileBottomNav`, `MobileDrawers`, `ShellAuthFrame`, and `ShellAuthThemeToggle` are removed. Their behavior is now internal to `<AppShell variant="auth">` and `<AppShell variant="workspace">`. The viewport switch is automatic.

**New:**
- Chromatic viewport modes (`desktop`, `ipad`, `mobile`) configured in `.storybook/preview.ts`.
- `pnpm check:stories` lint script enforces story authoring conventions (banned export names, banned parameter shapes, story budget per file).
- `docs/STORIES.md` authoring guide.

**Migration:**
Replace hand-composed shells with the new variant API:

```tsx
// Before
<AppShell>
  <ShellHeader />
  <MobileHeader />
  <AppShellBody>
    <IconRail mainItems={items} />
    <ContextRail module={module} />
    <ShellMain>{children}</ShellMain>
    <RightPanel panelViews={views} />
  </AppShellBody>
  <MobileBottomNav />
  <MobileDrawers menuItems={items} module={module} panelViews={views} />
</AppShell>

// After
<AppShell
  variant="workspace"
  iconRail={{ mainItems: items }}
  contextRail={{ appId: 'inbox', module }}
  rightPanel={{ panelViews: views }}
>
  {children}
</AppShell>
```
```

- [ ] **Step 2: Verify changeset is valid**

Run: `pnpm changeset status`
Expected: shows the pending major bump for `@medalsocial/meda`.

- [ ] **Step 3: Commit**

```bash
git add .changeset/storybook-cleanup.md
git commit -m "chore(changeset): major bump for storybook cleanup + AppShell unification"
```

---

### Task 19: Open PR and accept Chromatic baselines

- [ ] **Step 1: Push the branch and open a PR to `dev`**

Run:

```bash
git push -u origin HEAD
gh pr create --base dev --title "Storybook cleanup and AppShell unification (major)" --body "$(cat <<'EOF'
## Summary
- Story tree cut from ~120 to ~30 via Chromatic modes + control-driven variants
- AppShell becomes a family of shells: variant="auth" | "workspace" | "chat"
- Mobile chrome is now internal to AppShell (no more hand-composition)
- Banned-pattern lint script + STORIES.md authoring guide

Spec: docs/superpowers/specs/2026-04-28-storybook-cleanup-design.md

## Test plan
- [ ] pnpm quality passes
- [ ] pnpm storybook:build succeeds
- [ ] pnpm check:stories exits 0
- [ ] Chromatic baselines reviewed and accepted (most snapshots are net-new at iPad/mobile, not changes)
- [ ] Manual verification: each AppShell variant renders correctly at desktop/iPad/mobile via the toolbar viewport toggle
EOF
)"
```

- [ ] **Step 2: Wait for Chromatic to finish, then accept baselines**

Open the Chromatic build linked from the PR. Most snapshots are net-new (iPad and mobile at the new viewports). Visually review each new baseline and accept.

- [ ] **Step 3: After review, merge to `dev`, then open the dev → prod release PR per the standard release flow**

Per the package's release pipeline (`release.yml` + Changesets), merging to `prod` will open the Changesets "Release PR." Merging that PR triggers the npm publish via OIDC.

---

## Self-Review

This plan has been checked against the spec for coverage, placeholders, and type consistency. Known surfaces requiring engineer judgment during execution:

- Task 6 Step 3: data-testid additions to `icon-rail.tsx`, `context-rail.tsx`, etc. — only add if not already present, and if present use the existing testid value in the test instead.
- Task 7 Step 3: porting `ShellAuthFrame` JSX — read the actual source (only first 80 lines were inspected during planning) and copy the full structure, not just the truncated version in this plan.
- Task 12 Steps 1-2: Inspector and TimelineTape `args` are illustrative — adapt to the real component prop signatures by reading their `.tsx` source first.
- Task 14: ignore wrapping locations are described semantically; locate the actual JSX subtrees by reading each component file.
- Task 15 Step 1: copying the full mobile component logic into `src/shell/internal/` — preserve the exact JSX, only adjust import paths.
