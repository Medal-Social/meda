import { describe, expect, it } from 'vitest';
import {
  colorPrimitives,
  motionTokens,
  radiusTokens,
  semanticTokens,
  shellTokens,
  spacingTokens,
  typographyTokens,
  zIndexTokens,
} from './tokens-registry';

describe('tokens-registry', () => {
  it('color primitives expose every brand stop 50 to 950', () => {
    expect(colorPrimitives.brand).toEqual([
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      '950',
    ]);
  });

  it('color primitives include all semantic ramps', () => {
    expect(Object.keys(colorPrimitives).sort()).toEqual([
      'brand',
      'error',
      'info',
      'neutral',
      'success',
      'warning',
    ]);
  });

  it('semantic tokens include shadcn shape', () => {
    const names = semanticTokens.map((token) => token.name);
    for (const required of ['background', 'foreground', 'card', 'primary', 'border', 'ring']) {
      expect(names).toContain(required);
    }
  });

  it('shell tokens cover header, rail, context, panel, main', () => {
    const names = shellTokens.map((token) => token.name);
    for (const required of [
      'shell-header',
      'shell-rail',
      'shell-context',
      'shell-panel',
      'shell-main',
    ]) {
      expect(names).toContain(required);
    }
  });

  it('spacing scale is xs through 4xl in ascending pixel order', () => {
    expect(spacingTokens.map((token) => token.name)).toEqual([
      'xs',
      'sm',
      'md',
      'lg',
      'xl',
      '2xl',
      '3xl',
      '4xl',
    ]);
    const px = spacingTokens.map((token) => token.px);
    for (let i = 1; i < px.length; i += 1) {
      expect(px[i]).toBeGreaterThan(px[i - 1]);
    }
  });

  it('radius scale includes full', () => {
    expect(radiusTokens.map((token) => token.name)).toContain('full');
  });

  it('motion durations are in milliseconds', () => {
    for (const token of motionTokens) {
      expect(token.duration).toMatch(/^\d+ms$/);
    }
  });

  it('z-index values are numeric strings', () => {
    for (const token of zIndexTokens) {
      expect(token.value).toMatch(/^\d+$/);
    }
  });

  it('typography ramps include display through overline', () => {
    const names = typographyTokens.sizes.map((token) => token.name);
    for (const required of [
      'display',
      'h1',
      'h2',
      'h3',
      'h4',
      'body-lg',
      'body',
      'caption',
      'overline',
    ]) {
      expect(names).toContain(required);
    }
  });
});
