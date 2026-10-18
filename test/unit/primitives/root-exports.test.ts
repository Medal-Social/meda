import { describe, expect, it } from 'vitest';
import {
  Avatar,
  Button,
  Checkbox,
  EmptyState,
  Field,
  FilterRail,
  getInitials,
  Input,
  Sheet,
  Skeleton,
  Textarea,
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

  it('exports the form and sheet primitives from the root and the ./primitives subpath', () => {
    for (const value of [
      Checkbox,
      Field,
      Field.Label,
      Field.Error,
      Textarea,
      Sheet,
      Sheet.Content,
    ]) {
      expect(value).toBeTypeOf('function');
    }
    expect(primitivesEntry.Checkbox).toBe(Checkbox);
    expect(primitivesEntry.Field).toBe(Field);
    expect(primitivesEntry.Textarea).toBe(Textarea);
    expect(primitivesEntry.Sheet).toBe(Sheet);
  });
});
