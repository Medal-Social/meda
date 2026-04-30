import { describe, expect, it } from 'vitest';

// Read theme.css via Node's runtime APIs without pulling in @types/node.
// Declared locally so the package-level tsconfig (which doesn't include
// node typings) still typechecks cleanly under jsdom Vitest runs.
declare const require: (id: string) => unknown;
declare const __dirname: string;

const fs = require('node:fs') as { readFileSync(p: string, enc: string): string };
const path = require('node:path') as { join(...parts: string[]): string };
const themeCss = fs.readFileSync(path.join(__dirname, 'theme.css'), 'utf8');

describe('theme.css', () => {
  // Tailwind v4 only generates utility classes for class names it sees in
  // scanned files. Consumer apps don't reference every utility used by meda
  // components (e.g. `h-full`, `mt-auto`, `py-3.5`, `bg-shell-rail` on
  // IconRail), so without an @source directive pointing at meda's compiled
  // dist files, those classes silently disappear and component layouts
  // collapse — most visibly, the IconRail's utility items fail to pin to
  // the bottom of the viewport because `mt-auto` never gets generated.
  //
  // The directive is resolved relative to this CSS file at build time. Since
  // src/styles/theme.css is copied verbatim to dist/styles/theme.css by the
  // build script, `../**/*.js` from the dist location scans every emitted
  // component module — exactly the surface consumers import from.
  it('declares an @source directive that scans meda component output', () => {
    expect(themeCss).toMatch(/@source\s+["']\.\.\/\*\*\/\*\.js["']/);
  });

  it('declares dedicated auth gradient tokens for consumer overrides', () => {
    expect(themeCss).toContain('--auth-gradient-primary: var(--color-brand-500);');
    expect(themeCss).toContain('--auth-gradient-secondary: var(--color-brand-700);');
    expect(themeCss).toContain('--auth-gradient-base: var(--color-brand-800);');
  });

  it('neutralizes vaul drawer layer hints after mobile drawers are open', () => {
    expect(themeCss).toMatch(
      /\[data-vaul-drawer\]\[data-state=["']open["']\]\s*\{[^}]*will-change:\s*auto;/s
    );
  });
});
