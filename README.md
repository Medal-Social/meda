# @medalsocial/meda

Shared UI shell and runtime primitives — the navigation chrome, panels, auth controls, recipes, theme bridges, command palette, and workbench layout that power Medal's apps. Published as Apache-2.0.

![npm](https://img.shields.io/npm/v/@medalsocial/meda)

## Install

```bash
pnpm add @medalsocial/meda lucide-react
```

Peer deps: `react >= 19`, `react-dom >= 19`, and `lucide-react`.

## Tailwind CSS v4 setup

Meda ships a `styles.css` with its design tokens. Import it once in your entry stylesheet or entry script:

```css
@import 'tailwindcss';
@import '@medalsocial/meda/styles.css';

:root {
  /* Consumer overrides go after meda so equal-specificity tokens win by source order. */
  --color-brand-500: oklch(0.62 0.18 245);
  --auth-gradient-primary: var(--color-brand-500);
}

.dark {
  --color-brand-500: oklch(0.72 0.16 245);
}
```

Avoid placing token overrides before the Meda import; `tokens.css` defines the package defaults and later declarations are what override them:

```css
/* Wrong: meda's imported defaults overwrite this block. */
:root {
  --color-brand-500: oklch(0.62 0.18 245);
}

@import '@medalsocial/meda/styles.css';
```

## Usage

Use `AppShell` for the styled shell surface:

```tsx
import { AppShell, MedaShellProvider } from '@medalsocial/meda/shell';
import { Inbox } from 'lucide-react';

export function App() {
  const workspace = { id: 'workspace', name: 'Workspace' };
  const apps = [{ id: 'inbox', label: 'Inbox', icon: Inbox }];

  return (
    <MedaShellProvider workspace={workspace} apps={apps}>
      <AppShell
        variant="workspace"
        iconRail={{
          mainItems: [{ id: 'inbox', label: 'Inbox', icon: Inbox, to: '/inbox' }],
        }}
      >
        {/* your app */}
      </AppShell>
    </MedaShellProvider>
  );
}
```

For framework routing, pass a render callback and forward Meda props:

```tsx
import Link from 'next/link';

<AppShell
  variant="workspace"
  iconRail={{
    mainItems,
    renderLink: ({ item, linkProps }) => <Link {...linkProps} href={item.to} prefetch />,
  }}
  appTabs={{
    renderLink: ({ app, linkProps }) =>
      app.to ? <Link {...linkProps} href={app.to} prefetch /> : <a {...linkProps} />,
  }}
>
  {children}
</AppShell>;
```

Workspace shells also expose chrome-level composition slots:

```tsx
<AppShell
  variant="workspace"
  headerCenter={<SectionTabs />}
  banners={<SystemHealthBanner />}
  mainLayout="fullbleed"
  mainClassName="marketing-main"
  workspace={{
    menuItems: [{ id: 'settings', label: 'Settings', href: '/settings' }],
    menuFooter: <AccountSwitcher />,
  }}
>
  {children}
</AppShell>
```

### Rail header (`headerLayout="rail"`)

By default the desktop header is a `split` grid: the workspace switcher and `headerLeading` share
the left region, and `headerCenter` owns the middle. Because the switcher is as wide as the
workspace name, the leading region both moves per workspace and never gets more than about half
the window. `headerLayout="rail"` swaps in a three-column grid instead — rail column · fill ·
actions:

```tsx
<AppShell
  variant="workspace"
  headerLayout="rail"
  iconRail={{ mainItems, labelVisibility: 'visible' }}
  headerLeading={<SectionTabs />}          // owns the whole fill column
  // Keep the panel views, drop the header's toggle:
  rightPanel={{ panelViews, showToggle: false }}
  globalActions={<NewButton />}
>
  {children}
</AppShell>
```

- Column 1 is exactly the icon rail's width (`--shell-rail-label-width` when
  `iconRail.labelVisibility` is `visible`, `--shell-rail-width` otherwise) and holds the workspace
  switcher in its `tile` variant: the mark centred on the rail's axis with the workspace name
  beneath it, in the icon-rail label type. The dropdown is the chip's, unchanged.
- Column 2 is `headerLeading`, `min-w-0`, and gets every remaining pixel.
- Column 3 is `globalActions` plus the panel toggle.
- `headerCenter` is **ignored** in this layout — there is no centre column.

The tile is metered to **44px** — a 28px mark, a 2px gap and ONE 14px label line, with no vertical
padding — and carries `max-h-full` inside an `overflow-hidden` column. So it fits whatever you set
`--shell-header-height` to, down to 52px (the web app runs 52px under its desktop window-tab
strip), and can never paint past the header:

```css
/* a tighter header — the tile follows it */
:root { --shell-header-height: 52px; }
```

Because the label is truncated to one line — and hidden entirely below 700px viewport height, the
same tier at which every icon-rail label hides — the full workspace name is always recoverable two
other ways: the tile's tooltip, and its accessible name (`"<workspace> workspace menu"`).

