// SPDX-License-Identifier: Apache-2.0
// Volume signal smoother: fast attack (~50ms), slow decay (~300ms).
// Attack/decay constants are frame-rate independent when called at ~60Hz.
/**
 * Creates a volume smoother with asymmetric attack/decay envelopes.
 * @param attackAlpha  - Per-frame alpha toward higher values (default 0.85 ≈ 50ms at 60Hz)
 * @param decayAlpha   - Per-frame alpha toward lower values  (default 0.30 ≈ 300ms at 60Hz)
 */
export function createVolumeSmoother(attackAlpha = 0.85, decayAlpha = 0.3) {
    let _value = 0;
    return {
        update(raw) {
            const clamped = Math.min(1, Math.max(0, raw));
            const alpha = clamped > _value ? attackAlpha : decayAlpha;
            _value = _value + (clamped - _value) * alpha;
        },
        get value() {
            return _value;
        },
    };
}
