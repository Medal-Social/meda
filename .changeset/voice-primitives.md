---
"@medalsocial/meda": minor
---

Add `/voice` subpath export with voice interaction primitives:

- `useMicCapture()` hook for mic capture with AudioWorklet + RMS level
- `<VoiceOrb>` glass-orb mic button with phase + voice-level reactivity
- `<VoiceLevel>` level meter (bars / wave / ring variants)
- `<VoiceStatusPill>` phase indicator badge

Used by pilot-talk for hold-to-talk UI. The hook ships its AudioWorklet inline via Blob URL so consumers don't need to copy worklet files into their public dir.
