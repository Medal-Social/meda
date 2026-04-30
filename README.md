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
  workspace={{
    menuItems: [{ id: 'settings', label: 'Settings', href: '/settings' }],
    menuFooter: <AccountSwitcher />,
  }}
>
  {children}
</AppShell>
```

`workspace.menuItems`, `workspace.menuFooter`, and the theme toggle are available from the mobile Menu drawer. `useCommands()` works from workspace descendants without manually mounting `CommandPalette`; lower-level primitive compositions can still mount `CommandPalette` directly.

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

Changesets + GitHub Actions (OIDC trusted publishing). Add a changeset with `pnpm changeset`, merge to the release branch, and the `Release` workflow handles npm publish with provenance.

## License

Apache-2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).
