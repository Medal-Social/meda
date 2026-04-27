// Augment vitest's Assertion interface so `expect(await axe(...)).toHaveNoViolations()`
// type-checks across every per-folder wcag.test.tsx file.
//
// The matcher itself is registered once in vitest.setup.ts via
// `expect.extend({ toHaveNoViolations })`. This file provides the TS side.

declare module 'vitest' {
  // Match @testing-library/jest-dom/vitest's signature so TS doesn't conflict.
  // biome-ignore lint/suspicious/noExplicitAny: must align with jest-dom declaration
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown;
  }
}

export {};
