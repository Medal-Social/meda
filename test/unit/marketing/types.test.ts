import { describe, expect, it } from 'vitest';
import type { MarketingNavItemDescriptor } from '../../../src/marketing/types.js';

describe('MarketingNavMenuItem features shorthand', () => {
  it('accepts a features array on a menu item', () => {
    const item: MarketingNavItemDescriptor = {
      id: 'products',
      label: 'Products',
      hasMenu: true,
      features: [{ id: 'a', title: 'A', href: '/a' }],
    };
    expect(item.hasMenu).toBe(true);
    expect('features' in item).toBe(true);
    expect(item.features?.[0]?.href).toBe('/a');
  });
});
