import { describe, expect, it } from 'vitest';
import { EmptyState, FilterRail, Skeleton } from '../../../src/index.js';

describe('foundation primitive root exports', () => {
  it('exports Skeleton, EmptyState, and FilterRail from the package root', () => {
    expect(Skeleton).toBeTypeOf('function');
    expect(EmptyState).toBeTypeOf('function');
    expect(FilterRail).toBeTypeOf('function');
    expect(FilterRail.Group).toBeTypeOf('function');
  });
});
