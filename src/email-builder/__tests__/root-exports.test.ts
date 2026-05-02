import { describe, expect, it } from 'vitest';
import * as Subpath from '../index.js';
import * as Public from '../public.js';

describe('email-builder public surface', () => {
  it('root re-export exposes EmailBuilder + renderToEmailHtml', () => {
    expect(typeof Public.EmailBuilder).toBe('function');
    expect(typeof Public.renderToEmailHtml).toBe('function');
  });

  it('subpath barrel exposes EmailBuilder, renderToEmailHtml, and createStarterDocument', () => {
    expect(typeof Subpath.EmailBuilder).toBe('function');
    expect(typeof Subpath.renderToEmailHtml).toBe('function');
    expect(typeof Subpath.createStarterDocument).toBe('function');
  });

  it('subpath barrel does not expose internal pieces', () => {
    expect((Subpath as Record<string, unknown>)['BlockPalette']).toBeUndefined();
    expect((Subpath as Record<string, unknown>)['PropertyInspector']).toBeUndefined();
    expect((Subpath as Record<string, unknown>)['BuilderCanvas']).toBeUndefined();
    expect((Subpath as Record<string, unknown>)['BLOCK_REGISTRY']).toBeUndefined();
    expect((Subpath as Record<string, unknown>)['createBlock']).toBeUndefined();
  });
});
