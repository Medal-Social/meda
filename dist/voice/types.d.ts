export type MicState = 'idle' | 'requesting' | 'denied' | 'ready' | 'capturing';
export type TurnPhase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
export interface PcmFrame {
    /** Int16 PCM at 16kHz mono, typically 20ms = 320 samples = 640 bytes. */
    pcm: ArrayBuffer;
    /** Voice activity proxy from RMS, 0..1. */
    level: number;
}
