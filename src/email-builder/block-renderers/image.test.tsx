import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ImageBlockProps } from '../types.js';
import { ImageBlock } from './image.js';

const base: ImageBlockProps = {
  src: 'https://example.com/photo.jpg',
  alt: 'A photo',
  linkUrl: '',
  width: 600,
  height: 'auto',
  alignment: 'center',
  padding: { top: 12, right: 24, bottom: 12, left: 24 },
};

describe('ImageBlock', () => {
  it('renders the image slot', () => {
    const { container } = render(<ImageBlock props={base} />);
    expect(container.querySelector('[data-slot="email-block-image"]')).toBeInTheDocument();
  });

  it('renders an img element when src is provided', () => {
    render(<ImageBlock props={base} />);
    expect(screen.getByRole('img', { name: 'A photo' })).toBeInTheDocument();
  });

  it('shows the no-image placeholder when src is empty', () => {
    render(<ImageBlock props={{ ...base, src: '' }} />);
    expect(screen.getByText('No image selected')).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'A photo' })).not.toBeInTheDocument();
  });

  it('wraps the image in a link when linkUrl is set', () => {
    render(<ImageBlock props={{ ...base, linkUrl: 'https://example.com' }} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('img')).toBeInTheDocument();
  });

  it('does not wrap in link when linkUrl is empty', () => {
    render(<ImageBlock props={{ ...base, linkUrl: '' }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('applies numeric height as a number attribute', () => {
    render(<ImageBlock props={{ ...base, height: 300 }} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('height', '300');
  });

  it('omits height attribute when height is "auto"', () => {
    render(<ImageBlock props={{ ...base, height: 'auto' }} />);
    const img = screen.getByRole('img');
    expect(img).not.toHaveAttribute('height');
  });

  it('applies width attribute', () => {
    render(<ImageBlock props={{ ...base, width: 400 }} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '400');
  });

  it('applies src attribute', () => {
    render(<ImageBlock props={base} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });

  it('applies alt attribute', () => {
    render(<ImageBlock props={{ ...base, alt: 'Descriptive alt' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Descriptive alt');
  });

  it('applies wrapper alignment style', () => {
    const { container } = render(<ImageBlock props={{ ...base, alignment: 'right' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-image"]') as HTMLElement;
    expect(wrapper.style.textAlign).toBe('right');
  });

  it('applies wrapper padding', () => {
    const { container } = render(
      <ImageBlock props={{ ...base, padding: { top: 10, right: 20, bottom: 5, left: 15 } }} />
    );
    const wrapper = container.querySelector('[data-slot="email-block-image"]') as HTMLElement;
    expect(wrapper.style.paddingTop).toBe('10px');
    expect(wrapper.style.paddingRight).toBe('20px');
    expect(wrapper.style.paddingBottom).toBe('5px');
    expect(wrapper.style.paddingLeft).toBe('15px');
  });

  it('placeholder uses maxWidth from props.width when src is empty', () => {
    const { container } = render(<ImageBlock props={{ ...base, src: '', width: 400 }} />);
    const placeholder = container.querySelector(
      '[data-slot="email-block-image"] > div'
    ) as HTMLElement;
    expect(placeholder.style.maxWidth).toBe('400px');
  });
});
