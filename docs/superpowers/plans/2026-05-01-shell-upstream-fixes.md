# Shell Upstream Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the remaining Meda shell upstream issues: stable provider callbacks, stable panel-view registration, smarter ContextRail defaults, and `matchMedia`-safe viewport detection.

**Architecture:** Keep provider state objects reactive while making exported action functions stable. Move ContextRail behavior to explicit typed options with better defaults, and route those options through AppShell. Keep docs, Storybook, demo page, changeset, and tracked `dist` in sync.

**Tech Stack:** React 19, TypeScript, Vitest + Testing Library, Biome, Changesets, Vite demo, package build script.

---

## File Structure

- Modify `src/shell/shell-provider.tsx`: stabilize panel action callbacks and `panelViews.register`.
- Modify `src/shell/shell-provider.test.tsx`: add regression tests for `panel.focus` and `panelViews.register` identities.
- Modify `src/shell/use-shell-viewport.ts`: safely handle missing `window.matchMedia`.
- Modify `src/shell/use-shell-viewport.test.ts`: add missing-`matchMedia` regression test.
- Modify `src/shell/types.ts`: add `ContextRailHeader` / `ContextRailScroll` types and pass-through fields on `AppShellContextRailConfig`.
- Modify `src/shell/context-rail.tsx`: implement `header` and `scroll` props plus scroll area structure.
- Modify `src/shell/context-rail.test.tsx`: test new ContextRail defaults and explicit controls.
- Modify `src/shell/app-shell-workspace.tsx`: pass context rail `header` and `scroll` config into `ContextRail`.
- Modify `src/shell/app-shell-workspace.test.tsx`: verify pass-through from AppShell workspace config.
- Modify `src/shell/index.ts`: export new public ContextRail types.
- Modify docs/demo files: `README.md`, `src/__stories__/docs/Adoption.mdx`, `src/__stories__/docs/Installation.mdx`, `src/shell/app-shell.stories.tsx`, and `demo/src/App.tsx`.
- Create `.changeset/shell-context-rail-defaults.md`: breaking changeset for ContextRail defaults.
- Regenerate tracked output under `dist/` with `pnpm build`; inspect any generated registry changes before staging them.

---

### Task 1: Stabilize Provider Function Identities

**Files:**
- Modify: `src/shell/shell-provider.test.tsx`
- Modify: `src/shell/shell-provider.tsx`

- [ ] **Step 1: Add failing provider identity tests**

In `src/shell/shell-provider.test.tsx`, add the following tests inside `describe('MedaShellProvider — panel.focus', ...)`, after the existing `panel.focus — opens panel from closed and sets activeView` test:

```tsx
  it('panel.focus identity remains stable after focus updates layout state', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    const firstFocus = result.current.panel.focus;

    act(() => {
      result.current.panel.focus('ai');
    });

    expect(result.current.panel.activeView).toBe('ai');
    expect(result.current.panel.focus).toBe(firstFocus);
  });

  it('panel action identities remain stable after panel state updates', () => {
    const { result } = renderHook(() => useMedaShell(), {
      wrapper: makePanelWrapper('closed'),
    });

    const firstActions = {
      setMode: result.current.panel.setMode,
      setActiveView: result.current.panel.setActiveView,
      setWidth: result.current.panel.setWidth,
      open: result.current.panel.open,
      close: result.current.panel.close,
      toggle: result.current.panel.toggle,
      focus: result.current.panel.focus,
    };

    act(() => {
      result.current.panel.setWidth(460);
      result.current.panel.focus('ai');
      result.current.panel.toggle();
    });

    expect(result.current.panel.setMode).toBe(firstActions.setMode);
    expect(result.current.panel.setActiveView).toBe(firstActions.setActiveView);
    expect(result.current.panel.setWidth).toBe(firstActions.setWidth);
    expect(result.current.panel.open).toBe(firstActions.open);
    expect(result.current.panel.close).toBe(firstActions.close);
    expect(result.current.panel.toggle).toBe(firstActions.toggle);
    expect(result.current.panel.focus).toBe(firstActions.focus);
  });
```

In the same file, add this new describe block after the `MedaShellProvider — panel helper methods` block:

```tsx
describe('MedaShellProvider — panelViews.register identity', () => {
  const routeViews = [
    {
      id: 'route-view',
      label: 'Route View',
      icon: Menu,
      render: () => <div>Route view</div>,
    },
  ];

  it('panelViews.register identity remains stable after registrations change', () => {
    const { result } = renderHook(() => useMedaShell(), { wrapper: Wrapper });

    const firstRegister = result.current.panelViews.register;
    let cleanup: (() => void) | undefined;

    act(() => {
      cleanup = result.current.panelViews.register('route', routeViews, 'route-view');
    });

    expect(result.current.panelViews.registrations).toHaveLength(1);
    expect(result.current.panelViews.register).toBe(firstRegister);

    act(() => {
      cleanup?.();
    });

    expect(result.current.panelViews.registrations).toHaveLength(0);
    expect(result.current.panelViews.register).toBe(firstRegister);
  });
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run:

```bash
pnpm exec vitest run --environment jsdom src/shell/shell-provider.test.tsx
```

Expected: the new tests fail because `panel.focus` and the other panel action functions change identity after state updates, and `panelViews.register` changes identity after registrations change.

- [ ] **Step 3: Implement stable panel callbacks**

In `src/shell/shell-provider.tsx`, replace the current inline `panel` methods with stable callbacks before the `const panel = useMemo(...)` block:

```tsx
  const setPanelMode = useCallback(
    (mode: PanelMode) =>
      setLayoutState((prev) => ({
        ...prev,
        rightPanel: { ...prev.rightPanel, mode },
      })),
    [setLayoutState]
  );

  const setPanelActiveView = useCallback(
    (activeView: string | null) =>
      setLayoutState((prev) => ({
        ...prev,
        rightPanel: { ...prev.rightPanel, activeView },
      })),
    [setLayoutState]
  );

  const setPanelWidth = useCallback(
    (width: number) =>
      setLayoutState((prev) => ({
        ...prev,
        rightPanel: { ...prev.rightPanel, width },
      })),
    [setLayoutState]
  );

  const openPanel = useCallback(() => {
    if (isMobile) setMobileDrawerOpen('panels-drawer');
    setLayoutState((prev) => ({
      ...prev,
      rightPanel: {
        ...prev.rightPanel,
        mode: prev.rightPanel.mode === 'closed' ? 'panel' : prev.rightPanel.mode,
      },
    }));
  }, [isMobile, setLayoutState]);

  const closePanel = useCallback(() => {
    if (isMobile) setMobileDrawerOpen((open) => (open === 'panels-drawer' ? null : open));
    setLayoutState((prev) => ({
      ...prev,
      rightPanel: { ...prev.rightPanel, mode: 'closed' },
    }));
  }, [isMobile, setLayoutState]);

  const togglePanel = useCallback(() => {
    if (isMobile) {
      setMobileDrawerOpen((open) => (open === 'panels-drawer' ? null : 'panels-drawer'));
    }
    setLayoutState((prev) => ({
      ...prev,
      rightPanel: {
        ...prev.rightPanel,
        mode: prev.rightPanel.mode === 'closed' ? 'panel' : 'closed',
      },
    }));
  }, [isMobile, setLayoutState]);

  const focusPanel = useCallback(
    (viewId: string) =>
      setLayoutState((prev) => {
        const nextMode: PanelMode =
          prev.rightPanel.mode === 'closed' ? 'panel' : prev.rightPanel.mode;
        return {
          ...prev,
          rightPanel: { ...prev.rightPanel, mode: nextMode, activeView: viewId },
        };
      }),
    [setLayoutState]
  );
```

Then rewrite the `panel` memo to use those callbacks:

```tsx
  const panel = useMemo(
    () => ({
      mode: layoutState.rightPanel.mode,
      activeView: layoutState.rightPanel.activeView,
      width: layoutState.rightPanel.width,
      setMode: setPanelMode,
      setActiveView: setPanelActiveView,
      setWidth: setPanelWidth,
      open: openPanel,
      close: closePanel,
      toggle: togglePanel,
      focus: focusPanel,
    }),
    [
      layoutState.rightPanel.mode,
      layoutState.rightPanel.activeView,
      layoutState.rightPanel.width,
      setPanelMode,
      setPanelActiveView,
      setPanelWidth,
      openPanel,
      closePanel,
      togglePanel,
      focusPanel,
    ]
  );
