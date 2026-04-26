import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useMicCapture } from './use-mic-capture.js';

describe('useMicCapture', () => {
  it('initializes in idle state', () => {
    const { result } = renderHook(() => useMicCapture());
    expect(result.current.state).toBe('idle');
    expect(result.current.level).toBe(0);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.start).toBe('function');
    expect(typeof result.current.stop).toBe('function');
  });
});
