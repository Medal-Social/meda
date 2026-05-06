import { describe, expect, it } from 'vitest';
import * as Root from '../../../src/index.js';
import * as Subpath from '../../../src/post-preview/index.js';

describe('post-preview public exports', () => {
  it('subpath exports PostPreview component', () => {
    expect((Subpath as Record<string, unknown>).PostPreview).toBeTypeOf('function');
  });
  it('root exports PostPreview component', () => {
    expect((Root as Record<string, unknown>).PostPreview).toBeTypeOf('function');
  });
});