```

- [ ] **Step 4: Stabilize `panelViews.register` exposure**

In `src/shell/shell-provider.tsx`, keep `registerPanelViews` as-is and update the `panelViews` memo dependency list so the `register` function is not recreated as a consequence of registration state changes:

```tsx
  const panelViews = useMemo(
    () => ({
      registrations: panelViewRegistrations,
      register: registerPanelViews,
    }),
    [panelViewRegistrations, registerPanelViews]
  );
```

The object still changes because `registrations` changes. The important behavior is that `panelViews.register` is the exact `registerPanelViews` callback and remains referentially stable. The test in Step 1 verifies this.

- [ ] **Step 5: Run provider tests and verify they pass**

Run:

```bash
pnpm exec vitest run --environment jsdom src/shell/shell-provider.test.tsx
```

Expected: all tests in `src/shell/shell-provider.test.tsx` pass.

- [ ] **Step 6: Commit provider stability fix**

Run:

```bash
git add src/shell/shell-provider.tsx src/shell/shell-provider.test.tsx
git commit -m "Fix shell provider callback identities"
```

---

### Task 2: Make `useShellViewport()` Safe Without `matchMedia`

**Files:**
- Modify: `src/shell/use-shell-viewport.test.ts`
- Modify: `src/shell/use-shell-viewport.ts`

- [ ] **Step 1: Add failing viewport fallback test**

In `src/shell/use-shell-viewport.test.ts`, add this test before the existing SSR-safe test:

```ts
  it("returns 'desktop' when matchMedia is unavailable", () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: undefined,
    });

    const { result } = renderHook(() => useShellViewport());
    act(() => {});

    expect(result.current).toBe('desktop');
  });
```

- [ ] **Step 2: Run viewport tests and verify failure**

Run:

```bash
pnpm exec vitest run --environment jsdom src/shell/use-shell-viewport.test.ts
```

Expected: the new test fails because `detectViewport()` or the effect calls `window.matchMedia` when it is undefined.

- [ ] **Step 3: Implement safe `matchMedia` helper**

Replace `detectViewport()` in `src/shell/use-shell-viewport.ts` with this helper-driven implementation:

```ts
type MatchMedia = (query: string) => MediaQueryList;

function getMatchMedia(): MatchMedia | null {
  if (typeof window === 'undefined') return null;
  if (typeof window.matchMedia !== 'function') return null;
  return window.matchMedia.bind(window);
}

