import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { VoiceOrb } from './voice-orb.js';

afterEach(() => cleanup());

describe('VoiceOrb (WebGL)', () => {
  it('renders a button with default label', () => {
    const { container } = render(<VoiceOrb pressed={false} />);
    const region = within(container);
    const btn = region.getByRole('button', { name: /hold to talk/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects pressed state in aria-pressed', () => {
    const { container } = render(<VoiceOrb pressed={true} />);
    expect(within(container).getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('disabled state blocks interaction', () => {
    const { container } = render(<VoiceOrb pressed={false} disabled />);
    expect(within(container).getByRole('button')).toBeDisabled();
  });

  it('reflects phase via data-phase', () => {
    const { container } = render(<VoiceOrb pressed={false} phase="thinking" />);
    expect(within(container).getByRole('button')).toHaveAttribute('data-phase', 'thinking');
  });

  it('accepts level + outputLevel + colors props without crashing', () => {
    const { container } = render(
      <VoiceOrb pressed={false} level={0.5} outputLevel={0.3} colors={['#FF0000', '#00FF00']} />
    );
    expect(within(container).getByRole('button')).toBeInTheDocument();
  });
});
