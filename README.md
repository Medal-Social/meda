# @medalsocial/meda

Shared UI shell and runtime primitives — the navigation chrome, panels, tab bars, command palette, and workbench layout that power Medal's apps. Published as Apache-2.0.

![npm](https://img.shields.io/npm/v/@medalsocial/meda)

## Install

```bash
pnpm add @medalsocial/meda
```

Peer deps: `react >= 19`, `react-dom >= 19`.

## Tailwind CSS v4 setup

Meda ships a `styles.css` with its design tokens. Import it once in your entry stylesheet or entry script:

```css
@import '@medalsocial/meda/styles.css';
```

## Usage

`ShellStateProvider` stores panel/selection state in URL search params and is router-agnostic. You provide a `ShellSearchParamsAdapter` so it can read and update them however your router prefers. A minimal, in-memory adapter:

```tsx
import { useState } from 'react';
import { ShellStateProvider, ShellFrame } from '@medalsocial/meda';

export function App() {
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());

  return (
    <ShellStateProvider
      adapter={{
        searchParams,
        setSearchParams: (updater) => setSearchParams((current) => updater(current)),
      }}
    >
      <ShellFrame>{/* your app */}</ShellFrame>
    </ShellStateProvider>
  );
}
```

For a real app, wire the adapter to your router (e.g. TanStack Router's `useSearch`/`useNavigate`, React Router's `useSearchParams`) so URL changes persist state.

See the [demo app](./demo) for a live playground.

## Exports

- `@medalsocial/meda` — curated public API (components + helpers)
- `@medalsocial/meda/shell` — shell-only subpath
- `@medalsocial/meda/styles.css` — design tokens + base styles

## Alternative: shadcn registry

Prefer to copy source into your project instead of installing? The shadcn-compatible registry lives at [`./registry`](./registry). Serve it statically and run:

```bash
npx shadcn add <registry-url>/r/meda-shell.json
```

## Development

```bash
pnpm install
pnpm build             # compile dist/
pnpm test              # vitest (jsdom)
pnpm registry:validate
pnpm demo:dev          # run the playground locally
```

## Release

Changesets + GitHub Actions (OIDC trusted publishing). Add a changeset with `pnpm changeset`, merge to the release branch, and the `Release` workflow handles npm publish with provenance.

## License

Apache-2.0.
