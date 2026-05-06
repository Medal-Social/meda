import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ColumnsBlock } from '../../../../src/email-builder/block-renderers/columns.js';
import type { ColumnsBlockProps, EmailBlock } from '../../../../src/email-builder/types.js';

const base: ColumnsBlockProps = {
  layout: '50-50',
  verticalAlignment: 'top',
  backgroundColor: 'transparent',
  gap: 16,
  mobileStacking: true,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
};

describe('ColumnsBlock', () => {
  it('renders two cells for 50-50 layout', () => {
    const { container } = render(<ColumnsBlock props={base} />);
    const cells = container.querySelectorAll('[data-slot="email-block-columns-cell"]');
    expect(cells).toHaveLength(2);
  });

  it('renders three cells for 33-33-33 layout', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, layout: '33-33-33' }} />);
    const cells = container.querySelectorAll('[data-slot="email-block-columns-cell"]');
    expect(cells).toHaveLength(3);
  });

  it('renders two cells for 33-67 layout', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, layout: '33-67' }} />);
    const cells = container.querySelectorAll('[data-slot="email-block-columns-cell"]');
    expect(cells).toHaveLength(2);
  });

  it('renders two cells for 67-33 layout', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, layout: '67-33' }} />);
    const cells = container.querySelectorAll('[data-slot="email-block-columns-cell"]');
    expect(cells).toHaveLength(2);
  });

  it('sets alignItems to flex-start for top alignment', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, verticalAlignment: 'top' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-columns"]') as HTMLElement;
    expect(wrapper.style.alignItems).toBe('flex-start');
  });

  it('sets alignItems to center for middle alignment', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, verticalAlignment: 'middle' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-columns"]') as HTMLElement;
    expect(wrapper.style.alignItems).toBe('center');
  });

  it('sets alignItems to flex-end for bottom alignment', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, verticalAlignment: 'bottom' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-columns"]') as HTMLElement;
    expect(wrapper.style.alignItems).toBe('flex-end');
  });

  it('applies backgroundColor when not transparent', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, backgroundColor: '#ff0000' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-columns"]') as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('rgb(255, 0, 0)');
  });

  it('omits backgroundColor style when transparent', () => {
    const { container } = render(
      <ColumnsBlock props={{ ...base, backgroundColor: 'transparent' }} />
    );
    const wrapper = container.querySelector('[data-slot="email-block-columns"]') as HTMLElement;
    expect(wrapper.style.backgroundColor).toBe('');
  });

  it('renders child blocks in the correct column', () => {
    const childBlock: EmailBlock = {
      id: 'child-1',
      kind: 'spacer',
      props: { height: 8 },
    };
    render(<ColumnsBlock props={base} columnChildren={[[childBlock], []]} />);
    const spacer = document.querySelector('[data-slot="email-block-spacer"]');
    expect(spacer).toBeInTheDocument();
  });

  it('renders empty columns when columnChildren is not provided', () => {
    const { container } = render(<ColumnsBlock props={base} />);
    const cells = container.querySelectorAll('[data-slot="email-block-columns-cell"]');
    expect(cells[0]?.childNodes).toHaveLength(0);
  });

  it('sets flexDirection to row when mobileStacking is false', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, mobileStacking: false }} />);
    const wrapper = container.querySelector('[data-slot="email-block-columns"]') as HTMLElement;
    expect(wrapper.style.flexDirection).toBe('row');
  });

  it('omits flexDirection when mobileStacking is true', () => {
    const { container } = render(<ColumnsBlock props={{ ...base, mobileStacking: true }} />);
    const wrapper = container.querySelector('[data-slot="email-block-columns"]') as HTMLElement;
    expect(wrapper.style.flexDirection).toBe('');
  });

  it('renders multiple child blocks per column', () => {
    const block1: EmailBlock = { id: 'b1', kind: 'spacer', props: { height: 4 } };
    const block2: EmailBlock = { id: 'b2', kind: 'spacer', props: { height: 8 } };
    const { container } = render(
      <ColumnsBlock props={base} columnChildren={[[block1, block2], []]} />
    );
    const spacers = container.querySelectorAll('[data-slot="email-block-spacer"]');
    expect(spacers).toHaveLength(2);
  });

  it('renders text blocks inside columns', () => {
    const textBlock: EmailBlock = {
      id: 'txt-1',
      kind: 'text',
      props: {
        content: 'Column content',
        alignment: 'left',
        color: '#000',
        fontFamily: '',
        fontWeight: 400,
        fontSize: 14,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
      },
    };
    render(<ColumnsBlock props={base} columnChildren={[[textBlock], []]} />);
    expect(screen.getByText('Column content')).toBeInTheDocument();
  });
});
