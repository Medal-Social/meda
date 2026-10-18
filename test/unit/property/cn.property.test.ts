import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { cn } from '../../../src/lib/utils.js';

/**
 * `cn` is called by nearly every component in this package, and its clsx
 * flattening is hand-inlined (see the comment in src/lib/utils.ts explaining
 * why). A hand-rolled flattener is exactly the thing to generate inputs for:
 * the example tests next door cover the shapes someone thought of, and these
 * cover the ones nobody did — deeply nested arrays, holes, falsy members,
 * numeric zero, objects whose values are every flavour of falsy.
 *
 * The equivalence test against clsx lives in test/unit/lib/utils.test.ts; this
 * file asserts the invariants that hold regardless of what clsx would do.
 */

/** Realistic Tailwind-ish tokens, including conflicting pairs twMerge resolves. */
const token = fc.constantFrom(
  'p-2',
  'p-4',
  'px-2',
  'text-sm',
  'text-lg',
  'text-white',
  'text-black',
  'bg-red-500',
  'bg-blue-500',
  'flex',
  'grid',
  'rounded-full',
  'rounded-sm',
  'size-8',
  'size-11'
);

const falsy = fc.constantFrom(false, null, undefined, 0, '');

/** clsx-style ClassValue, three levels deep. */
const classValue = fc.letrec((tie) => ({
  value: fc.oneof(
    { depthSize: 'small' },
    token,
    falsy,
    fc.dictionary(token, fc.oneof(fc.boolean(), falsy)),
    fc.array(tie('value'), { maxLength: 4 })
  ),
})).value;

const classValues = fc.array(classValue, { maxLength: 6 });

describe('cn (property)', () => {
  it('only ever emits tokens that were present in the input', () => {
    // twMerge may DROP a class (conflict resolution) but must never invent one.
    fc.assert(
      fc.property(classValues, (inputs) => {
        const out = cn(...inputs);
        const seen = new Set<string>();
        const collect = (v: unknown): void => {
          if (typeof v === 'string') {
            for (const t of v.split(/\s+/).filter(Boolean)) seen.add(t);
          } else if (Array.isArray(v)) {
            for (const inner of v) collect(inner);
          } else if (v && typeof v === 'object') {
            for (const k of Object.keys(v)) seen.add(k);
          }
        };
        for (const v of inputs) collect(v);

        for (const t of out.split(/\s+/).filter(Boolean)) {
          expect(seen.has(t)).toBe(true);
        }
      })
    );
  });

  it('produces a normalised string — no padding, no double spaces', () => {
    // Components interpolate the result straight into `className`, and a
    // stray double space is the classic symptom of a flattener joining an
    // empty branch.
    fc.assert(
      fc.property(classValues, (inputs) => {
        const out = cn(...inputs);
        expect(out).toBe(out.trim());
        expect(out).not.toMatch(/\s\s/);
        expect(out).not.toMatch(/[\n\t]/);
      })
    );
  });

  it('is idempotent: re-running it over its own output is a no-op', () => {
    // Composed components routinely pass a parent `className` that was itself
    // produced by `cn`. If that were not stable, conflict resolution would
    // depend on how many wrappers a component happens to have.
    fc.assert(
      fc.property(classValues, (inputs) => {
        const once = cn(...inputs);
        expect(cn(once)).toBe(once);
      })
    );
  });

  it('ignores falsy members entirely', () => {
    // `cn('flex', cond && 'hidden')` is the single most common call shape in
    // this package.
    fc.assert(
      fc.property(classValues, fc.array(falsy, { maxLength: 4 }), (inputs, noise) => {
        expect(cn(...inputs, ...noise)).toBe(cn(...inputs));
        expect(cn(...noise, ...inputs)).toBe(cn(...inputs));
      })
    );
  });

  it('returns an empty string when there is nothing to emit', () => {
    fc.assert(
      fc.property(fc.array(falsy, { maxLength: 6 }), (noise) => {
        expect(cn(...noise)).toBe('');
      })
    );
    expect(cn()).toBe('');
  });
});
