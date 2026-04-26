import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LatencyBreakdown } from './latency-breakdown.js';

describe('LatencyBreakdown', () => {
  it('renders three segments with proportional widths', () => {
    const { container } = render(<LatencyBreakdown sttMs={200} claudeMs={1000} ttsMs={400} />);
    const stt = container.querySelector('[data-segment="stt"]') as HTMLElement | null;
    const claude = container.querySelector('[data-segment="claude"]') as HTMLElement | null;
    const tts = container.querySelector('[data-segment="tts"]') as HTMLElement | null;
    expect(stt).not.toBeNull();
    expect(claude).not.toBeNull();
    expect(tts).not.toBeNull();
    // 200 / 1600 = 12.5%, 1000/1600 = 62.5%, 400/1600 = 25%
    expect(stt?.style.width).toMatch(/12\.5/);
    expect(claude?.style.width).toMatch(/62\.5/);
    expect(tts?.style.width).toMatch(/25/);
  });

  it('renders without legend when showLegend=false', () => {
    const { container } = render(
      <LatencyBreakdown sttMs={200} claudeMs={1000} ttsMs={400} showLegend={false} />
    );
    expect(container.textContent).not.toMatch(/STT/);
  });
});
