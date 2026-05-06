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

  it('fires onChange when editing a text content', () => {
    const block = createBlock('text');
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const textarea = screen.getByLabelText('Content') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'New content' } });
    expect(onChange).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({ content: 'New content' })
    );
  });

  it('fires onChange when editing an image src', () => {
    const block = createBlock('image');
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const input = screen.getByLabelText('Source URL') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://new.img/photo.jpg' } });
    expect(onChange).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({ src: 'https://new.img/photo.jpg' })
    );
  });

  it('fires onChange when editing a divider color', () => {
    const block = createBlock('divider');
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const input = screen.getAllByRole('textbox')[0] as HTMLInputElement;
    fireEvent.change(input, { target: { value: '#ff0000' } });
    expect(onChange).toHaveBeenCalledWith(block.id, expect.objectContaining({ color: '#ff0000' }));
  });

  it('fires onChange when editing a spacer height', () => {
    const block = createBlock('spacer');
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '48' } });
    expect(onChange).toHaveBeenCalledWith(block.id, expect.objectContaining({ height: 48 }));
  });

  it('fires onChange when editing a columns layout', () => {
    const block = createBlock('columns');
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const select = screen.getAllByRole('combobox')[0] as HTMLSelectElement;
    fireEvent.change(select, { target: { value: '33-67' } });
    expect(onChange).toHaveBeenCalledWith(block.id, expect.objectContaining({ layout: '33-67' }));
  });

  it('fires onChange when editing a social icon size', () => {
    const block = createBlock('social');
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const inputs = screen.getAllByRole('spinbutton') as HTMLInputElement[];
    // First number input is icon size
    fireEvent.change(inputs[0], { target: { value: '40' } });
    expect(onChange).toHaveBeenCalledWith(block.id, expect.objectContaining({ iconSize: 40 }));
  });

  it('fires onChange when editing a footer company name', () => {
    const block = createBlock('footer');
    const onChange = vi.fn();
    render(<PropertyInspector block={block} onChange={onChange} emptyContent="" />);
    const input = screen.getByLabelText('Company name') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Acme Corp' } });
    expect(onChange).toHaveBeenCalledWith(
      block.id,
      expect.objectContaining({ companyName: 'Acme Corp' })
    );
  });

  it('renders text block with renderTextEditor slot', () => {
    const block = createBlock('text');
    const renderTextEditor = vi.fn(() => <div data-testid="custom-editor">editor</div>);
    render(
      <PropertyInspector
        block={block}
        onChange={() => {}}
        emptyContent=""
        renderTextEditor={renderTextEditor}
      />
    );
    expect(screen.getByTestId('custom-editor')).toBeInTheDocument();
  });

  it('returns null for unknown block kind (default branch in renderEditor)', () => {
    // biome-ignore lint/suspicious/noExplicitAny: intentional — exercises default branch
    const unknownBlock = { id: 'x', kind: 'unknown' as any, props: {} } as any;
    const { container } = render(
      <PropertyInspector block={unknownBlock} onChange={() => {}} emptyContent="" />
    );
    // Should render the inspector wrapper but with null editor content
    expect(container.querySelector('[data-slot="email-builder-inspector"]')).toBeInTheDocument();
  });

  it('renders image block with renderMediaPicker slot (opens on click)', () => {
    const block = createBlock('image');
    const renderMediaPicker = vi.fn(() => <div data-testid="media-picker">picker</div>);
    render(
      <PropertyInspector
        block={block}
        onChange={() => {}}
        emptyContent=""
        renderMediaPicker={renderMediaPicker}
      />
    );
    // Picker button should be visible; click it to open the picker
    fireEvent.click(screen.getByText('Pick from media library'));
    expect(screen.getByTestId('media-picker')).toBeInTheDocument();
  });
});
