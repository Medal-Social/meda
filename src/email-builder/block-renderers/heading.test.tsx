import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { HeadingBlockProps } from '../types.js';
import { HeadingBlock } from './heading.js';

const base: HeadingBlockProps = {
  text: 'Hello world',
  level: 2,
  alignment: 'left',
  color: '#111827',
  fontFamily: '',
  fontWeight: 600,
  fontSize: 28,
  padding: { top: 12, right: 24, bottom: 12, left: 24 },
};

describe('HeadingBlock', () => {
  it('renders the heading slot', () => {
    const { container } = render(<HeadingBlock props={base} />);
    expect(container.querySelector('[data-slot="email-block-heading"]')).toBeInTheDocument();
  });

  it('renders the heading text', () => {
    render(<HeadingBlock props={base} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders h1 for level 1', () => {
    render(<HeadingBlock props={{ ...base, level: 1, text: 'H1 text' }} />);
    expect(screen.getByRole('heading', { level: 1, name: 'H1 text' })).toBeInTheDocument();
  });

  it('renders h2 for level 2', () => {
    render(<HeadingBlock props={{ ...base, level: 2, text: 'H2 text' }} />);
    expect(screen.getByRole('heading', { level: 2, name: 'H2 text' })).toBeInTheDocument();
  });

  it('renders h3 for level 3', () => {
    render(<HeadingBlock props={{ ...base, level: 3, text: 'H3 text' }} />);
    expect(screen.getByRole('heading', { level: 3, name: 'H3 text' })).toBeInTheDocument();
  });

  it('applies text alignment', () => {
    const { container } = render(<HeadingBlock props={{ ...base, alignment: 'center' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-heading"]') as HTMLElement;
    expect(wrapper.style.textAlign).toBe('center');
  });

  it('applies padding', () => {
    const { container } = render(
      <HeadingBlock props={{ ...base, padding: { top: 10, right: 20, bottom: 5, left: 15 } }} />
    );
    const wrapper = container.querySelector('[data-slot="email-block-heading"]') as HTMLElement;
    expect(wrapper.style.paddingTop).toBe('10px');
    expect(wrapper.style.paddingRight).toBe('20px');
    expect(wrapper.style.paddingBottom).toBe('5px');
    expect(wrapper.style.paddingLeft).toBe('15px');
  });

  it('applies color style to the heading element', () => {
    render(<HeadingBlock props={{ ...base, color: '#ff0000' }} />);
    const heading = screen.getByRole('heading');
    expect(heading.style.color).toBe('rgb(255, 0, 0)');
  });

  it('applies font size to the heading element', () => {
    render(<HeadingBlock props={{ ...base, fontSize: 36 }} />);
    const heading = screen.getByRole('heading');
    expect(heading.style.fontSize).toBe('36px');
  });

  it('applies font weight to the heading element', () => {
    render(<HeadingBlock props={{ ...base, fontWeight: 700 }} />);
    const heading = screen.getByRole('heading');
    expect(heading.style.fontWeight).toBe('700');
  });

  it('applies fontFamily when set', () => {
    render(<HeadingBlock props={{ ...base, fontFamily: 'Georgia' }} />);
    const heading = screen.getByRole('heading');
    expect(heading.style.fontFamily).toBe('Georgia');
  });

  it('omits fontFamily style when fontFamily is empty string', () => {
    render(<HeadingBlock props={{ ...base, fontFamily: '' }} />);
    const heading = screen.getByRole('heading');
    expect(heading.style.fontFamily).toBe('');
  });
});
