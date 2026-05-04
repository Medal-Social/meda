import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FooterBlockProps } from '../types.js';
import { FooterBlock } from './footer.js';

const base: FooterBlockProps = {
  companyName: 'Acme Corp',
  address: '123 Main St',
  customText: 'Custom text here',
  unsubscribeText: 'Unsubscribe',
  textColor: '#6b7280',
  fontSize: 12,
  alignment: 'center',
  padding: { top: 24, right: 24, bottom: 24, left: 24 },
};

describe('FooterBlock', () => {
  it('renders the footer slot', () => {
    const { container } = render(<FooterBlock props={base} />);
    expect(container.querySelector('[data-slot="email-block-footer"]')).toBeInTheDocument();
  });

  it('renders company name', () => {
    render(<FooterBlock props={base} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders address', () => {
    render(<FooterBlock props={base} />);
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });

  it('renders custom text', () => {
    render(<FooterBlock props={base} />);
    expect(screen.getByText('Custom text here')).toBeInTheDocument();
  });

  it('renders unsubscribe link', () => {
    render(<FooterBlock props={base} />);
    const link = screen.getByRole('link', { name: 'Unsubscribe' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '#unsubscribe');
  });

  it('omits company name when empty string', () => {
    render(<FooterBlock props={{ ...base, companyName: '' }} />);
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });

  it('omits address when empty string', () => {
    render(<FooterBlock props={{ ...base, address: '' }} />);
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
  });

  it('omits custom text when empty string', () => {
    render(<FooterBlock props={{ ...base, customText: '' }} />);
    expect(screen.queryByText('Custom text here')).not.toBeInTheDocument();
  });

  it('omits unsubscribe link when empty string', () => {
    render(<FooterBlock props={{ ...base, unsubscribeText: '' }} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('applies text alignment', () => {
    const { container } = render(<FooterBlock props={{ ...base, alignment: 'left' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-footer"]') as HTMLElement;
    expect(wrapper.style.textAlign).toBe('left');
  });

  it('applies font size', () => {
    const { container } = render(<FooterBlock props={{ ...base, fontSize: 14 }} />);
    const wrapper = container.querySelector('[data-slot="email-block-footer"]') as HTMLElement;
    expect(wrapper.style.fontSize).toBe('14px');
  });

  it('applies text color', () => {
    const { container } = render(<FooterBlock props={{ ...base, textColor: '#ff0000' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-footer"]') as HTMLElement;
    expect(wrapper.style.color).toBe('rgb(255, 0, 0)');
  });

  it('applies wrapper padding', () => {
    const { container } = render(
      <FooterBlock props={{ ...base, padding: { top: 10, right: 20, bottom: 5, left: 15 } }} />
    );
    const wrapper = container.querySelector('[data-slot="email-block-footer"]') as HTMLElement;
    expect(wrapper.style.paddingTop).toBe('10px');
    expect(wrapper.style.paddingRight).toBe('20px');
    expect(wrapper.style.paddingBottom).toBe('5px');
    expect(wrapper.style.paddingLeft).toBe('15px');
  });

  it('renders with all optional fields absent', () => {
    const minimal: FooterBlockProps = {
      companyName: '',
      address: '',
      customText: '',
      unsubscribeText: '',
      textColor: '#000',
      fontSize: 12,
      alignment: 'center',
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    };
    const { container } = render(<FooterBlock props={minimal} />);
    const wrapper = container.querySelector('[data-slot="email-block-footer"]') as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.childNodes).toHaveLength(0);
  });
});
