import { describe, expect, it } from 'vitest';
import {
  Avatar,
  Button,
  EmptyState,
  FilterRail,
  getInitials,
  Input,
  Skeleton,
  ToggleGroup,
} from '../../../src/index.js';
import * as primitivesEntry from '../../../src/primitives/index.js';

describe('foundation primitive root exports', () => {
  it('exports Skeleton, EmptyState, and FilterRail from the package root', () => {
    expect(Skeleton).toBeTypeOf('function');
    expect(EmptyState).toBeTypeOf('function');
    expect(FilterRail).toBeTypeOf('function');
    expect(FilterRail.Group).toBeTypeOf('function');
  });

  it('exports the booking primitives from the root and the ./primitives subpath', () => {
    for (const value of [Button, Input, Avatar, getInitials, ToggleGroup, ToggleGroup.Item]) {
      expect(value).toBeTypeOf('function');
    }
    expect(primitivesEntry.Button).toBe(Button);
    expect(primitivesEntry.Input).toBe(Input);
    expect(primitivesEntry.ToggleGroup).toBe(ToggleGroup);
    expect(primitivesEntry.Avatar).toBe(Avatar);
  });
});
