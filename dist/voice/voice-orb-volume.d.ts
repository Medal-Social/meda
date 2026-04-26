export interface VolumeSmoother {
    /** Call each frame with the raw 0..1 signal. */
    update(raw: number): void;
    /** Current smoothed value 0..1. */
    readonly value: number;
}
/**
 * Creates a volume smoother with asymmetric attack/decay envelopes.
 * @param attackAlpha  - Per-frame alpha toward higher values (default 0.85 ≈ 50ms at 60Hz)
 * @param decayAlpha   - Per-frame alpha toward lower values  (default 0.30 ≈ 300ms at 60Hz)
 */
export declare function createVolumeSmoother(attackAlpha?: number, decayAlpha?: number): VolumeSmoother;
