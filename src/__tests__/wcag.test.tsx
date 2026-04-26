import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
// Value-side import lives under dist/; the package's matchers.d.ts only re-exports as types.
import { toHaveNoViolations } from 'vitest-axe/dist/matchers.js';

import { TranscriptStream } from '../chat/index.js';
import { Inspector, InspectorField } from '../panel/index.js';
import { EventCard } from '../timeline/index.js';

declare module 'vitest' {
  // Match @testing-library/jest-dom/vitest's signature so TS doesn't conflict.
  // biome-ignore lint/suspicious/noExplicitAny: must align with jest-dom declaration
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): unknown;
  }
}

expect.extend({ toHaveNoViolations });

const NOW = new Date('2026-04-26T15:24:09Z');

describe('WCAG AA', () => {
  it('EventCard from timeline has no axe violations', async () => {
    const { container } = render(
      <EventCard
        event={{
          id: 'live',
          startedAt: NOW.getTime() - 134_000,
          isLive: true,
          kind: 'session',
          primary: 'Morpheus',
          secondary: '4 turns · $0.07',
        }}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('TranscriptStream from chat has no axe violations', async () => {
    const { container } = render(
      <TranscriptStream
        turns={[
          {
            id: 't1',
            speaker: 'user',
            text: 'Hello',
            startedAt: NOW.getTime(),
          },
          {
            id: 't2',
            speaker: 'assistant',
            speakerLabel: 'Morpheus',
            text: 'Hi',
            startedAt: NOW.getTime() + 4_000,
            latency: { sttMs: 240, claudeMs: 1400, ttsMs: 380 },
          },
        ]}
        tz="UTC"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Inspector from panel has no axe violations', async () => {
    const { container } = render(
      <Inspector
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: <InspectorField label="Voice" value="Rachel" hint="ElevenLabs" />,
          },
        ]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
