#!/usr/bin/env node
// Lean-consumer size budget.
//
// Measures what a customer site (e.g. a booking page) pays when it renders
// meda's calendar + booking primitives — NOT what a full Medal app pays for
// the batteries-included `styles.css` / root barrel (size-limit covers those).
//
//   JS  — esbuild bundles `@medalsocial/meda/calendar` + the booking
//         primitives from `@medalsocial/meda/primitives`, minified, with
//         react / react-dom / lucide-react external (every consumer already
//         ships those). Budget: gzip <= JS_BUDGET.
//   CSS — @tailwindcss/cli compiles a tiny consumer fixture with and without
//         meda's lean stylesheet entries; the gzip DELTA is what meda adds.
//         Budgeted for both foundations (bring-your-own-tokens bridge, and
//         meda's own tokens). `styles.css` is reported for comparison only.
//
// Specifiers resolve through package.json#exports via package self-reference
// (the fixture lives inside this package), so a broken exports map fails
// here exactly like it would in a consumer. Requires a fresh `pnpm build`.
//
// Usage: pnpm build && pnpm size:budget

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { build } from 'esbuild';

const KB = 1024;
const JS_BUDGET = 25 * KB;
const CSS_BUDGETS = {
  bridge: 4 * KB,
  base: 6 * KB,
};

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workDir = join(packageRoot, 'node_modules/.cache/meda-size-budget');
const tailwindBin = join(packageRoot, 'node_modules/.bin/tailwindcss');

if (!existsSync(join(packageRoot, 'dist/calendar/index.js'))) {
  console.error('size-budget: dist/ is missing — run `pnpm build` first.');
  process.exit(1);
}

await rm(workDir, { recursive: true, force: true });
await mkdir(workDir, { recursive: true });

const gzip = (input) => gzipSync(input, { level: 9 }).length;
const fmt = (bytes) => `${(bytes / KB).toFixed(2)} KB`;

// ---------------------------------------------------------------------------
// JS
// ---------------------------------------------------------------------------

const jsEntry = join(workDir, 'entry.js');
await writeFile(
  jsEntry,
  [
    "export * from '@medalsocial/meda/calendar';",
    "export { Avatar, Button, getInitials, Input, ToggleGroup } from '@medalsocial/meda/primitives';",
    '',
  ].join('\n')
);

const jsResult = await build({
  entryPoints: [jsEntry],
  absWorkingDir: workDir,
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2022',
  write: false,
  logLevel: 'silent',
  external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react'],
});
const jsGzip = gzip(jsResult.outputFiles[0].contents);

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

// A handful of utilities a consumer page would use anyway, so the baseline is
// a realistic Tailwind build rather than an empty one.
await writeFile(
  join(workDir, 'fixture.html'),
  '<main class="mx-auto flex max-w-3xl flex-col gap-4 p-4 text-sm"><h1 class="text-2xl font-semibold">Book</h1></main>\n'
);

async function compileCss(name, imports) {
  const input = join(workDir, `${name}.css`);
  const output = join(workDir, `${name}.out.css`);
  await writeFile(
    input,
    [
      '@import "tailwindcss" source(none);',
      '@source "./fixture.html";',
      ...imports.map((specifier) => `@import "${specifier}";`),
      '',
    ].join('\n')
  );
  execFileSync(tailwindBin, ['-i', input, '-o', output, '--minify'], {
    cwd: workDir,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  return gzip(await readFile(output));
}

const LEAN_FEATURES = [
  '@medalsocial/meda/calendar/styles.css',
  '@medalsocial/meda/primitives/styles.css',
];

const cssBaseline = await compileCss('baseline', []);
const cssBridge = await compileCss('bridge', [
  '@medalsocial/meda/styles/bridge.css',
  ...LEAN_FEATURES,
]);
const cssBase = await compileCss('base', ['@medalsocial/meda/styles/base.css', ...LEAN_FEATURES]);
const cssFull = await compileCss('full', ['@medalsocial/meda/styles.css']);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const rows = [
  {
    label: 'JS  calendar + primitives (gzip)',
    size: jsGzip,
    budget: JS_BUDGET,
  },
  {
    label: 'CSS delta  bridge.css + calendar + primitives',
    size: cssBridge - cssBaseline,
    budget: CSS_BUDGETS.bridge,
  },
  {
    label: 'CSS delta  base.css + calendar + primitives',
    size: cssBase - cssBaseline,
    budget: CSS_BUDGETS.base,
  },
  {
    label: 'CSS delta  styles.css (full, reference only)',
    size: cssFull - cssBaseline,
  },
];

console.log(`size-budget (tailwind baseline ${fmt(cssBaseline)} gzip)`);
let failed = false;
for (const { label, size, budget } of rows) {
  const over = budget !== undefined && size > budget;
  failed ||= over;
  const verdict = budget === undefined ? '' : `${over ? 'FAIL' : 'ok'}  (budget ${fmt(budget)})`;
  console.log(`  ${label.padEnd(48)} ${fmt(size).padStart(10)}  ${verdict}`);
}

await rm(workDir, { recursive: true, force: true });

if (failed) {
  console.error(
    '\nsize-budget: over budget. Lean entries must stay lean — check for a new\n' +
      'import of a heavy module, or an @source glob that scans too much.'
  );
  process.exit(1);
}