Both layouts put `data-meda-shell-header` on the `<header>` (with
`data-meda-header-layout="split" | "rail"`), so consumer CSS and tests can target the header
without depending on its structure.

### Mobile nav: light by app

`mobileNav.activeTo` marks the exact address. Pass `mobileNav.activeId` (the active APP's id) as
well and the dock lights whenever `item.id === activeId`, so it stays lit on every route inside
that app rather than only on its first tab; the workspace sheet then opens with that row expanded
and scrolled into view. `mobileNav.currentFirst` additionally hoists that row to the top of its
group. Omit `activeId` and both surfaces keep comparing against `activeTo` as before.

`workspace.menuItems`, `workspace.menuFooter`, and the theme toggle are available from the mobile Menu drawer. Use `mainLayout`/`mainClassName` when a workspace shell needs the same mobile chrome but a custom main scroll region, such as a full-bleed marketing page. `useCommands()` works from workspace descendants without manually mounting `CommandPalette`; lower-level primitive compositions can still mount `CommandPalette` directly.

`ContextRail` is usable for both navigation rails and custom rendered rails. Navigation rails show Meda's label header by default. Custom rendered rails hide the automatic visible header by default so consumers can render their own heading without duplication. Rail bodies scroll vertically by default; use `contextRail={{ header: "visible" }}` or `contextRail={{ scroll: "none" }}` when you need explicit control.

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
For app-scoped brand tokens:

```ts
import { createMedaThemeCss, defineMedaTheme } from '@medalsocial/meda/theme';

const css = createMedaThemeCss(
  defineMedaTheme({
    appId: 'auto',
    colors: {
      primary: 'var(--hb-brand-500)',
      background: 'var(--hb-base-50)',
    },
    dark: {
      colors: {
        background: 'var(--hb-base-900)',
      },
    },
  })
);
```

Lower-level `ShellStateProvider` and layout parts remain available from `@medalsocial/meda/shell/primitives` for apps that need to own more composition.

See the [demo app](./demo) for a live playground.

## Exports

- `@medalsocial/meda` — curated public API (components + helpers)
- `@medalsocial/meda/shell` — styled shell components and hooks
- `@medalsocial/meda/shell/primitives` — lower-level shell state and layout primitives
- `@medalsocial/meda/auth` — provider-neutral auth controls
- `@medalsocial/meda/auth/better-auth` — optional better-auth adapter
- `@medalsocial/meda/recipes/next` — copyable Next.js adoption recipe metadata
- `@medalsocial/meda/theme` — app-scoped token bridge helpers
- `@medalsocial/meda/marketing` — marketing sections and campaign blocks
- `@medalsocial/meda/styles.css` — design tokens + base styles

## Alternative: shadcn registry

Prefer to copy source into your project instead of installing? The shadcn-compatible registry is served alongside the demo playground on Cloudflare Workers.

```bash
# Once DNS for meda.medalsocial.com is live:
npx shadcn add https://meda.medalsocial.com/r/meda-shell.json
npx shadcn add https://meda.medalsocial.com/r/meda-shell-state.json
npx shadcn add https://meda.medalsocial.com/r/meda-workbench-layout.json
npx shadcn add https://meda.medalsocial.com/r/meda-next-app-shell.json
```

The registry index is at `https://meda.medalsocial.com/registry.json`. Source JSON files live under [`./registry`](./registry) in this repo and are deployed as static assets via Cloudflare Workers — see `wrangler.toml` and `.github/workflows/deploy-worker.yml`.

## Development

```bash
pnpm install
pnpm build             # compile dist/
pnpm test              # vitest (jsdom)
pnpm typecheck
pnpm lint
pnpm registry:validate
pnpm demo:dev          # run the playground locally
pnpm storybook         # http://localhost:6006
pnpm storybook:build   # storybook-static/
pnpm size-limit        # bundle-size gate
```

## Storybook + Chromatic

Stories are colocated as `Component.stories.tsx` next to each primitive. Build
the static bundle with:

```bash
pnpm storybook:build
```

Visual review runs via **Chromatic**. The `Chromatic` GitHub workflow publishes
Storybook on pushes and pull requests targeting `dev` or `prod`, using the
repository secret `CHROMATIC_PROJECT_TOKEN`.

```bash
pnpm chromatic
```

Chromatic handles UI diffs and review state, so visual snapshot baselines are
not committed to this repository.

## Release

Changesets + GitHub Actions (OIDC trusted publishing). Add a changeset with
`pnpm changeset` and merge into `dev`; the version bump lands on `dev` by itself, and a
standing `release: promote dev → prod` pull request is kept open for you. **Approving
that PR is the release** — it merges itself and publishes to npm with provenance.

Need a build before then? Run the `Release` workflow with `mode: snapshot` for a
throwaway prerelease under its own dist-tag.

Full flow, hotfixes and failure handling: [CONTRIBUTING.md → Releasing](./CONTRIBUTING.md#releasing).

## License

Apache-2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
