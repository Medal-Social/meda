import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ButtonBlock } from '../../../../src/email-builder/block-renderers/button.js';
import type { ButtonBlockProps } from '../../../../src/email-builder/types.js';

const base: ButtonBlockProps = {
  text: 'Click me',
  url: 'https://example.com',
  backgroundColor: '#4F46E5',
  textColor: '#ffffff',
  borderRadius: 8,
  size: 'md',
  alignment: 'center',
  fullWidth: false,
  padding: { top: 12, right: 24, bottom: 12, left: 24 },
};

describe('ButtonBlock', () => {
  it('renders the button text and href', () => {
    render(<ButtonBlock props={base} />);
    const link = screen.getByRole('link', { name: 'Click me' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('applies wrapper alignment style', () => {
    const { container } = render(<ButtonBlock props={{ ...base, alignment: 'left' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-button"]') as HTMLElement;
    expect(wrapper.style.textAlign).toBe('left');
  });

  it('sets width to 100% when fullWidth is true', () => {
    render(<ButtonBlock props={{ ...base, fullWidth: true }} />);
    const link = screen.getByRole('link');
    expect(link.style.width).toBe('100%');
  });

  it('leaves width undefined when fullWidth is false', () => {
    render(<ButtonBlock props={{ ...base, fullWidth: false }} />);
    const link = screen.getByRole('link');
    expect(link.style.width).toBe('');
  });

  it('applies sm size padding/font', () => {
    render(<ButtonBlock props={{ ...base, size: 'sm' }} />);
    const link = screen.getByRole('link');
    expect(link.style.fontSize).toBe('14px');
    expect(link.style.padding).toBe('8px 16px');
  });

  it('applies md size padding/font', () => {
    render(<ButtonBlock props={{ ...base, size: 'md' }} />);
    const link = screen.getByRole('link');
    expect(link.style.fontSize).toBe('16px');
    expect(link.style.padding).toBe('12px 24px');
  });

  it('applies lg size padding/font', () => {
    render(<ButtonBlock props={{ ...base, size: 'lg' }} />);
    const link = screen.getByRole('link');
    expect(link.style.fontSize).toBe('18px');
    expect(link.style.padding).toBe('16px 32px');
  });

  it('applies background and text color', () => {
    render(<ButtonBlock props={{ ...base, backgroundColor: '#ff0000', textColor: '#000000' }} />);
    const link = screen.getByRole('link');
    expect(link.style.backgroundColor).toBe('rgb(255, 0, 0)');
    expect(link.style.color).toBe('rgb(0, 0, 0)');
  });

  it('applies border radius', () => {
    render(<ButtonBlock props={{ ...base, borderRadius: 20 }} />);
    const link = screen.getByRole('link');
    expect(link.style.borderRadius).toBe('20px');
  });

  it('applies wrapper padding', () => {
    const { container } = render(
      <ButtonBlock props={{ ...base, padding: { top: 10, right: 20, bottom: 5, left: 15 } }} />
    );
    const wrapper = container.querySelector('[data-slot="email-block-button"]') as HTMLElement;
    expect(wrapper.style.paddingTop).toBe('10px');
    expect(wrapper.style.paddingRight).toBe('20px');
    expect(wrapper.style.paddingBottom).toBe('5px');
    expect(wrapper.style.paddingLeft).toBe('15px');
  });

  it('sets rel="noopener noreferrer" on the link', () => {
    render(<ButtonBlock props={base} />);
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
