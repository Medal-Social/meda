import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createBlock } from '../../../src/email-builder/block-registry.js';
import { PropertyInspector } from '../../../src/email-builder/property-inspector.js';

describe('PropertyInspector', () => {
  it('shows the empty content when no block is selected', () => {
    render(<PropertyInspector block={null} onChange={() => {}} emptyContent="Pick one" />);
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('fires onChange when editing a heading text', () => {
    const block = createBlock('heading', { text: 'Old' });
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const input = screen.getByLabelText('Text') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'New' } });
    expect(onChange).toHaveBeenCalledWith(block.id, expect.objectContaining({ text: 'New' }));
  });

  it('fires onChange when editing a button URL', () => {
    const block = createBlock('button');
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const input = screen.getByLabelText('URL') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://new.example' } });
    expect(onChange).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({ url: 'https://new.example' })
    );
  });

  it('renders editor for each block kind without throwing', () => {
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
      const { unmount } = render(
        <PropertyInspector block={block} onChange={() => {}} emptyContent="" />
      );
      unmount();
    }
  });
});