function detectViewport(matchMedia: MatchMedia | null = getMatchMedia()): ShellViewport {
  if (!matchMedia) return 'desktop';
  for (const [band, query] of Object.entries(BREAKPOINTS) as [ShellViewport, string][]) {
    if (matchMedia(query).matches) return band;
  }
  return 'desktop';
}
```

Update the effect to no-op listener setup when `matchMedia` is missing:

```ts
  useEffect(() => {
    const matchMedia = getMatchMedia();
    setViewport(detectViewport(matchMedia));
    if (!matchMedia) return;

    const cleanups = (Object.entries(BREAKPOINTS) as [ShellViewport, string][]).map(
      ([band, query]) => {
        const mql = matchMedia(query);
        const onChange = () => {
          if (mql.matches) setViewport(band);
        };
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
      }
    );

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);
```

- [ ] **Step 4: Run viewport tests and verify pass**

Run:

```bash
pnpm exec vitest run --environment jsdom src/shell/use-shell-viewport.test.ts
```

Expected: all `useShellViewport` tests pass.

- [ ] **Step 5: Commit viewport fallback fix**

Run:

```bash
git add src/shell/use-shell-viewport.ts src/shell/use-shell-viewport.test.ts
git commit -m "Handle missing matchMedia in shell viewport hook"
```

---

### Task 3: Add ContextRail Header And Scroll API

**Files:**
- Modify: `src/shell/types.ts`
- Modify: `src/shell/context-rail.test.tsx`
- Modify: `src/shell/context-rail.tsx`
- Modify: `src/shell/app-shell-workspace.test.tsx`
- Modify: `src/shell/app-shell-workspace.tsx`
- Modify: `src/shell/index.ts`

- [ ] **Step 1: Add public ContextRail types**

In `src/shell/types.ts`, add these exports near `ShellViewport`:

```ts
export type ContextRailHeader = 'auto' | 'visible' | 'hidden';
export type ContextRailScroll = 'auto' | 'none';
```

Extend `AppShellContextRailConfig`:

```ts
export interface AppShellContextRailConfig {
  appId: string;
  module: ContextModule;
  activeItemId?: string;
  header?: ContextRailHeader;
  scroll?: ContextRailScroll;
}
```

In `src/shell/index.ts`, export the new types from `./types.js` in the existing type export block:

```ts
  ContextRailHeader,
  ContextRailScroll,
```

- [ ] **Step 2: Add failing ContextRail tests**

In `src/shell/context-rail.test.tsx`, add this fixture below `MODULE`:

```tsx
const CUSTOM_RENDER_MODULE: ContextModule = {
  id: 'custom',
  label: 'Custom Rail',
  description: 'Custom rail description',
  render: () => (
    <section>
      <h2>Consumer heading</h2>
      <p>Consumer custom content</p>
    </section>
  ),
};
```

Add this describe block after `describe('ContextRail — module items rendering', ...)`:

```tsx
describe('ContextRail — header and scroll defaults', () => {
  it('renders the visible Meda header by default for item navigation rails', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} />
      </Wrapper>
    );

    expect(screen.getByRole('heading', { name: 'Mail' })).toBeInTheDocument();
    expect(screen.getByText('Inbox + sent')).toBeInTheDocument();
  });

  it('hides the visible Meda header by default for custom render rails', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={CUSTOM_RENDER_MODULE} />
      </Wrapper>
    );

    expect(screen.queryByRole('heading', { name: 'Custom Rail' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Consumer heading' })).toBeInTheDocument();
    expect(screen.getByLabelText('Custom Rail')).toBeInTheDocument();
  });

  it('header=\"visible\" renders the Meda header for custom render rails', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={CUSTOM_RENDER_MODULE} header="visible" />
      </Wrapper>
    );

    expect(screen.getByRole('heading', { name: 'Custom Rail' })).toBeInTheDocument();
    expect(screen.getByText('Custom rail description')).toBeInTheDocument();
  });

  it('header=\"hidden\" hides the Meda header for item navigation rails', () => {
    render(
      <Wrapper>
        <ContextRail appId="mail" module={MODULE} header="hidden" />
      </Wrapper>
    );

    expect(screen.queryByRole('heading', { name: 'Mail' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /inbox/i })).toBeInTheDocument();
  });

  it('uses a vertical scroll container by default', () => {
    const { container } = render(
      <Wrapper>
        <ContextRail appId="mail" module={CUSTOM_RENDER_MODULE} />
      </Wrapper>
    );

    const scrollArea = container.querySelector('[data-meda-context-rail-scroll-area]');
    expect(scrollArea).toHaveClass('overflow-y-auto');
    expect(scrollArea).toHaveClass('overflow-x-hidden');
  });

  it('scroll=\"none\" disables the built-in vertical scroll container', () => {
    const { container } = render(
      <Wrapper>
        <ContextRail appId="mail" module={CUSTOM_RENDER_MODULE} scroll="none" />
      </Wrapper>
    );

    const scrollArea = container.querySelector('[data-meda-context-rail-scroll-area]');
    expect(scrollArea).not.toHaveClass('overflow-y-auto');
    expect(scrollArea).toHaveClass('overflow-hidden');
  });
});
```

- [ ] **Step 3: Run ContextRail tests and verify failure**

Run:

```bash
pnpm exec vitest run --environment jsdom src/shell/context-rail.test.tsx
```

Expected: the new tests fail because `header`, `scroll`, and `data-meda-context-rail-scroll-area` are not implemented.

- [ ] **Step 4: Implement ContextRail props and layout**

In `src/shell/context-rail.tsx`, import the new types:

```ts
import type {
  ContextModule,
  ContextRailHeader,
  ContextRailScroll,
  ShellLinkRenderArgs,
  ShellRenderContext,
} from './types.js';
```

Extend `ContextRailProps`:

```ts
  header?: ContextRailHeader;
  scroll?: ContextRailScroll;
