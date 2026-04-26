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

  it('does not crash when an arg is unserializable (BigInt)', () => {
    const bigCall: ToolCall = {
      id: 't2',
      name: 'math.bignum',
      args: { count: 9_007_199_254_740_993n as unknown as number },
    };
    expect(() => render(<ToolCallBlock call={bigCall} />)).not.toThrow();
  });

  it('does not crash when an arg is a circular structure', () => {
    type Circ = { self?: unknown };
    const circular: Circ = {};
    circular.self = circular;
    const circCall: ToolCall = {
      id: 't3',
      name: 'graph.cycle',
      args: { node: circular },
    };
    expect(() => render(<ToolCallBlock call={circCall} />)).not.toThrow();
  });

  it('does not crash when args is null', () => {
    const nullCall: ToolCall = {
      id: 't4',
      name: 'noop',
      args: null as unknown as Record<string, unknown>,
    };
    expect(() => render(<ToolCallBlock call={nullCall} />)).not.toThrow();
  });

  it('does not crash when args is undefined', () => {
    const undefinedCall: ToolCall = {
      id: 't5',
      name: 'noop',
      args: undefined as unknown as Record<string, unknown>,
    };
    expect(() => render(<ToolCallBlock call={undefinedCall} />)).not.toThrow();
  });
});
