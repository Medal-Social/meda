# pnpm overrides: what each one is for, and when to delete it

`package.json` → `pnpm.overrides` forces a floor on transitive dependencies that
something in the tree still asks for at a vulnerable version. JSON cannot carry
comments, so the reasoning lives here. **An override without an entry in this table is
a bug** — it is indistinguishable from a leftover, and leftovers are how a tree gets
pinned *below* a version it could otherwise take (see `valibot`, below).

Each override is written as a **range-scoped** selector (`pkg@<x.y.z`), not a bare
package name. That matters: it only rewrites requests inside the vulnerable range, so a
dependency that has already moved past the floor resolves normally and the override
retires itself in practice long before anyone deletes the line.

## Current overrides

| Override | Advisory | Why it exists | Delete when |
|---|---|---|---|
| `@babel/core@<7.29.6` → `^7.29.6` | [GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8) — arbitrary file read via `sourceMappingURL` | Pulled in transitively by the Storybook toolchain | `pnpm why @babel/core` shows every requester asking for `>=7.29.6` |
| `baseline-browser-mapping@<2.11.0` → `^2.11.21` | [GHSA-w5vr-8v7q-w6rv](https://github.com/advisories/GHSA-w5vr-8v7q-w6rv) — process termination on invalid input | Transitive under `browserslist` | `browserslist` floors it above 2.11.0 |
| `brace-expansion@>=3.0.0 <5.0.7` → `^5.0.7` | [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) — exponential-time expansion DoS | Transitive under several glob implementations | every `minimatch`/`glob` in the tree asks for `>=5.0.7` |
| `browserslist@<4.28.7` → `^4.28.9` | [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g) — crash / prototype write via untrusted queries | Transitive under the build toolchain | requesters floor above 4.28.7 |
| `esbuild@>=0.27.3 <0.28.1` → `^0.28.1` | [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr) — arbitrary file read from the dev server | Transitive under Vite and the size-limit preset | Vite and `@size-limit/esbuild` both floor above 0.28.1 |
| `fflate@<0.8.3` → `^0.8.3` | [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98) | Transitive under the Storybook/Chromatic toolchain | requesters floor above 0.8.3 |
| `postcss@<8.5.23` → `^8.5.23` | [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) and [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) — source-map path traversal | Transitive under Vite / Tailwind | requesters floor above 8.5.23 |
| `sharp@<0.35.4` → `^0.35.4` | [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c) and [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj) — inherited libvips/libheif CVEs | Transitive, optional, build-time only | requesters floor above 0.35.4 |
| `undici@>=7.0.0 <7.29.0` → `^7.29.0` | Eleven advisories, worst [GHSA-4cwx-7wf7-3272](https://github.com/advisories/GHSA-4cwx-7wf7-3272) (high) — cross-user disclosure, TLS validation bypass, request smuggling | Transitive under `wrangler`/`miniflare` | requesters floor above 7.29.0 |
| `ws@>=8.0.0 <8.21.0` → `^8.21.0` | [GHSA-96hv-2xvq-fx4p](https://github.com/advisories/GHSA-96hv-2xvq-fx4p) — memory-exhaustion DoS | Transitive under the dev-server stack | requesters floor above 8.21.0 |

Every one of these is a **development-only** path. None of them appears in the published
tarball: `package.json#dependencies` lists ten packages and none is in this table.

> **State note.** The table is the set of overrides in `package.json` at the time of
> writing, **except `valibot@<1.4.2` → `1.4.2`**, which is still in the manifest on this
> branch and is deleted by the dependency-upgrade PR (#225). It is described below rather
> than in the table because it is the worked example of an override that has outlived its
> advisory. Once #225 lands, `package.json` and the table agree exactly.

## The worked example: how an override goes stale

`valibot@<1.4.2` → `1.4.2` was added to close
[GHSA-5qjj-4xww-7phc](https://github.com/advisories/GHSA-5qjj-4xww-7phc), which is fixed
at 1.4.2. Every remaining requester now floors at or above that, so the override does no
security work at all — the tree would resolve to a safe valibot without it.

What it *does* do is pin valibot at **exactly** 1.4.2, because the replacement is a bare
version rather than a range. That became visible when `@storybook/addon-mcp` moved onto
the Storybook 10.6 line and brought `@valibot/to-json-schema` with it, which peers on
`valibot: ^1.5.0` — an unsatisfiable peer created entirely by a dead security pin. The
fix is deletion, not a wider replacement, and it is part of #225.

Two things this illustrates, and the reason the table above exists:

- **Write the replacement as a range** (`^1.4.2`), never a bare version. A bare version
  is a ceiling as well as a floor.
- **An override with no recorded reason cannot be audited.** Nobody could tell this one
  from a live mitigation by reading `package.json`.

## Never needed

- **`js-yaml`.** Six alerts are open against `prod` for js-yaml 3.14.2 / 4.1.1, so it
  looks like a gap in the table. It is not: the dependency sweeps on `dev` removed
  js-yaml from the tree entirely, so there is nothing left to pin. The alerts close when
  `prod` catches up.

## Checking the table is still true

```bash
pnpm audit            # must be clean in every scope
pnpm audit --prod
pnpm audit --dev
pnpm why <package>    # who still asks for the vulnerable range
```

If `pnpm why` shows every requester floored above the override, delete the line, rerun
`pnpm install` and confirm `pnpm audit` is still clean. If it is, the override was dead
weight and is now gone.
