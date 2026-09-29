import { access, cp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(currentDirectory, '..');
const sourceStyles = resolve(packageRoot, 'src/styles');
const distStyles = resolve(packageRoot, 'dist/styles');

// Stylesheets are shipped verbatim: `@source` globs inside them resolve
// relative to dist/styles/ in the consumer's Tailwind build, so they must not
// be pre-compiled here. Covers the batteries-included theme.css plus the lean
// entries (styles/base.css, styles/bridge.css) and the per-feature sheets
// (calendar.css, primitives.css, workflow-builder.css).
await rm(distStyles, { recursive: true, force: true });
await mkdir(distStyles, { recursive: true });
await cp(sourceStyles, distStyles, { recursive: true });

// Every CSS file named in package.json#exports must exist after the copy —
// a typo in the exports map would otherwise only surface in a consumer build.
const pkg = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
const cssTargets = Object.values(pkg.exports)
  .map((target) => (typeof target === 'string' ? target : target.default))
  .filter((target) => typeof target === 'string' && target.endsWith('.css'));

const missing = [];
for (const target of new Set(cssTargets)) {
  try {
    await access(resolve(packageRoot, target));
  } catch {
    missing.push(target);
  }
}
if (missing.length > 0) {
  console.error(
    `build: package.json exports point at missing CSS files:\n  ${missing.join('\n  ')}`
  );
  process.exit(1);
}
