import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { VoiceStatusPill } from './voice-status-pill.js';

describe('VoiceStatusPill', () => {
  it('shows label for each phase', () => {
    const phases = ['idle', 'listening', 'thinking', 'speaking', 'error'] as const;
    phases.forEach((p) => {
      const { container, unmount } = render(<VoiceStatusPill phase={p} />);
      const statusEl = container.querySelector('[role="status"]');
      expect(statusEl).toBeInTheDocument();
      const expectedText =
        p === 'idle'
          ? 'Idle'
          : p === 'listening'
            ? 'Listening'
            : p === 'thinking'
              ? 'Thinking'
              : p === 'speaking'
                ? 'Speaking'
                : 'Error';
      expect(statusEl?.textContent).toContain(expectedText);
      unmount();
    });
  });

  it('shows seconds when thinking + thinkingForMs provided', () => {
    const { container } = render(<VoiceStatusPill phase="thinking" thinkingForMs={2400} />);
    const statusEl = container.querySelector('[role="status"]');
    expect(statusEl?.textContent).toMatch(/2\.4/);
  });
});
