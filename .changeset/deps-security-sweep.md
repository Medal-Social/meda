---
'@medalsocial/meda': patch
---

Close the five live advisories and take the safe patch upgrades.

The existing `sharp` override lifted only to `^0.35.0`, which still permitted
the vulnerable 0.35.3 — it is retargeted at `^0.35.4`, the version that fixes
GHSA-rgj7-g3m4-5g8c. Three more transitive advisories get overrides, and
wrangler moves to 4.130.0 to match the rest of the estate.
