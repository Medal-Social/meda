import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createBlock } from '../../../src/email-builder/block-registry.js';
import { BlockRenderer } from '../../../src/email-builder/block-renderer.js';

describe('BlockRenderer', () => {
  it('renders a heading block without throwing', () => {
    const block = createBlock('heading', { text: 'Hello' });
    const { container } = render(<BlockRenderer block={block} />);
    expect(container).toBeTruthy();
  });

  it('renders all block kinds without throwing', () => {
    const kinds = [
      'heading',
      'text',
      'image',
      'button',
      'divider',
      'spacer',
      'columns',
      'social',
      'footer',
    ] as const;
    for (const kind of kinds) {
      const block = createBlock(kind);
      const { unmount } = render(<BlockRenderer block={block} />);
      unmount();
    }
  });

  it('wraps content in an error boundary (data-slot present when healthy)', () => {
    const block = createBlock('heading', { text: 'Test' });
    const { container } = render(<BlockRenderer block={block} />);
    // Should not show the error UI
    expect(container.querySelector('[data-slot="email-builder-block-error"]')).toBeNull();
  });

  it('shows error UI when block throws during render', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Simulate a broken block by inserting an invalid kind
    const badBlock = {
      id: 'bad',
      kind: 'heading' as const,
      // biome-ignore lint/suspicious/noExplicitAny: intentional test coercion
      props: null as any,
    };

    const { container } = render(<BlockRenderer block={badBlock} />);
    // The error boundary should catch the null-props access and show the error slot
    const errorEl = container.querySelector('[data-slot="email-builder-block-error"]');
    expect(errorEl).not.toBeNull();
    consoleSpy.mockRestore();
  });

  it('renders null for an unknown block kind (default branch)', () => {
    // Use an unknown kind to exercise the default case in BlockBody's switch
    const unknownBlock = {
      id: 'unknown',
      // biome-ignore lint/suspicious/noExplicitAny: intentional — exercises default branch
      kind: 'unknown' as any,
      props: {},
    };
    // biome-ignore lint/suspicious/noExplicitAny: intentional — exercises default branch
    const { container } = render(<BlockRenderer block={unknownBlock as any} />);
    // No error UI should show — BlockBody returns null for unknown kinds
    expect(container.querySelector('[data-slot="email-builder-block-error"]')).toBeNull();
  });
});