```

Default the props in the function signature:

```tsx
export function ContextRail({
  appId,
  module,
  hidden = false,
  collapsible = true,
  activeItemId,
  renderLink,
  header = 'auto',
  scroll = 'auto',
  className,
}: ContextRailProps) {
```

After `const items = module?.items ?? [];`, add:

```ts
  const hasRender = typeof module?.render === 'function';
  const showHeader =
    header === 'visible' || (header === 'auto' && items.length > 0 && !hasRender);
```

Replace the current inner wrapper and header/body rendering with this structure:

```tsx
      <div
        className="flex h-full min-w-0 flex-col overflow-hidden"
        aria-hidden={collapsed}
        inert={collapsed || undefined}
      >
        {showHeader && (
          <div className="shrink-0 border-b border-shell-border px-4 py-3">
            <h2 className="text-sm font-semibold text-foreground">{module.label}</h2>
            {module.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{module.description}</p>
            )}
          </div>
        )}

        <div
          data-meda-context-rail-scroll-area=""
          className={cn(
            'min-h-0 flex-1',
            scroll === 'auto' ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
          )}
        >
          {items.length > 0 && (
            <nav aria-label={`${module.label} navigation`} className="flex flex-col gap-0.5 p-2">
              {items.map((item) => {
                const isActive = item.id === activeItemId;
                const klass = cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                );
                const IconComp = item.icon;
                const inner = (
                  <>
                    <IconComp size={16} aria-hidden="true" className="shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.shortcut && (
                      <kbd className="ml-auto font-mono text-[10px] text-muted-foreground">
                        {item.shortcut}
                      </kbd>
                    )}
                  </>
                );

                const linkProps = {
                  href: item.to,
                  'aria-current': isActive ? 'page' : undefined,
                  className: klass,
                  children: inner,
                } satisfies AnchorHTMLAttributes<HTMLAnchorElement>;

                if (renderLink) {
                  return (
                    <Fragment key={item.id}>
                      {renderLink({ item, isActive, className: klass, children: inner, linkProps })}
                    </Fragment>
                  );
                }
                return <a key={item.id} {...linkProps} />;
              })}
            </nav>
          )}
          {module.render?.({ workspaceId: ctx.workspace.id, appId })}
        </div>
      </div>
