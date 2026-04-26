import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LatencyBadge } from './latency-badge.js';

describe('LatencyBadge', () => {
  it('renders STT label and ms', () => {
    render(<LatencyBadge kind="stt" ms={240} />);
    expect(screen.getByText(/STT/i)).toBeInTheDocument();
    expect(screen.getByText(/240ms/)).toBeInTheDocument();
  });

  it('formats >= 1000ms as Ns', () => {
    render(<LatencyBadge kind="claude" ms={1432} />);
    expect(screen.getByText(/1\.4s/)).toBeInTheDocument();
  });

  it('uses tts treatment for kind=tts', () => {
    const { container } = render(<LatencyBadge kind="tts" ms={380} />);
    expect(container.querySelector('[data-kind="tts"]')).not.toBeNull();
  });
});
