import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
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

// Vendor @xyflow/react's stylesheet so `styles.css` and
// `workflow-builder/styles.css` compile even when the (optional) peer is not
// installed. In src/ the sheet keeps importing the package directly (Storybook
// and the demo resolve it from devDependencies); only the shipped copy is
// rewritten to point at the vendored file.
const XYFLOW_IMPORT = '@import "@xyflow/react/dist/style.css";';
const require = createRequire(import.meta.url);
const xyflowPkgPath = require.resolve('@xyflow/react/package.json');
const xyflowPkg = JSON.parse(await readFile(xyflowPkgPath, 'utf8'));
const xyflowCss = await readFile(resolve(dirname(xyflowPkgPath), 'dist/style.css'), 'utf8');
await mkdir(resolve(distStyles, 'vendor'), { recursive: true });
await writeFile(
  resolve(distStyles, 'vendor/xyflow.css'),
  `/*! Vendored from @xyflow/react@${xyflowPkg.version} dist/style.css — ${xyflowPkg.license} License, (c) webkid GmbH. https://github.com/xyflow/xyflow */\n${xyflowCss}`
);
const workflowSheet = resolve(distStyles, 'workflow-builder.css');
const workflowCss = await readFile(workflowSheet, 'utf8');
if (!workflowCss.includes(XYFLOW_IMPORT)) {
  console.error(`build: expected ${XYFLOW_IMPORT} in src/styles/workflow-builder.css`);
  process.exit(1);
}
await writeFile(
  workflowSheet,
  workflowCss.replace(XYFLOW_IMPORT, '@import "./vendor/xyflow.css";')
);

// No shipped stylesheet may import the optional peer directly any more.
for (const file of ['theme.css', 'base.css', 'bridge.css', 'workflow-builder.css']) {
  if ((await readFile(resolve(distStyles, file), 'utf8')).includes('@import "@xyflow')) {
    console.error(`build: dist/styles/${file} still imports @xyflow/react directly`);
    process.exit(1);
  }
}

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
