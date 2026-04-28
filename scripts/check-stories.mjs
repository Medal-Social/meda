#!/usr/bin/env node
import { globSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  for (const m of source.matchAll(EXPORT_RE)) {
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
