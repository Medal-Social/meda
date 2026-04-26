import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VoiceOrb } from './voice-orb.js';

describe('VoiceOrb', () => {
  it('renders a button with default label', () => {
    const { container } = render(<VoiceOrb pressed={false} />);
    const btn = container.querySelector('button');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('aria-label', 'Hold to talk');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('reflects pressed state in aria-pressed', () => {
    const { container } = render(<VoiceOrb pressed={true} />);
    const btn = container.querySelector('button');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('disabled state blocks interaction', () => {
    const { container } = render(<VoiceOrb pressed={false} disabled />);
    const btn = container.querySelector('button');
    expect(btn).toBeDisabled();
  });

  it('reflects phase via data-phase', () => {
    const { container } = render(<VoiceOrb pressed={false} phase="thinking" />);
    const btn = container.querySelector('button');
    expect(btn).toHaveAttribute('data-phase', 'thinking');
  });
});
