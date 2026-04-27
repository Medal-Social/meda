import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    // Visual regression specs are Playwright-only — vitest must not collect them.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/**'],
  },
});
