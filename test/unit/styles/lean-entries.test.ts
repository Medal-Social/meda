import { describe, expect, it } from 'vitest';

// Node runtime APIs without pulling in @types/node (see theme.test.ts).
declare const require: (id: string) => unknown;
declare const __dirname: string;

const fs = require('node:fs') as {
  readFileSync(p: string, enc: string): string;
  existsSync(p: string): boolean;
};
const path = require('node:path') as { join(...parts: string[]): string };

const root = path.join(__dirname, '../../..');
const stylesDir = path.join(root, 'src/styles');
const read = (file: string) => fs.readFileSync(path.join(stylesDir, file), 'utf8');
// Strip comments so prose that mentions `@source` / xyflow doesn't count. A
// comment must open at line start or after whitespace, so glob strings such
// as "../**/*.js" are left alone.
const code = (file: string) => read(file).replace(/(^|\s)\/\*[\s\S]*?\*\//g, '$1');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')) as {
  exports: Record<string, { default?: string } | string>;
};
const exportTarget = (key: string) => {
  const entry = pkg.exports[key];
  return typeof entry === 'string' ? entry : entry?.default;
};

describe('lean stylesheet entry points', () => {
  it('base.css = tokens + bridge + base layer, without scanning components or xyflow', () => {
    const base = code('base.css');
    expect(base).toMatch(/@import\s+["']\.\/tokens\.css["']/);
    expect(base).toMatch(/@import\s+["']\.\/bridge\.css["']/);
    expect(base).toContain('@layer base');
    expect(base).not.toContain('@source');
    expect(base).not.toContain('@xyflow');
  });

  it('bridge.css declares the dark variant and theme mappings but no token values', () => {
    const bridge = code('bridge.css');
    expect(bridge).toContain('@custom-variant dark');
    expect(bridge).toContain('--color-primary: var(--primary);');
    expect(bridge).not.toContain('@import');
    expect(bridge).not.toContain('@source');
    // Fonts stay in base.css so bring-your-own-token sites keep their font.
    expect(bridge).not.toContain('--font-sans');
  });

  it('calendar.css scans only the calendar output', () => {
    const sources = [...code('calendar.css').matchAll(/@source\s+(not\s+)?["']([^"']+)["']/g)];
    expect(sources.map((m) => m[2])).toEqual(['../calendar/**/*.js']);
  });

  it('primitives.css scans the primitives output and excludes MarkdownView', () => {
    const css = code('primitives.css');
    expect(css).toMatch(/@source\s+["']\.\.\/primitives\/\*\.js["']/);
    expect(css).toMatch(/@source\s+not\s+["']\.\.\/primitives\/markdown-view\*\.js["']/);
    expect(css).not.toContain('**');
  });

  it('theme.css stays batteries-included (base + full component scan)', () => {
    const theme = code('theme.css');
    expect(theme).toMatch(/@import\s+["']\.\/base\.css["']/);
    expect(theme).toMatch(/@source\s+["']\.\.\/\*\*\/\*\.js["']/);
  });

  it.each([
    ['./styles.css', 'theme.css'],
    ['./styles', 'theme.css'],
    ['./styles/tokens', 'tokens.css'],
    ['./styles/tokens.css', 'tokens.css'],
    ['./styles/bridge.css', 'bridge.css'],
    ['./styles/base.css', 'base.css'],
    ['./calendar/styles.css', 'calendar.css'],
    ['./primitives/styles.css', 'primitives.css'],
  ])('exports %s -> dist/styles/%s with a matching source file', (key, file) => {
    expect(exportTarget(key)).toBe(`./dist/styles/${file}`);
    expect(fs.existsSync(path.join(stylesDir, file))).toBe(true);
  });
});
