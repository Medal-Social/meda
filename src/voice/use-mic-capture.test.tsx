import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMicCapture } from './use-mic-capture.js';

// ---------------------------------------------------------------------------
// Minimal Web Audio API stubs
// ---------------------------------------------------------------------------

function makeMockStream() {
  const track = { stop: vi.fn(), kind: 'audio' };
  return {
    getTracks: () => [track],
    _track: track,
  } as unknown as MediaStream & { _track: { stop: ReturnType<typeof vi.fn> } };
}

// Real constructors are required so `new AudioContext()` / `new AudioWorkletNode()` work.
class MockAudioContext {
  destination = {};
  audioWorklet = { addModule: vi.fn(() => Promise.resolve()) };
  createMediaStreamSource = vi.fn(() => ({ connect: vi.fn() }));
  createGain = vi.fn(() => ({ gain: { value: 1 }, connect: vi.fn() }));
  close = vi.fn(() => Promise.resolve());
  state = 'running';
}

class MockAudioWorkletNode {
  port: { onmessage: null | ((e: MessageEvent) => void) } = { onmessage: null };
  connect = vi.fn();
  disconnect = vi.fn();
}

let mockStream: ReturnType<typeof makeMockStream>;

beforeEach(() => {
  mockStream = makeMockStream();

  vi.stubGlobal('AudioContext', MockAudioContext);
  vi.stubGlobal('AudioWorkletNode', MockAudioWorkletNode);
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:fake'),
    revokeObjectURL: vi.fn(),
  });
  vi.stubGlobal('Blob', class {});

  Object.defineProperty(globalThis, 'navigator', {
    value: {
      mediaDevices: {
        getUserMedia: vi.fn(() => Promise.resolve(mockStream)),
      },
    },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useMicCapture', () => {
  it('initializes in idle state', () => {
    const { result } = renderHook(() => useMicCapture());
    expect(result.current.state).toBe('idle');
    expect(result.current.level).toBe(0);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.start).toBe('function');
    expect(typeof result.current.stop).toBe('function');
  });

  it('transitions through requesting → capturing on successful start', async () => {
    const { result } = renderHook(() => useMicCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state).toBe('capturing');
    expect(result.current.error).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Bug 2: mic leak on start failure
  // -------------------------------------------------------------------------
  it('stops tracks and closes AudioContext when start fails after getUserMedia', async () => {
    // Make addModule reject — simulates restricted/unsupported environment.
    class FailingAudioContext extends MockAudioContext {
      audioWorklet = {
        addModule: vi.fn(() => Promise.reject(new Error('addModule failed'))),
      };
    }
    vi.stubGlobal('AudioContext', FailingAudioContext);

    const { result } = renderHook(() => useMicCapture());

    await act(async () => {
      await result.current.start();
    });

    // State should be idle (non-permission error)
    expect(result.current.state).toBe('idle');
    expect(result.current.error).toBeInstanceOf(Error);

    // The acquired track must have been stopped
    expect(mockStream._track.stop).toHaveBeenCalled();
  });

  it('sets state to denied when getUserMedia throws NotAllowedError', async () => {
    const denied = Object.assign(new Error('denied'), { name: 'NotAllowedError' });
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockRejectedValueOnce(denied);

    const { result } = renderHook(() => useMicCapture());

    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state).toBe('denied');
    expect(result.current.error?.name).toBe('NotAllowedError');
  });

  // -------------------------------------------------------------------------
  // Bug 4: stale start after stop
  // -------------------------------------------------------------------------
  it('aborts in-flight start when stop is called before capturing state', async () => {
    // Use a manually-controllable promise for getUserMedia so we can call
    // stop() while start() is waiting for it.
    let resolveMedia!: (s: MediaStream) => void;
    const mediaPromise = new Promise<MediaStream>((res) => {
      resolveMedia = res;
    });
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockReturnValueOnce(
      mediaPromise
    );

    const { result } = renderHook(() => useMicCapture());

    // Begin start() but don't await it yet
    let startDone = false;
    act(() => {
      result.current.start().then(() => {
        startDone = true;
      });
    });

    // While getUserMedia is pending, call stop()
    act(() => {
      result.current.stop();
    });

    // Now resolve getUserMedia — the in-flight start() should detect the stale
    // generation and NOT transition to 'capturing'.
    await act(async () => {
      resolveMedia(mockStream);
      await Promise.resolve(); // flush micro-tasks
    });

    await waitFor(() => expect(startDone).toBe(true));

    // Should remain idle (stop() set it to idle, stale start() bailed out)
    expect(result.current.state).toBe('idle');
    // The stream obtained after stop was called must have been stopped
    expect(mockStream._track.stop).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Bug 5: repeated start leaks prior mic session
  // -------------------------------------------------------------------------
  it('tears down existing session before starting a new one', async () => {
    const { result } = renderHook(() => useMicCapture());

    // First start
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe('capturing');

    // Capture the first track's stop mock before we replace the stream
    const firstTrackStop = mockStream._track.stop;

    // Set up a fresh stream for the second start
    const stream2 = makeMockStream();
    (navigator.mediaDevices.getUserMedia as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      stream2
    );

    // Second start — should tear down the first session first
    await act(async () => {
      await result.current.start();
    });

    expect(result.current.state).toBe('capturing');
    // The first session's track should have been stopped
    expect(firstTrackStop).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Worklet resampler offset (Bug 3) — pure unit test of the embedded JS logic
// ---------------------------------------------------------------------------
describe('worklet resampleAndAppend offset persistence', () => {
  it('preserves fractional offset across calls (no drift)', () => {
    const TARGET_RATE = 16000;
    const ratio = 44100 / TARGET_RATE; // ~2.75625

    // Reconstructed fixed implementation
    const state = {
      ratio,
      buffer: [] as number[],
      resampleOffset: 0,
      resampleAndAppend(input: Float32Array) {
        let i = this.resampleOffset;
        while (i < input.length) {
          this.buffer.push(input[Math.floor(i)]);
          i += this.ratio;
        }
        this.resampleOffset = i - input.length;
      },
    };

    // Feed 10 frames of 128 samples (typical WebAudio process() block size)
    for (let f = 0; f < 10; f++) {
      const chunk = new Float32Array(128).fill(0.5);
      state.resampleAndAppend(chunk);
    }

    // Expected output count: floor(10 * 128 / ratio)
    const expectedSamples = Math.floor((10 * 128) / ratio);
    // Allow ±1 for boundary rounding
    expect(state.buffer.length).toBeGreaterThanOrEqual(expectedSamples - 1);
    expect(state.buffer.length).toBeLessThanOrEqual(expectedSamples + 1);

    // Verify offset is in [0, ratio) — it is properly carried forward
    expect(state.resampleOffset).toBeGreaterThanOrEqual(0);
    expect(state.resampleOffset).toBeLessThan(state.ratio);
  });

  it('resets-to-zero implementation produces wrong count (control check)', () => {
    const TARGET_RATE = 16000;
    const ratio = 44100 / TARGET_RATE;

    // Old (buggy) implementation: always start i from 0
    const buggyState = {
      ratio,
      buffer: [] as number[],
      resampleAndAppend(input: Float32Array) {
        let i = 0; // BUG: always reset — fractional part is discarded
        while (i < input.length) {
          this.buffer.push(input[Math.floor(i)]);
          i += this.ratio;
        }
      },
    };

    for (let f = 0; f < 10; f++) {
      const chunk = new Float32Array(128).fill(0.5);
      buggyState.resampleAndAppend(chunk);
    }

    const expectedSamples = Math.floor((10 * 128) / ratio);
    // The buggy version produces more samples (each callback re-emits the
    // partial sample that should have been deferred).
    expect(buggyState.buffer.length).toBeGreaterThan(expectedSamples);
  });
});
