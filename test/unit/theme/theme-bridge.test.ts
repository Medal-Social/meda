import { describe, expect, it } from 'vitest';
import { createMedaThemeCss, defineMedaTheme } from '../../../src/theme/theme-bridge.js';

describe('Meda theme bridge', () => {
  it('generates light and dark app-scoped token CSS', () => {
    const theme = defineMedaTheme({
      appId: 'auto',
      colors: {
        primary: 'var(--hb-brand-500)',
      },
      fonts: {
        body: 'var(--font-body)',
      },
      light: {
        colors: {
          background: 'var(--hb-base-50)',
          foreground: 'var(--hb-base-950)',
        },
      },
      dark: {
        colors: {
          background: 'var(--hb-base-900)',
          foreground: 'var(--hb-base-50)',
        },
      },
    });

    expect(createMedaThemeCss(theme)).toMatchInlineSnapshot(`
      "[data-meda-app="auto"] {
        --background: var(--hb-base-50);
        --font-body: var(--font-body);
        --foreground: var(--hb-base-950);
        --primary: var(--hb-brand-500);
      }

      [data-meda-app="auto"].dark, [data-meda-app="auto"][data-theme="dark"] {
        --background: var(--hb-base-900);
        --font-body: var(--font-body);
        --foreground: var(--hb-base-50);
        --primary: var(--hb-brand-500);
      }"
    `);
  });

  it('rejects app ids that cannot be safely embedded in selectors', () => {
    expect(() => defineMedaTheme({ appId: 'auto app' })).toThrow(
      'Meda theme appId must contain only letters, numbers, underscores, or dashes.'
    );
  });
});
