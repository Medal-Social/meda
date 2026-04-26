import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { parseColor, VoiceOrb } from './voice-orb.js';

afterEach(() => cleanup());

// ---------------------------------------------------------------------------
// parseColor unit tests (Issue 5 — orb color parser)
// ---------------------------------------------------------------------------

describe('parseColor', () => {
  it('passes hex literals through unchanged', () => {
    expect(parseColor('#9A6AC2')).toBe('#9A6AC2');
    expect(parseColor('#fff')).toBe('#fff');
    expect(parseColor('#aabbccdd')).toBe('#aabbccdd');
  });

  it('converts Tailwind space-separated HSL', () => {
    // hsl(271, 36%, 60%) → the same hex hslToHex would produce
    const result = parseColor('271 36% 60%');
    expect(result).toMatch(/^#[0-9a-fA-F]{6}$/);
    // Verify it's not the fallback
    expect(result).not.toBe('#9A6AC2');
  });

  it('returns fallback for empty string', () => {
    expect(parseColor('')).toBe('#9A6AC2');
  });

  it('returns fallback for unparseable token', () => {
    expect(parseColor('not-a-color')).toBe('#9A6AC2');
  });

  it('accepts a custom fallback', () => {
    expect(parseColor('', '#FF0000')).toBe('#FF0000');
  });

  it('handles hsl() functional notation via CSSOM probe', () => {
    // jsdom supports basic rgb/hsl resolution
    const result = parseColor('hsl(120, 100%, 50%)');
    // pure green
    expect(result).toBe('#00ff00');
  });
});

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
