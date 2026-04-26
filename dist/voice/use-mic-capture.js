import { useCallback, useEffect, useRef, useState } from 'react';
const WORKLET_CODE = `
const TARGET_RATE = 16000;
const FRAME_SAMPLES = 320;

class MicCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.inputRate = sampleRate;
    this.ratio = this.inputRate / TARGET_RATE;
    this.buffer = [];
  }
  resampleAndAppend(input) {
    let i = 0;
    while (i < input.length) {
      this.buffer.push(input[Math.floor(i)]);
      i += this.ratio;
    }
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
export function useMicCapture(opts = {}) {
    const [state, setState] = useState('idle');
    const [level, setLevel] = useState(0);
    const [error, setError] = useState(null);
    const ctxRef = useRef(null);
    const streamRef = useRef(null);
    const nodeRef = useRef(null);
    const onFrameRef = useRef(opts.onFrame);
    onFrameRef.current = opts.onFrame;
    const stop = useCallback(() => {
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
        setState('requesting');
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: opts.audioConstraints ?? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            streamRef.current = stream;
            const ctx = new AudioContext();
            ctxRef.current = ctx;
            const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            try {
                await ctx.audioWorklet.addModule(url);
            }
            finally {
                URL.revokeObjectURL(url);
            }
            const node = new AudioWorkletNode(ctx, 'meda-mic-capture');
            nodeRef.current = node;
            node.port.onmessage = (e) => {
                const msg = e.data;
                setLevel(msg.level);
                onFrameRef.current?.({ pcm: msg.pcm, level: msg.level });
            };
            const src = ctx.createMediaStreamSource(stream);
            src.connect(node);
            setState('capturing');
        }
        catch (err) {
            const e = err;
            setError(e);
            setState(e.name === 'NotAllowedError' ? 'denied' : 'idle');
        }
    }, [opts.audioConstraints]);
    // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally empty - should only run on mount
    useEffect(() => {
        if (opts.autoStart)
            void start();
        return stop;
    }, []);
    return { state, level, error, start, stop };
}
