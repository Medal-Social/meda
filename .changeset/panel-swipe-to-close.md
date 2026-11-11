---
"@medalsocial/meda": minor
---

`RightPanel` and `rightPanel` gain an opt-in `swipeToClose`. When it is on, a finger drags the open panel toward its edge to close it. The panel follows the finger 1:1, stays on its edge when pulled inward, and closes past 40% of its width or on a 500 px/s flick; otherwise it springs home, and it can be caught mid-spring. It works for touch only, and is off by default.
