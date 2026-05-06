import { describe, expect, it } from 'vitest';
import type { EmailFontOption } from '../../../../src/email-builder/internal/email-font-options.js';
import { EMAIL_FONT_OPTIONS } from '../../../../src/email-builder/internal/email-font-options.js';

describe('EMAIL_FONT_OPTIONS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(EMAIL_FONT_OPTIONS)).toBe(true);
    expect(EMAIL_FONT_OPTIONS.length).toBeGreaterThan(0);
  });

  it('each entry has a string label and string value', () => {
    for (const option of EMAIL_FONT_OPTIONS) {
      expect(typeof option.label).toBe('string');
      expect(typeof option.value).toBe('string');
    }
  });

  it('the first entry is Inherit with an empty value (inherits from parent)', () => {
    const first = EMAIL_FONT_OPTIONS[0] as EmailFontOption;
    expect(first.label).toBe('Inherit');
    expect(first.value).toBe('');
  });

  it('contains a System stack entry', () => {
    const system = EMAIL_FONT_OPTIONS.find((o) => o.label === 'System');
    expect(system).toBeDefined();
    expect(system?.value).toContain('-apple-system');
  });

  it('all non-inherit entries have non-empty values', () => {
    const nonInherit = EMAIL_FONT_OPTIONS.filter((o) => o.label !== 'Inherit');
    for (const option of nonInherit) {
      expect(option.value.length).toBeGreaterThan(0);
    }
  });

  it('contains common email-safe fonts', () => {
    const labels = EMAIL_FONT_OPTIONS.map((o) => o.label);
    expect(labels).toContain('Arial');
    expect(labels).toContain('Georgia');
    expect(labels).toContain('Helvetica');
    expect(labels).toContain('Times');
    expect(labels).toContain('Courier');
  });

  it('all values are valid CSS font-family strings (no double-spaces)', () => {
    for (const option of EMAIL_FONT_OPTIONS) {
      if (option.value) {
        expect(option.value).not.toMatch(/ {2}/);
      }
    }
  });
});
