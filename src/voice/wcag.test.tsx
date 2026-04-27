import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { VoiceLevel } from './voice-level.js';
import { VoiceOrb } from './voice-orb.js';
import { VoiceStatusPill } from './voice-status-pill.js';

describe('voice a11y', () => {
  it('VoiceStatusPill has no axe violations (idle)', async () => {
    const { container } = render(<VoiceStatusPill phase="idle" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('VoiceStatusPill has no axe violations (thinking)', async () => {
    const { container } = render(<VoiceStatusPill phase="thinking" thinkingForMs={2400} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('VoiceLevel has no axe violations (bars)', async () => {
    const { container } = render(<VoiceLevel level={0.5} variant="bars" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('VoiceLevel has no axe violations (wave)', async () => {
    const { container } = render(<VoiceLevel level={0.5} variant="wave" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('VoiceLevel has no axe violations (ring)', async () => {
    const { container } = render(<VoiceLevel level={0.5} variant="ring" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('VoiceOrb has no axe violations', async () => {
    // R3F is mocked in vitest.setup.ts so this renders a div instead of WebGL.
    const { container } = render(<VoiceOrb pressed={false} phase="idle" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
