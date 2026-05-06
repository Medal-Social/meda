import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlockPalette } from '../../../src/email-builder/block-palette.js';

describe('Touch targets', () => {
  it('palette items have a min-height tailwind class for >=44px touch targets', () => {
    const { container } = render(<BlockPalette onPick={() => {}} />);
    const items = container.querySelectorAll('[data-slot="email-builder-palette-item"]');
    expect(items.length).toBeGreaterThan(0);
    items.forEach((item) => {
      // The Tailwind min-h-[44px] class is the contract; jsdom won't compute layout
      // but we can assert the className contains the rule we care about.
      expect(item.className).toContain('min-h-[44px]');
    });
  });
});
