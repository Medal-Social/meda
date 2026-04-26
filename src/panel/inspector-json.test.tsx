import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InspectorJSON } from './inspector-json.js';

describe('InspectorJSON', () => {
  it('renders keys, strings, and numbers', () => {
    render(<InspectorJSON data={{ name: 'calendar.list', count: 3 }} />);
    expect(screen.getByText(/"name"/)).toBeInTheDocument();
    expect(screen.getByText(/"calendar.list"/)).toBeInTheDocument();
    expect(screen.getByText(/3/)).toBeInTheDocument();
  });

  it('handles nested objects', () => {
    render(<InspectorJSON data={{ args: { range: 'a..b' } }} />);
    expect(screen.getByText(/"args"/)).toBeInTheDocument();
    expect(screen.getByText(/"range"/)).toBeInTheDocument();
  });

  it('handles arrays', () => {
    render(<InspectorJSON data={{ ids: [1, 2, 3] }} />);
    expect(screen.getByText(/"ids"/)).toBeInTheDocument();
  });

  it('does not infinitely recurse on circular objects', () => {
    type Circ = { self?: unknown; label: string };
    const node: Circ = { label: 'root' };
    node.self = node;
    expect(() => render(<InspectorJSON data={node} />)).not.toThrow();
    expect(screen.getByText(/"\[Circular\]"/)).toBeInTheDocument();
  });

  it('does not infinitely recurse on circular arrays', () => {
    const arr: unknown[] = [1];
    arr.push(arr);
    expect(() => render(<InspectorJSON data={{ items: arr }} />)).not.toThrow();
    expect(screen.getByText(/"\[Circular\]"/)).toBeInTheDocument();
  });
});
