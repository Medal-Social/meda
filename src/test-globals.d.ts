// Ambient type augmentations for the test environment.
//
// These triple-slash references make tsc pick up the matcher type augmentations
// from @testing-library/jest-dom and vitest-axe. Without these, test files that
// use `toBeInTheDocument`, `toHaveAttribute`, `toHaveNoViolations`, etc. fail
// `pnpm typecheck` even though the matchers work fine at vitest runtime
// (registered via vitest.setup.ts).
//
// The runtime registration still lives in vitest.setup.ts.

/// <reference types="@testing-library/jest-dom/vitest" />

import 'vitest';

declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: matches jest-dom's signature
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown;
  }
}
