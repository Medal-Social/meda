import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./vitest.setup.ts'],
    // Integration tests (test/**) require pnpm build first; run via pnpm test:integration.
    exclude: ['**/node_modules/**', '**/dist/**', 'test/**'],
  },
});
