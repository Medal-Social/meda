import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SpacerBlockProps } from '../types.js';
import { SpacerBlock } from './spacer.js';

const base: SpacerBlockProps = { height: 24 };

describe('SpacerBlock', () => {
  it('renders the spacer slot', () => {
    const { container } = render(<SpacerBlock props={base} />);
    expect(container.querySelector('[data-slot="email-block-spacer"]')).toBeInTheDocument();
  });

  it('applies the height style', () => {
    const { container } = render(<SpacerBlock props={base} />);
    const spacer = container.querySelector('[data-slot="email-block-spacer"]') as HTMLElement;
    expect(spacer.style.height).toBe('24px');
  });

  it('sets width to 100%', () => {
    const { container } = render(<SpacerBlock props={base} />);
    const spacer = container.querySelector('[data-slot="email-block-spacer"]') as HTMLElement;
    expect(spacer.style.width).toBe('100%');
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<SpacerBlock props={base} />);
    const spacer = container.querySelector('[data-slot="email-block-spacer"]') as HTMLElement;
    expect(spacer).toHaveAttribute('aria-hidden');
  });

  it('applies a different height value', () => {
    const { container } = render(<SpacerBlock props={{ height: 64 }} />);
    const spacer = container.querySelector('[data-slot="email-block-spacer"]') as HTMLElement;
    expect(spacer.style.height).toBe('64px');
  });
});
