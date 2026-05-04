import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TextBlockProps } from '../types.js';
import { TextBlock } from './text.js';

const base: TextBlockProps = {
  content: 'Hello world',
  alignment: 'left',
  color: '#374151',
  fontFamily: '',
  fontWeight: 400,
  fontSize: 16,
  padding: { top: 12, right: 24, bottom: 12, left: 24 },
};

describe('TextBlock', () => {
  it('renders the text slot', () => {
    const { container } = render(<TextBlock props={base} />);
    expect(container.querySelector('[data-slot="email-block-text"]')).toBeInTheDocument();
  });

  it('renders single-paragraph content', () => {
    render(<TextBlock props={base} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders multi-paragraph content split on blank lines', () => {
    render(<TextBlock props={{ ...base, content: 'First paragraph\n\nSecond paragraph' }} />);
    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
  });

  it('renders line breaks within a paragraph', () => {
    const { container } = render(<TextBlock props={{ ...base, content: 'Line one\nLine two' }} />);
    const brs = container.querySelectorAll('br');
    expect(brs.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render a br after the last line in a paragraph', () => {
    // Single line → no <br>
    const { container } = render(<TextBlock props={{ ...base, content: 'Only one line' }} />);
    expect(container.querySelectorAll('br')).toHaveLength(0);
  });

  it('applies marginTop to paragraphs after the first', () => {
    const { container } = render(
      <TextBlock props={{ ...base, content: 'Para 1\n\nPara 2\n\nPara 3' }} />
    );
    const paras = container.querySelectorAll('p');
    expect(paras).toHaveLength(3);
    expect(paras[0]?.style.margin).toBe('0px');
    expect(paras[1]?.style.marginTop).toBe('12px');
    expect(paras[2]?.style.marginTop).toBe('12px');
  });

  it('applies text alignment', () => {
    const { container } = render(<TextBlock props={{ ...base, alignment: 'center' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-text"]') as HTMLElement;
    expect(wrapper.style.textAlign).toBe('center');
  });

  it('applies color', () => {
    const { container } = render(<TextBlock props={{ ...base, color: '#ff0000' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-text"]') as HTMLElement;
    expect(wrapper.style.color).toBe('rgb(255, 0, 0)');
  });

  it('applies font size', () => {
    const { container } = render(<TextBlock props={{ ...base, fontSize: 18 }} />);
    const wrapper = container.querySelector('[data-slot="email-block-text"]') as HTMLElement;
    expect(wrapper.style.fontSize).toBe('18px');
  });

  it('applies font weight', () => {
    const { container } = render(<TextBlock props={{ ...base, fontWeight: 700 }} />);
    const wrapper = container.querySelector('[data-slot="email-block-text"]') as HTMLElement;
    expect(wrapper.style.fontWeight).toBe('700');
  });

  it('applies fontFamily when set', () => {
    const { container } = render(<TextBlock props={{ ...base, fontFamily: 'Arial' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-text"]') as HTMLElement;
    expect(wrapper.style.fontFamily).toBe('Arial');
  });

  it('omits fontFamily style when fontFamily is empty', () => {
    const { container } = render(<TextBlock props={{ ...base, fontFamily: '' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-text"]') as HTMLElement;
    expect(wrapper.style.fontFamily).toBe('');
  });

  it('applies wrapper padding', () => {
    const { container } = render(
      <TextBlock props={{ ...base, padding: { top: 10, right: 20, bottom: 5, left: 15 } }} />
    );
    const wrapper = container.querySelector('[data-slot="email-block-text"]') as HTMLElement;
    expect(wrapper.style.paddingTop).toBe('10px');
    expect(wrapper.style.paddingRight).toBe('20px');
    expect(wrapper.style.paddingBottom).toBe('5px');
    expect(wrapper.style.paddingLeft).toBe('15px');
  });

  it('renders three or more consecutive newlines as separate paragraphs', () => {
    const { container } = render(<TextBlock props={{ ...base, content: 'A\n\n\nB' }} />);
    const paras = container.querySelectorAll('p');
    expect(paras.length).toBeGreaterThanOrEqual(2);
  });
});
