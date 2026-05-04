import { defineConfig } from 'vitest/config';

/**
 * Integration vitest config — runs tests that shell out to slow external
 * processes (e.g. next build). Excluded from the default `pnpm test` run.
 *
 * Usage: pnpm test:integration
 * Skip:  SKIP_NEXTJS_FIXTURE=1 pnpm test:integration
 */
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    globals: false,
    // No jsdom setup needed for process-level integration tests.
    testTimeout: 180_000,
  },
});