```

- [ ] **Step 5: Run ContextRail tests and verify pass**

Run:

```bash
pnpm exec vitest run --environment jsdom src/shell/context-rail.test.tsx
```

Expected: all ContextRail tests pass.

- [ ] **Step 6: Add AppShell pass-through test**

In `src/shell/app-shell-workspace.test.tsx`, add this test near the existing desktop ContextRail tests:

```tsx
  it('passes contextRail header and scroll options to ContextRail on desktop', () => {
    (useShellViewport as ReturnType<typeof vi.fn>).mockReturnValue('desktop');

    render(
      <Provider>
        <AppShellWorkspace
          contextRail={{
            appId: 'a',
            header: 'hidden',
            scroll: 'none',
            module: {
              id: 'custom',
              label: 'Custom Module',
              items: [{ id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' }],
            },
          }}
        >
          <div>Main</div>
        </AppShellWorkspace>
      </Provider>
    );

    expect(screen.queryByRole('heading', { name: 'Custom Module' })).not.toBeInTheDocument();
    const rail = screen.getByLabelText('Custom Module');
    const scrollArea = rail.querySelector('[data-meda-context-rail-scroll-area]');
    expect(scrollArea).toHaveClass('overflow-hidden');
  });
```

- [ ] **Step 7: Pass ContextRail config through AppShellWorkspace**

In `src/shell/app-shell-workspace.tsx`, update the `ContextRail` call:

```tsx
          <ContextRail
            appId={contextRail.appId}
            module={contextRail.module}
            activeItemId={contextRail.activeItemId}
            header={contextRail.header}
            scroll={contextRail.scroll}
          />
```

- [ ] **Step 8: Run AppShell workspace tests**

Run:

```bash
pnpm exec vitest run --environment jsdom src/shell/app-shell-workspace.test.tsx
```

Expected: all AppShell workspace tests pass.

- [ ] **Step 9: Commit ContextRail API**

Run:

```bash
git add src/shell/types.ts src/shell/index.ts src/shell/context-rail.tsx src/shell/context-rail.test.tsx src/shell/app-shell-workspace.tsx src/shell/app-shell-workspace.test.tsx
git commit -m "Update ContextRail header and scroll defaults"
```

---

### Task 4: Update Docs, Stories, Demo Page, And Changeset

**Files:**
- Modify: `README.md`
- Modify: `src/__stories__/docs/Adoption.mdx`
- Modify: `src/__stories__/docs/Installation.mdx`
- Modify: `src/shell/app-shell.stories.tsx`
- Modify: `demo/src/App.tsx`
- Create: `.changeset/shell-context-rail-defaults.md`

- [ ] **Step 1: Update README usage notes**

In `README.md`, add this paragraph near the existing AppShell/mobile workspace notes:

```md
`ContextRail` is usable for both navigation rails and custom rendered rails. Navigation rails show Meda's label header by default. Custom rendered rails hide the automatic visible header by default so consumers can render their own heading without duplication. Rail bodies scroll vertically by default; use `contextRail={{ header: "visible" }}` or `contextRail={{ scroll: "none" }}` when you need explicit control.
```

- [ ] **Step 2: Update Storybook docs**

In `src/__stories__/docs/Adoption.mdx`, add this section after the workspace shell composition section:

```mdx
### Context rail defaults

`ContextRail` scrolls overflowing content by default. Navigation-style rails keep Meda's visible label header, while custom rendered rails hide that automatic header so the rendered content can own its heading.

```tsx
<AppShell
  variant="workspace"
  contextRail={{
    appId: "inbox",
    module: {
      id: "customer",
      label: "Customer",
      render: () => <CustomerRail />,
    },
    header: "hidden",
    scroll: "auto",
  }}
>
  <InboxRoute />
</AppShell>
```

Use `header="visible"` to force Meda's label header back on, or `scroll="none"` when a custom rail manages its own scroll container.
```

In `src/__stories__/docs/Installation.mdx`, add this sentence to the testing or shell notes section:

```mdx
`useShellViewport()` falls back to `"desktop"` when `window.matchMedia` is unavailable, so tests only need to mock `matchMedia` when they assert a specific responsive band.
```

- [ ] **Step 3: Update shell story examples**

In `src/shell/app-shell.stories.tsx`, replace the current `DYNAMIC_INBOX_MODULE` declaration with this custom rendered rail fixture:

```tsx
const DYNAMIC_INBOX_MODULE: ContextModule = {
  ...INBOX_MODULE,
  render: () => (
    <div className="space-y-3 px-3 py-4 text-sm">
      <h2 className="text-sm font-semibold text-foreground">Conversation queue</h2>
      <p className="text-muted-foreground">
        Custom rail content owns its heading and scrolls inside the rail by default.
      </p>
      <div className="rounded-md border border-border bg-background px-3 py-2 text-foreground">
        6 priority conversations
      </div>
    </div>
  ),
};
```

Keep `WorkspaceWithAdoptionHooks` wired to:

```tsx
contextRail={{
  appId: 'inbox',
  module: DYNAMIC_INBOX_MODULE,
  activeItemId: 'inbox',
}}
```

Expected visual behavior: the story shows one `Conversation queue` heading inside the rail and no duplicate Meda `Inbox` header above it.

- [ ] **Step 4: Update demo/marketing page copy**

In `demo/src/App.tsx`, insert this item in `registryItems` immediately after `meda-shell-state`:

```ts
{
  name: 'meda-context-rail',
  title: 'Context Rail',
  description:
    'Navigation rails keep Meda headers, custom rails own their headings, and long rail content scrolls by default.',
}
```

Keep `SITE_VERSION = \`v${packageJson.version}\`;` unchanged so the page continues to match the package version automatically.

Run this search after the docs edits:

```bash
rg "ContextRail|contextRail|matchMedia|rail wrapper" src/recipes/next.ts dist/recipes/next.js
```

Expected: no stale recipe text tells consumers to wrap ContextRail content for scrolling or to stub `matchMedia` for every viewport test. If the search returns a stale recipe sentence, update `src/recipes/next.ts` and rebuild generated recipes in Task 5.

- [ ] **Step 5: Add breaking changeset**

Create `.changeset/shell-context-rail-defaults.md`:

```md
---
"@medalsocial/meda": major
---

Update ContextRail defaults and shell stability.

ContextRail now scrolls overflowing rail content by default. Navigation-style rails still show Meda's visible label header by default, while custom rendered rails hide the automatic visible header so consumers can render their own heading without duplicate labels. Use `header="visible"` to force Meda's header, `header="hidden"` to suppress it, and `scroll="none"` to manage overflow manually.

This release also stabilizes shell provider action identities and makes `useShellViewport()` fall back to `"desktop"` when `window.matchMedia` is unavailable.
```

- [ ] **Step 6: Run docs/story/demo checks**

Run:

```bash
pnpm exec vitest run --environment jsdom src/recipes/next.test.ts src/shell/app-shell-workspace.test.tsx src/shell/context-rail.test.tsx
pnpm demo:build
```

Expected: targeted tests pass and demo build exits `0`.

- [ ] **Step 7: Commit docs/demo/changeset**

Run:

```bash
git add README.md src/__stories__/docs/Adoption.mdx src/__stories__/docs/Installation.mdx src/shell/app-shell.stories.tsx demo/src/App.tsx .changeset/shell-context-rail-defaults.md
git commit -m "Document shell upstream fixes"
```

---

### Task 5: Regenerate Dist And Run Full Verification

**Files:**
- Modify generated files under `dist/`
- Modify generated registry files only if the build updates them

- [ ] **Step 1: Build package output**

Run:

```bash
pnpm build
```

Expected: command exits `0` and tracked `dist/` output updates for changed shell files and public types.

- [ ] **Step 2: Inspect generated diff**

Run:

```bash
git status --short
git diff --stat
```

Expected: generated changes are limited to `dist/` outputs corresponding to source changes, plus intentional source/docs/changeset files from previous tasks. No unrelated cache, lockfile, or local server output appears.

- [ ] **Step 3: Run targeted regression suite**

Run:

```bash
pnpm exec vitest run --environment jsdom src/shell/shell-provider.test.tsx src/shell/use-shell-viewport.test.ts src/shell/context-rail.test.tsx src/shell/app-shell-workspace.test.tsx
```

Expected: all targeted shell tests pass.

- [ ] **Step 4: Run full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm demo:build
pnpm build
git diff --check
```

Expected:

- `pnpm test` passes all test files.
- `pnpm lint` exits `0`; existing warning output is acceptable only if the command exits `0`.
- `pnpm demo:build` exits `0`.
- `pnpm build` exits `0`.
- `git diff --check` exits `0`.

- [ ] **Step 5: Commit generated output**

Run:

```bash
git add dist
git commit -m "Regenerate shell package output"
```

If `git status --short` shows source or docs files still uncommitted because an earlier task did not commit them, include those exact files in the same commit only after confirming they belong to this implementation.

- [ ] **Step 6: Final local status check**

Run:

```bash
git status --short --branch
```

Expected: branch is ahead of `origin/dev` with no unstaged or staged changes.

---

## Self-Review Checklist

- Spec coverage:
  - Provider identity churn is covered by Task 1.
  - PanelViews register identity churn is covered by Task 1.
  - ContextRail scroll/default header behavior is covered by Task 3.
  - AppShell contextRail pass-through is covered by Task 3.
  - `matchMedia` fallback is covered by Task 2.
  - README, Storybook docs, shell stories, demo page, and changeset are covered by Task 4.
  - Dist regeneration and full verification are covered by Task 5.
- Placeholder scan: no placeholder tokens or unspecified test instructions remain.
- Type consistency:
  - `ContextRailHeader` and `ContextRailScroll` are defined in `src/shell/types.ts`.
  - `ContextRailProps.header` and `ContextRailProps.scroll` use those types.
  - `AppShellContextRailConfig.header` and `.scroll` use the same public types.
  - `data-meda-context-rail-scroll-area` is used consistently in implementation and tests.
