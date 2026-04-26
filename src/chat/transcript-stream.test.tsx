import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TranscriptStream } from './transcript-stream.js';
import type { Turn } from './types.js';

const turns: Turn[] = [
  {
    id: 't1',
    speaker: 'user',
    text: 'Hello',
    startedAt: new Date('2026-04-26T15:22:14Z').getTime(),
  },
  {
    id: 't2',
    speaker: 'assistant',
    speakerLabel: 'Morpheus',
    text: 'Hi Ali',
    startedAt: new Date('2026-04-26T15:22:18Z').getTime(),
  },
];

describe('TranscriptStream', () => {
  it('renders one TurnCard per turn', () => {
    const { container } = render(<TranscriptStream turns={turns} tz="UTC" />);
    expect(container.textContent).toContain('Hello');
    expect(container.textContent).toContain('Hi Ali');
  });

  it('uses the first turn startedAt as the reference for relative offsets', () => {
    const { container } = render(<TranscriptStream turns={turns} tz="UTC" />);
    expect(container.textContent).toContain('+0s');
    expect(container.textContent).toContain('+4s');
  });

  it('renders an empty state when turns is empty', () => {
    const { container } = render(<TranscriptStream turns={[]} />);
    expect(container.textContent?.toLowerCase()).toContain('no turns');
  });
});
