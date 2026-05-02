import { describe, expect, it } from 'vitest';
import * as Subpath from '../index.js';
import * as Public from '../public.js';

describe('email-builder public surface', () => {
  it('root re-export exposes EmailBuilder + renderToEmailHtml', () => {
    expect(typeof Public.EmailBuilder).toBe('function');
    expect(typeof Public.renderToEmailHtml).toBe('function');
  });

  it('subpath barrel exposes the full surface', () => {
    expect(typeof Subpath.EmailBuilder).toBe('function');
    expect(typeof Subpath.BlockPalette).toBe('function');
    expect(typeof Subpath.PropertyInspector).toBe('function');
    expect(typeof Subpath.BuilderCanvas).toBe('function');
    expect(typeof Subpath.renderToEmailHtml).toBe('function');
    expect(typeof Subpath.createBlock).toBe('function');
    expect(typeof Subpath.createStarterDocument).toBe('function');
    expect(Array.isArray(Subpath.BLOCK_REGISTRY)).toBe(true);
  });
});
