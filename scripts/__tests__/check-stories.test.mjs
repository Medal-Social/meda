import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { checkStoryFile } from '../check-stories.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => {
  const path = join(here, 'fixtures', name);
  return { path, source: readFileSync(path, 'utf8') };
};

describe('checkStoryFile', () => {
  it('passes a clean file', () => {
    const f = fixture('clean.stories.tsx');
    expect(checkStoryFile(f.path, f.source)).toEqual([]);
  });

  it('rejects banned export names', () => {
    const f = fixture('banned-name.stories.tsx');
    const violations = checkStoryFile(f.path, f.source);
    expect(violations.map((v) => v.message)).toEqual([
      expect.stringContaining('DarkTheme'),
      expect.stringContaining('MobileCombined'),
    ]);
  });

  it('rejects banned parameter shapes', () => {
    const f = fixture('banned-param.stories.tsx');
    const violations = checkStoryFile(f.path, f.source);
    expect(violations.map((v) => v.message)).toEqual([
      expect.stringContaining('themeOverride'),
      expect.stringContaining('defaultViewport'),
    ]);
  });

  it('flags files that exceed the story budget', () => {
    const f = fixture('over-budget.stories.tsx');
    const violations = checkStoryFile(f.path, f.source);
    expect(violations.some((v) => v.message.includes('exceeds budget'))).toBe(true);
  });
});
