import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Flatten one clsx-style class value.
 *
 * Deliberately inlined instead of calling `clsx`, so that `cn` — which nearly
 * every component in this package calls — leaves no RUNTIME edge to the `clsx`
 * module. `clsx` stays a dependency for its `ClassValue` type, which appears in
 * this file's public signature; `import type` is erased at compile time.
 *
 * Why it is worth inlining twenty lines: `clsx` is also a dependency of
 * `recharts`, so a bundler that groups the chart vendor graph into one chunk
 * puts the single shared `clsx` module in THAT chunk. Every eager importer of
 * `cn` then hard-depends on the whole chart bundle. Measured in the Medal web
 * app (2026-09-06): the `/login` server closure reached a 392 kB
 * `vendor-recharts` chunk through exactly one edge — the shell's `cn` — and
 * removing this import dropped that closure from 4,758,902 to 4,357,355 bytes
 * with the chart chunk no longer reachable at all.
 *
 * Behaviour is identical to `clsx`, pinned by the equivalence test in
 * `test/unit/lib/utils.test.ts`.
 */
function toClassName(input: ClassValue): string {
  if (!input) return '';

  if (typeof input === 'string' || typeof input === 'number') {
    return String(input);
  }

  if (Array.isArray(input)) {
    return input.map(toClassName).filter(Boolean).join(' ');
  }

  if (typeof input === 'object') {
    let className = '';
    for (const key in input) {
      if ((input as Record<string, unknown>)[key]) {
        className = className ? `${className} ${key}` : key;
      }
    }
    return className;
  }

  return '';
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(toClassName(inputs));
}
