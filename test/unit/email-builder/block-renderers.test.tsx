import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createBlock, getDefaultBlockProps } from '../../../src/email-builder/block-registry.js';
import { BlockRenderer } from '../../../src/email-builder/block-renderer.js';
import type { BlockKind } from '../../../src/email-builder/types.js';

const KINDS: BlockKind[] = [
  'heading',
  'text',
  'image',
  'button',
  'divider',
  'spacer',
  'columns',
  'social',
  'footer',
];

describe('BlockRenderer', () => {
  for (const kind of KINDS) {
    it(`renders the "${kind}" block without throwing`, () => {
      const block = createBlock(kind);
      const { container } = render(<BlockRenderer block={block} />);
      expect(container.querySelector(`[data-slot="email-block-${kind}"]`)).toBeTruthy();
    });
  }

  it('renders heading text in the rendered output', () => {
    const block = createBlock('heading', { text: 'Hello world' });
    render(<BlockRenderer block={block} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders default text content', () => {
    const block = createBlock('text');
    render(<BlockRenderer block={block} />);
    const defaults = getDefaultBlockProps();
    expect(screen.getByText(defaults.text.content)).toBeInTheDocument();
  });
});
