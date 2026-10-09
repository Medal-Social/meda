#!/usr/bin/env node
// Lean-consumer size budget.
//
// Measures what a customer site pays when it renders one lean meda surface —
// NOT what a full Medal app pays for the batteries-included `styles.css` /
// root barrel (size-limit covers those). Two consumers are measured:
//
//   calendar lean consumer — `@medalsocial/meda/calendar` + the booking-ready
//         primitives (Avatar, Button, Input, ToggleGroup).
//   booking lean consumer  — a booking page: the wizard screens from
//         `@medalsocial/meda/booking` + the primitives they are built on.
//
//   JS  — esbuild bundles the consumer's imports, minified, with react /
//         react-dom / lucide-react external (every consumer already ships
//         those). Budget: gzip <= JS_BUDGET.
//   CSS — @tailwindcss/cli compiles a tiny consumer fixture with and without
//         meda's lean stylesheet entries; the gzip DELTA is what meda adds.
//         Budgeted on the bring-your-own-tokens bridge (and, for calendar,
//         on meda's own tokens). `styles.css` is reported for comparison only.
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
// bridge raised 4 KB → 4.5 KB (form + sheet primitives): primitives.css scans
// every primitive, so Checkbox, Field, Textarea and the native-<dialog> Sheet
// (bottom-sheet → centred-dialog layout, ::backdrop scrim, safe-area padding)
// add their utilities to every lean consumer. Measured 4.17 KB (was 3.57 KB)
// after reusing Input's focus/invalid classes; ~8% headroom.
const CSS_BUDGETS = {
  bridge: 4.5 * KB,
  base: 6 * KB,
};
// Booking lean consumer: a customer's booking PAGE — the wizard steps, the
// summary bar, the confirmation, the pending skeleton and the login sheet
// (manage and portal screens are other pages; size-limit guards the whole
// subpath).
//
// The booking-extraction plan pencilled in 25 KB JS / 4 KB CSS before the
// screens existed. Measured on the first build, at markup parity with the
// customer components they were extracted from: JS 28.89 KB (of which
// ~8 KB is tailwind-merge, which every shadcn site already ships and dedupes
// — reported below), CSS delta 6.16 KB (the whole subpath: booking.css cannot
// be tree-shaken per page). Budgets are measured + ~14%; see the PR.
//
// js raised 33 KB → 37 KB (bestill phase 2, #271): the page now also counts
// BookingRecap (it renders on the details step), and the opt-in finder
// features — TimeScreen's «free soon» row and day fullness, WhoScreen's guest
// party, StylistScreen's faces, SummaryBar's detail and hints. Measured
// 33.83 KB with all of them (33.05 KB before counting the recap); ~9% headroom.
const BOOKING_BUDGETS = {
  js: 37 * KB,
  bridge: 7 * KB,
};
const BOOKING_PAGE_SCREENS = [
  'WhoScreen',
  'AddChildSheet',
  'ServiceScreen',
  'StylistScreen',
  'TimeScreen',
  'BookingRecap',
  'DetailsScreen',
  'SummaryBar',
  'Confirmation',
  'BookingSkeleton',
  'LiveStatus',
  'LoginSheet',
];

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const workDir = join(packageRoot, 'node_modules/.cache/meda-size-budget');
const tailwindBin = join(packageRoot, 'node_modules/.bin/tailwindcss');

if (
  !existsSync(join(packageRoot, 'dist/calendar/index.js')) ||
  !existsSync(join(packageRoot, 'dist/booking/index.js'))
) {
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

async function bundleGzip(name, lines, { alsoExternal = [] } = {}) {
  const entry = join(workDir, `${name}.entry.js`);
  await writeFile(entry, [...lines, ''].join('\n'));
  const result = await build({
    entryPoints: [entry],
    absWorkingDir: workDir,
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    write: false,
    logLevel: 'silent',
    external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react', ...alsoExternal],
  });
  return gzip(result.outputFiles[0].contents);
}

const jsCalendar = await bundleGzip('calendar', [
  "export * from '@medalsocial/meda/calendar';",
  "export { Avatar, Button, getInitials, Input, ToggleGroup } from '@medalsocial/meda/primitives';",
]);

// The screens import the primitives they are built on themselves, so those
// are counted.
const bookingPage = `export { ${BOOKING_PAGE_SCREENS.join(', ')} } from '@medalsocial/meda/booking';`;
const jsBooking = await bundleGzip('booking', [bookingPage]);
const jsBookingShared = await bundleGzip('booking-shared', [bookingPage], {
  alsoExternal: ['tailwind-merge'],
});
const jsBookingAll = await bundleGzip('booking-all', [
  "export * from '@medalsocial/meda/booking';",
]);

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

const CALENDAR_FEATURES = [
  '@medalsocial/meda/calendar/styles.css',
  '@medalsocial/meda/primitives/styles.css',
];
const BOOKING_FEATURES = [
  '@medalsocial/meda/booking/styles.css',
  '@medalsocial/meda/primitives/styles.css',
];

const cssBaseline = await compileCss('baseline', []);
const cssBridge = await compileCss('bridge', [
  '@medalsocial/meda/styles/bridge.css',
  ...CALENDAR_FEATURES,
]);
const cssBase = await compileCss('base', [
  '@medalsocial/meda/styles/base.css',
  ...CALENDAR_FEATURES,
]);
const cssBookingBridge = await compileCss('booking-bridge', [
  '@medalsocial/meda/styles/bridge.css',
  ...BOOKING_FEATURES,
]);
const cssFull = await compileCss('full', ['@medalsocial/meda/styles.css']);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const rows = [
  { heading: 'calendar lean consumer' },
  {
    label: 'JS  calendar + primitives (gzip)',
    size: jsCalendar,
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
  { heading: 'booking lean consumer' },
  {
    label: 'JS  booking page + primitives (gzip)',
    size: jsBooking,
    budget: BOOKING_BUDGETS.js,
  },
  {
    label: 'JS  … same, tailwind-merge shared (reference)',
    size: jsBookingShared,
  },
  {
    label: 'JS  every booking screen (reference)',
    size: jsBookingAll,
  },
  {
    label: 'CSS delta  bridge.css + booking + primitives',
    size: cssBookingBridge - cssBaseline,
    budget: BOOKING_BUDGETS.bridge,
  },
  { heading: 'reference' },
  {
    label: 'CSS delta  styles.css (full, reference only)',
    size: cssFull - cssBaseline,
  },
];

console.log(`size-budget (tailwind baseline ${fmt(cssBaseline)} gzip)`);
let failed = false;
for (const { heading, label, size, budget } of rows) {
  if (heading) {
    console.log(`  ${heading}`);
    continue;
  }
  const over = budget !== undefined && size > budget;
  failed ||= over;
  const verdict = budget === undefined ? '' : `${over ? 'FAIL' : 'ok'}  (budget ${fmt(budget)})`;
  console.log(`    ${label.padEnd(46)} ${fmt(size).padStart(10)}  ${verdict}`);
}

await rm(workDir, { recursive: true, force: true });

if (failed) {
  console.error(
    '\nsize-budget: over budget. Lean entries must stay lean — check for a new\n' +
      'import of a heavy module, or an @source glob that scans too much.'
  );
  process.exit(1);
}
