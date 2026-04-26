import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ToolCallBlock } from './tool-call-block.js';
import type { ToolCall } from './types.js';

const call: ToolCall = {
  id: 't1',
  name: 'calendar.list',
  args: { range: '2026-04-25..2026-04-26' },
  resultSummary: '3 events',
  latencyMs: 142,
};

describe('ToolCallBlock', () => {
  it('renders the tool name', () => {
    const { container } = render(<ToolCallBlock call={call} />);
    expect(container.textContent).toContain('calendar.list');
  });

  it('renders the latency', () => {
    const { container } = render(<ToolCallBlock call={call} />);
    expect(container.textContent).toContain('142ms');
  });

  it('renders the result summary when present', () => {
    const { container } = render(<ToolCallBlock call={call} />);
    expect(container.textContent).toContain('3 events');
  });

  it('renders compact args', () => {
    const { container } = render(<ToolCallBlock call={call} />);
    expect(container.textContent).toContain('range');
  });
});
