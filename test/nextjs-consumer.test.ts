/**
 * Integration test: Next.js 14 App Router consumption of @medalsocial/meda/shell.
 *
 * Rationale: This test runs `next build` against a hermetic fixture app that
 * imports ShellFrame from @medalsocial/meda/shell. If the 'use client' directive
 * is missing from dist/shell/index.js, Next.js will error because ShellFrame
 * uses hooks internally. Exit code 0 + absence of known error strings = R6 closed.
 *
 * Strategy: env-gated via SKIP_NEXTJS_FIXTURE. Run with `pnpm test:integration`.
 * The 60-120s build time makes it unsuitable for the default fast unit-test loop.
 */

import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';

const FIXTURE_DIR = path.resolve(__dirname, 'fixtures/nextjs-consumer');

// Strings that indicate Next.js detected a server/client boundary violation.
const SSR_ERROR_PATTERNS = [
  'useState only works in Client Components',
  'Server Components cannot use hooks',
  "You're importing a component that needs",
];

describe('Next.js consumer fixture', () => {
  it.skipIf(process.env.SKIP_NEXTJS_FIXTURE === '1')(
    "next build succeeds and reports no 'use client' boundary violations",
    () => {
      // Step 1: install deps (pnpm resolves the file: link to the local dist/).
      // --ignore-workspace: the fixture lives inside the meda workspace but is
      // NOT a workspace member; without this flag pnpm delegates to the root
      // workspace runner, which skips the fixture's own package.json.
      const installResult = spawnSync(
        'pnpm',
        ['install', '--no-frozen-lockfile', '--ignore-workspace'],
        {
          cwd: FIXTURE_DIR,
          encoding: 'utf8',
          timeout: 120_000,
        }
      );

      if (installResult.status !== 0) {
        throw new Error(
          `pnpm install failed (exit ${installResult.status}):\n${installResult.stderr}`
        );
      }

      // Step 2: run next build via the fixture's own node_modules binary.
      // We avoid `pnpm exec next build` because pnpm exec recurses through the
      // parent workspace and can't find the binary installed locally in the fixture.
      const buildResult = spawnSync(
        path.join(FIXTURE_DIR, 'node_modules', '.bin', 'next'),
        ['build'],
        {
          cwd: FIXTURE_DIR,
          encoding: 'utf8',
          timeout: 120_000,
          env: {
            ...process.env,
            // Suppress Next.js telemetry noise in CI.
            NEXT_TELEMETRY_DISABLED: '1',
          },
        }
      );

      const combined = `${buildResult.stdout}\n${buildResult.stderr}`;

      // Assert no boundary-violation error strings appear.
      for (const pattern of SSR_ERROR_PATTERNS) {
        expect(combined, `Found SSR error pattern: "${pattern}"`).not.toContain(pattern);
      }

      // Assert clean exit.
      expect(
        buildResult.status,
        `next build exited with code ${buildResult.status}.\n\nstdout:\n${buildResult.stdout}\n\nstderr:\n${buildResult.stderr}`
      ).toBe(0);
    },
    // Generous timeout: next build can take 60-120s on first run.
    180_000
  );
});
