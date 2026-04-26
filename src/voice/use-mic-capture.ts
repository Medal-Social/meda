import { useCallback, useEffect, useRef, useState } from 'react';
import type { MicState, PcmFrame } from './types.js';

export interface UseMicCaptureOptions {
  autoStart?: boolean;
  onFrame?: (frame: PcmFrame) => void;
  audioConstraints?: MediaTrackConstraints;
}

export interface UseMicCaptureReturn {
  state: MicState;
  level: number;
  error: Error | null;
  start: () => Promise<void>;
  stop: () => void;
}

const WORKLET_CODE = `
const TARGET_RATE = 16000;
const FRAME_SAMPLES = 320;

class MicCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.inputRate = sampleRate;
    this.ratio = this.inputRate / TARGET_RATE;
    this.buffer = [];
    // Persist the fractional resampling offset across process() callbacks so
    // non-integer ratios (e.g. 44.1kHz→16kHz) don't accumulate ~1% drift.
    this.resampleOffset = 0;
  }
  resampleAndAppend(input) {
    let i = this.resampleOffset;
    while (i < input.length) {
      this.buffer.push(input[Math.floor(i)]);
      i += this.ratio;
    }
    // Carry the fractional part forward into the next callback.
    this.resampleOffset = i - input.length;
  }
  process(inputs) {
    const ch = inputs[0]?.[0];
    if (!ch) return true;
    this.resampleAndAppend(ch);
    while (this.buffer.length >= FRAME_SAMPLES) {
      const frame = this.buffer.slice(0, FRAME_SAMPLES);
      this.buffer = this.buffer.slice(FRAME_SAMPLES);
      const pcm = new Int16Array(FRAME_SAMPLES);
      let sumSq = 0;
      for (let j = 0; j < FRAME_SAMPLES; j++) {
        const s = Math.max(-1, Math.min(1, frame[j]));
        pcm[j] = (s * 0x7fff) | 0;
        sumSq += s * s;
      }
      const rms = Math.sqrt(sumSq / FRAME_SAMPLES);
      this.port.postMessage({ pcm: pcm.buffer, level: rms }, [pcm.buffer]);
    }
    return true;
  }
}
registerProcessor('meda-mic-capture', MicCapture);
`;

export function useMicCapture(opts: UseMicCaptureOptions = {}): UseMicCaptureReturn {
  const [state, setState] = useState<MicState>('idle');
  const [level, setLevel] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nodeRef = useRef<AudioWorkletNode | null>(null);
  const onFrameRef = useRef(opts.onFrame);
  onFrameRef.current = opts.onFrame;
  // Generation token: incremented on every start/stop so an in-flight start()
  // can detect that a newer call has superseded it and bail out.
  const genRef = useRef(0);

  const stop = useCallback(() => {
    genRef.current += 1;
    nodeRef.current?.disconnect();
    nodeRef.current = null;
    streamRef.current?.getTracks().forEach((t) => {
      t.stop();
    });
    streamRef.current = null;
    void ctxRef.current?.close();
    ctxRef.current = null;
    setState('idle');
    setLevel(0);
  }, []);

  const start = useCallback(async () => {
    // Bug 5 fix: tear down any existing capture before starting a new one so
    // we don't orphan the previous stream/context.
    if (ctxRef.current ?? streamRef.current) {
      stop();
    }

    // Grab the current generation so we can detect if stop() (or a second
    // start()) is called while we are awaiting getUserMedia / addModule.
    genRef.current += 1;
    const gen = genRef.current;

    setState('requesting');
    setError(null);

    // Inline cleanup helper used in the catch path (Bug 2 fix): ensures tracks
    // and context are released even when start() fails mid-flight.
    const cleanupRefs = (stream: MediaStream | null, ctx: AudioContext | null) => {
      stream?.getTracks().forEach((t) => {
        t.stop();
      });
      void ctx?.close();
      // Clear refs only if this generation still owns them (a superseding
      // start() may have already set new refs).
      if (genRef.current === gen) {
        if (streamRef.current === stream) streamRef.current = null;
        if (ctxRef.current === ctx) ctxRef.current = null;
        nodeRef.current = null;
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: opts.audioConstraints ?? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Bug 4 fix: if stop() fired while we were awaiting getUserMedia, a
      // newer generation is active — release the stream we just acquired and
      // bail out without transitioning to 'capturing'.
      if (genRef.current !== gen) {
        stream.getTracks().forEach((t) => {
          t.stop();
        });
        return;
      }

      streamRef.current = stream;
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      try {
        await ctx.audioWorklet.addModule(url);
      } finally {
        URL.revokeObjectURL(url);
      }

      // Bug 4 fix: check again after the async addModule call.
      if (genRef.current !== gen) {
        cleanupRefs(stream, ctx);
        return;
      }

      const node = new AudioWorkletNode(ctx, 'meda-mic-capture');
      nodeRef.current = node;
      node.port.onmessage = (e) => {
        const msg = e.data as { pcm: ArrayBuffer; level: number };
        setLevel(msg.level);
        onFrameRef.current?.({ pcm: msg.pcm, level: msg.level });
      };
      const src = ctx.createMediaStreamSource(stream);
      src.connect(node);
      // Web Audio graphs only run when connected to a destination. The
      // worklet's process() callback is never invoked otherwise — no PCM
      // frames, no level updates. Route through a 0-gain node so we don't
      // produce audible feedback from the user's own mic.
      const silent = ctx.createGain();
      silent.gain.value = 0;
      node.connect(silent);
      silent.connect(ctx.destination);
      setState('capturing');
    } catch (err) {
      // Bug 2 fix: release the mic and AudioContext if they were acquired
      // before the failure so we don't leave the hardware mic open.
      cleanupRefs(streamRef.current, ctxRef.current);
      const e = err as Error;
      setError(e);
      setState(e.name === 'NotAllowedError' ? 'denied' : 'idle');
    }
  }, [opts.audioConstraints, stop]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally empty - should only run on mount
  useEffect(() => {
    if (opts.autoStart) void start();
    return stop;
  }, []);

  return { state, level, error, start, stop };
}
