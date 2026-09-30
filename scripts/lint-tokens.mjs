/**
 * lint-tokens.mjs
 *
 * Scans src/shell and src/booking source files (excluding tests and stories)
 * for token-architecture violations:
 *
 *   1. Hard-coded hex literals  (#rgb / #rrggbb / #rrggbbaa)
 *   2. Legacy --meda-* custom property references  (var(--meda-…))
 *   3. src/booking only — colours that bypass the theme bridge: Tailwind
 *      palette colours (`bg-white`, `text-green-600`, …) and arbitrary colour
 *      values (`bg-[oklch(…)]`, `text-[var(--x)]`, …). The booking screens are
 *      themed ONLY through the shadcn variables bridge.css maps (`--primary`,
 *      `--card`, `--muted`, …), so a customer's own tokens re-theme them.
 *
 * Exit 0 — no violations.
 * Exit 1 — one or more violations found (printed to stderr).
 */

import { glob, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;
const MEDA_VAR_REGEX = /var\(--meda-[a-zA-Z0-9-]+\)/g;

const PALETTE =
  'black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|brand|error|info|success|warning';
const COLOUR_UTILITY =
  'bg|text|border|border-[trblxyse]|ring|ring-offset|outline|fill|stroke|from|via|to|decoration|divide|accent|caret|shadow|placeholder';
// `(?<![\w-])` keeps `shadow-lg`, `text-sm`, `text-balance` etc. out; the
// palette must follow the utility directly (optionally with a /opacity).
const BOOKING_PALETTE_REGEX = new RegExp(
  `(?<![\\w-])(?:${COLOUR_UTILITY})-(?:${PALETTE})(?:-\\d{2,3})?(?:\\/\\d+)?(?![\\w-])`,
  'g'
);
const BOOKING_ARBITRARY_COLOUR_REGEX = new RegExp(
  `(?<![\\w-])(?:${COLOUR_UTILITY})-\\[(?:#|rgb|hsl|oklch|oklab|lab|lch|color|var\\()`,
  'g'
);

const COMMENT_LINE_REGEX = /^\s*\/\//;
const BLOCK_COMMENT_REGEX = /^\s*\*/;

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '..');

// Node's built-in glob (node:fs/promises, Node >= 22) — fast-glob was a
// phantom transitive dependency that dropped out of the lockfile.
const files = [];
for (const pattern of ['src/shell/**/*.{ts,tsx}', 'src/booking/**/*.{ts,tsx}']) {
  for await (const entry of glob(pattern, { cwd: packageRoot })) {
    if (/\.(test|stories)\.(ts|tsx)$/.test(entry)) continue;
    if (entry.includes('__stories__')) continue;
    files.push(resolve(packageRoot, entry));
  }
}
files.sort();

/** @type {{ file: string; line: number; col: number; kind: string; match: string }[]} */
const violations = [];

for (const filePath of files) {
  const src = await readFile(filePath, 'utf-8');
  const lines = src.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];

    // Skip single-line comment lines and JSDoc/block comment lines.
    if (COMMENT_LINE_REGEX.test(raw) || BLOCK_COMMENT_REGEX.test(raw)) continue;

    // Strip inline trailing comments before matching.
    const stripped = raw.replace(/\/\/.*$/, '');

    for (const match of stripped.matchAll(HEX_REGEX)) {
      violations.push({
        file: filePath.replace(`${packageRoot}/`, ''),
        line: i + 1,
        col: (match.index ?? 0) + 1,
        kind: 'hex-literal',
        match: match[0],
      });
    }

    if (filePath.includes('/src/booking/')) {
      for (const [regex, kind] of [
        [BOOKING_PALETTE_REGEX, 'palette-colour'],
        [BOOKING_ARBITRARY_COLOUR_REGEX, 'arbitrary-colour'],
      ]) {
        for (const match of stripped.matchAll(regex)) {
          violations.push({
            file: filePath.replace(`${packageRoot}/`, ''),
            line: i + 1,
            col: (match.index ?? 0) + 1,
            kind,
            match: match[0],
          });
        }
      }
    }

    for (const match of stripped.matchAll(MEDA_VAR_REGEX)) {
      violations.push({
        file: filePath.replace(`${packageRoot}/`, ''),
        line: i + 1,
        col: (match.index ?? 0) + 1,
        kind: 'legacy-meda-var',
        match: match[0],
      });
    }
  }
}

if (violations.length === 0) {
  console.log('lint-tokens: no violations found.');
  process.exit(0);
}

console.error(`lint-tokens: ${violations.length} violation(s) found:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}:${v.col}  [${v.kind}]  ${v.match}`);
}
console.error(
  '\nFix: replace hex literals with semantic token variables (e.g. var(--color-brand-500)).'
);
console.error('     Replace var(--meda-*) with canonical var(--color-*) / var(--radius-*) / etc.');
console.error(
  '     In src/booking use bridge colours only (bg-primary, text-muted-foreground, border-border, …).\n'
);
process.exit(1);
