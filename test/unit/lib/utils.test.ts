import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { describe, expect, it } from 'vitest';
import { cn } from '../../../src/lib/utils.js';

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });
  it('dedupes conflicting tailwind classes (last wins)', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
  it('handles falsy + conditional values', () => {
    expect(cn('a', false && 'b', null, undefined, 'c')).toBe('a c');
  });
});

/**
 * `cn` no longer calls `clsx` at runtime — the flattener is inlined so that
 * importing `cn` does not drag the shared `clsx` module (and, with it, the
 * chart vendor chunk it gets grouped into) into an eager bundle.
 *
 * That inlining is only safe while it behaves EXACTLY like the implementation
 * it replaced, so this pins it to that implementation rather than to
 * hand-written expectations: any drift in the flattener fails here.
 */
const previousCn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

describe('cn matches the clsx-based implementation it replaced', () => {
  const cases: ClassValue[][] = [
    [],
    ['a'],
    ['a', 'b', 'c'],
    ['  a  ', 'b'],
    ['a', undefined, null, false, '', 'b'],
    ['a', 0, 1, 'b'],
    [0],
    [''],
    [{ a: true, b: false, c: true }],
    [{ a: 1, b: 0, c: 'x', d: null }],
    [{}],
    [['a', 'b']],
    [['a', ['b', ['c', ['d']]]]],
    [['a', false, ['b', null, ['c', undefined]]]],
    [[{ a: true }, ['b', { c: true, d: false }]]],
    [[]],
    [[[], [[]]]],
    ['a', ['b', { c: true }], { d: true }, null, 'e'],
    // tailwind-merge still has to see the flattened string, so conflicts
    // resolve the same way through either path.
    ['p-2', ['p-4', { 'p-8': true }]],
    ['text-sm', { 'text-lg': true, 'text-xs': false }],
    [true, 'a'],
    [Number.NaN, 'a'],
    [10n, 'a'],
  ];

  for (const [index, args] of cases.entries()) {
    it(`case ${index}: ${JSON.stringify(args, (_k, v) => (typeof v === 'bigint' ? `${v}n` : v))}`, () => {
      expect(cn(...args)).toBe(previousCn(...args));
    });
  }
});
