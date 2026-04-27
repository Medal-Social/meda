/**
 * lint-tokens.mjs
 *
 * Scans src/shell source files (excluding tests and stories) for two
 * categories of token-architecture violations:
 *
 *   1. Hard-coded hex literals  (#rgb / #rrggbb / #rrggbbaa)
 *   2. Legacy --meda-* custom property references  (var(--meda-…))
 *
 * Exit 0 — no violations.
 * Exit 1 — one or more violations found (printed to stderr).
 */

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import fg from 'fast-glob';

const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;
const MEDA_VAR_REGEX = /var\(--meda-[a-zA-Z0-9-]+\)/g;

const COMMENT_LINE_REGEX = /^\s*\/\//;
const BLOCK_COMMENT_REGEX = /^\s*\*/;

const currentDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDir, '..');

const files = await fg('src/shell/**/*.{ts,tsx}', {
  cwd: packageRoot,
  absolute: true,
  ignore: ['**/*.test.ts', '**/*.test.tsx', '**/*.stories.ts', '**/*.stories.tsx'],
});

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
console.error(
  '     Replace var(--meda-*) with canonical var(--color-*) / var(--radius-*) / etc.\n'
);
process.exit(1);
