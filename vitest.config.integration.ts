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
    // Narrow include to the single integration test today. Unit tests now
    // live under test/unit/** and depend on jsdom — running them under
    // environment: 'node' would fail on browser globals like `window`.
    include: ['test/nextjs-consumer.test.ts'],
    exclude: ['test/unit/**', 'test/unit/**/*'],
    environment: 'node',
    globals: false,
    // No jsdom setup needed for process-level integration tests.
    testTimeout: 180_000,
  },
});
