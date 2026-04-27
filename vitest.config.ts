import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    // Visual regression specs are Playwright-only — vitest must not collect them.
    // Integration tests (test/**) require pnpm build first; run via pnpm test:integration.
    exclude: ['**/node_modules/**', '**/dist/**', 'tests/**', 'test/**'],
  },
});
