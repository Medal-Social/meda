---
'@medalsocial/meda': minor
---

feat(primitives): add `Card`, `StatusPill`, and `MarkdownView` primitives.

- `Card` — compound component (`Card`, `Card.Header`, `Card.Body`, `Card.Footer`) replacing the recurring `bg-card border border-border rounded-xl` pattern. All parts accept `className` overrides.
- `StatusPill` — generic colored pill with `tone` (`neutral` | `info` | `success` | `warning` | `danger`) and `size` (`sm` | `md`) props, leaning on existing meda colour tokens.
- `MarkdownView` — wraps `react-markdown` + `remark-gfm` + `rehype-highlight` with consistent prose styles. The three markdown libraries are listed as **optional peer dependencies** — install them in your app only if you import `MarkdownView`.
