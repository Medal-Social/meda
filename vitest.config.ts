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
      // Only count the source we ship from src/.
      include: ['src/**/*.{ts,tsx}'],
      // Files we deliberately don't measure:
      exclude: [
        // Generated / built outputs
        'dist/**',
        'storybook-static/**',
        'coverage/**',
        // Tests, stories, and per-folder a11y gates are scaffolding,
        // not shipped runtime behaviour.
        '**/*.test.{ts,tsx}',
        '**/*.stories.{ts,tsx}',
        '**/wcag.test.{ts,tsx}',
        'src/__stories__/**',
        'src/__tests__/**',
        // Pure type and barrel files. `index.ts`, `public.ts`, and
        // `*.types.ts` are re-exports / type aliases — they have no
        // executable behaviour to cover.
        '**/index.ts',
        '**/public.ts',
        '**/types.ts',
        '**/*.types.ts',
        '**/*.d.ts',
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
      // Project-wide thresholds. Floors agreed with the team:
      //   statements ≥ 85, lines ≥ 85, functions ≥ 80, branches ≥ 80.
      // Lower function/branch floors reflect that many small UI
      // primitives have many short branches (defaulting props, optional
      // callbacks) that rarely move bug counts.
      thresholds: {
        statements: 85,
        lines: 85,
        functions: 80,
        branches: 80,
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
          // Integration tests (test/**) require pnpm build first; run via pnpm test:integration.
          exclude: ['**/node_modules/**', '**/dist/**', 'test/**'],
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
