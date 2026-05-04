import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { DividerBlockProps } from '../types.js';
import { DividerBlock } from './divider.js';

const base: DividerBlockProps = {
  color: '#e5e7eb',
  thickness: 1,
  width: 100,
  style: 'solid',
  padding: { top: 12, right: 24, bottom: 12, left: 24 },
};

describe('DividerBlock', () => {
  it('renders the divider slot', () => {
    const { container } = render(<DividerBlock props={base} />);
    expect(container.querySelector('[data-slot="email-block-divider"]')).toBeInTheDocument();
  });

  it('applies wrapper padding', () => {
    const { container } = render(
      <DividerBlock props={{ ...base, padding: { top: 10, right: 20, bottom: 5, left: 15 } }} />
    );
    const wrapper = container.querySelector('[data-slot="email-block-divider"]') as HTMLElement;
    expect(wrapper.style.paddingTop).toBe('10px');
    expect(wrapper.style.paddingRight).toBe('20px');
    expect(wrapper.style.paddingBottom).toBe('5px');
    expect(wrapper.style.paddingLeft).toBe('15px');
  });

  it('applies width percentage to the rule', () => {
    const { container } = render(<DividerBlock props={{ ...base, width: 80 }} />);
    const rule = container.querySelector('[data-slot="email-block-divider"] > div') as HTMLElement;
    expect(rule.style.width).toBe('80%');
  });

  it('applies solid border style', () => {
    const { container } = render(<DividerBlock props={{ ...base, style: 'solid' }} />);
    const rule = container.querySelector('[data-slot="email-block-divider"] > div') as HTMLElement;
    expect(rule.style.borderTopStyle).toBe('solid');
  });

  it('applies dashed border style', () => {
    const { container } = render(<DividerBlock props={{ ...base, style: 'dashed' }} />);
    const rule = container.querySelector('[data-slot="email-block-divider"] > div') as HTMLElement;
    expect(rule.style.borderTopStyle).toBe('dashed');
  });

  it('applies dotted border style', () => {
    const { container } = render(<DividerBlock props={{ ...base, style: 'dotted' }} />);
    const rule = container.querySelector('[data-slot="email-block-divider"] > div') as HTMLElement;
    expect(rule.style.borderTopStyle).toBe('dotted');
  });

  it('applies thickness to border-top-width', () => {
    const { container } = render(<DividerBlock props={{ ...base, thickness: 3 }} />);
    const rule = container.querySelector('[data-slot="email-block-divider"] > div') as HTMLElement;
    expect(rule.style.borderTopWidth).toBe('3px');
  });

  it('applies color to border-top-color', () => {
    const { container } = render(<DividerBlock props={{ ...base, color: '#ff0000' }} />);
    const rule = container.querySelector('[data-slot="email-block-divider"] > div') as HTMLElement;
    expect(rule.style.borderTopColor).toBe('rgb(255, 0, 0)');
  });

  it('centers the rule horizontally', () => {
    const { container } = render(<DividerBlock props={base} />);
    const rule = container.querySelector('[data-slot="email-block-divider"] > div') as HTMLElement;
    expect(rule.style.margin).toBe('0px auto');
  });

  it('sets height to 0', () => {
    const { container } = render(<DividerBlock props={base} />);
    const rule = container.querySelector('[data-slot="email-block-divider"] > div') as HTMLElement;
    expect(rule.style.height).toBe('0px');
  });
});
