import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    // Coverage is configured at the root because vitest 4 only honours
    // coverage opts on the top-level test config, not on individual
    // `projects[]`. To still scope reporting to the unit project we run
    // `vitest run --project unit --coverage` (CI + local).
    //
    // Merging V8 coverage across the jsdom unit project and the Chromium
    // browser project (storybook addon-vitest) is brittle in vitest 4 —
    // the browser project has its own bundling pipeline that doesn't emit
    // V8 counts compatible with the node-side reporter. Story coverage is
    // captured separately by Chromatic visual review and the a11y gate
    // added in Task 1.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      // NB: setting BOTH `include` and `exclude` on the top-level coverage
      // block in vitest 4 silently zeroes out instrumentation when the
      // exclude is an array of more than one entry (suspected glob-merge
      // bug). Workaround: use ONLY `include`, and rely on the exclude
      // logic baked into `provider: 'v8'` (which already skips node_modules,
      // dist, and test files by default). Per-folder exclusions live in
      // the `excludeAfterRemap` post-filter below.
      include: ['src/**'],
      // Per-file exclusions applied after V8 instrumentation; equivalent
      // to `exclude` in spirit but processed via the istanbul-remap pass
      // so the include glob isn't broken.
      excludeAfterRemap: [
        'dist/**',
        'storybook-static/**',
        'coverage/**',
        'test/**',
        'src/**/*.stories.ts',
        'src/**/*.stories.tsx',
        'src/**/__stories__/**',
        // Story fixtures (data shapes for stories — no behavior)
        'src/**/fixtures.ts',
        'src/**/fixtures.tsx',
        // Scaffolding files
        'src/__stories__/StoryFrame.tsx',
        // Pure barrel / type files (re-exports and aliases)
        'src/**/index.ts',
        'src/**/public.ts',
        'src/**/types.ts',
        'src/**/*.types.ts',
        'src/**/*.d.ts',
        // Defaults-only constant modules with no behavior to assert
        'src/email-builder/starter-shell.ts',
        // Three.js / WebGL scene + shader. Renders into a <Canvas> via
        // react-three-fiber; cannot exercise meaningfully without a real
        // GPU and is mocked away from jsdom render trees by
        // vitest.setup.ts. Visual fidelity is covered by Chromatic.
        'src/voice/voice-orb-scene.tsx',
        'src/voice/voice-orb-shader.ts',
        // Thin shadcn wrappers in src/components/ui/* are imported
        // pass-throughs for cmdk / vaul / Radix / Base UI primitives.
        // Their non-trivial logic lives upstream; the parts we own
        // (className composition, `data-slot` attrs) are exercised
        // transitively by every consuming component test. Measuring
        // them tests upstream libraries, not this package.
        'src/components/ui/dropdown-menu.tsx',
        'src/components/ui/drawer.tsx',
        'src/components/ui/dialog.tsx',
        'src/components/ui/command.tsx',
        // Shell extras: layout demo wrappers used only inside Storybook
        // stories, not part of the runtime export.
        'src/shell/extras/**',
        // src/shell/utils.ts only operates on extras types and is consumed
        // exclusively by extras/* (which is excluded above). Measuring it
        // would require fixturing extras-only types into unit tests.
        'src/shell/utils.ts',
        // src/shell/motion.ts is a constants object exported as part of
        // the public API; consumers use the values, not the module
        // itself, so there's no behaviour to assert.
        'src/shell/motion.ts',
      ],
      // Project-wide thresholds — set ~5% below current measured floor
      // so CI fails on regressions but doesn't block a PR for being a
      // half-percent off. Current measurement: statements 70.85, lines
      // 73.03, branches 67.06, functions 62.49. DeepSource's quality
      // gates do the long-term ratcheting via the dashboard.
      thresholds: {
        statements: 65,
        lines: 65,
        functions: 55,
        branches: 60,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: false,
          setupFiles: ['./vitest.setup.ts'],
          // Integration tests (test/nextjs-consumer.test.ts) require pnpm build first; run via pnpm test:integration.
          // demo/ requires a built dist/ — excluded from unit runs, covered by test:integration.
          exclude: ['**/node_modules/**', '**/dist/**', 'test/nextjs-consumer.test.ts', 'demo/**'],
        },
      },
      {
        extends: true,
        plugins: [storybookTest({ configDir: `${dirname}/.storybook` })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
