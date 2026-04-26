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
export declare function useMicCapture(opts?: UseMicCaptureOptions): UseMicCaptureReturn;
