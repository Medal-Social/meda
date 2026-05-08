// Dedicated subpath entry for MarkdownView.
//
// Importing `@medalsocial/meda/markdown-view` opts the consumer into the
// react-markdown / remark-gfm / rehype-highlight peer chain. Consumers who
// don't need markdown rendering should import from `@medalsocial/meda` /
// `@medalsocial/meda/primitives` instead — neither pulls these peers in.

export type { MarkdownViewProps } from './markdown-view.js';
export { MarkdownView } from './markdown-view.js';
