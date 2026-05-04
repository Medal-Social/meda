// open/meda/src/email-builder/index.ts
//
// Subpath barrel for `@medalsocial/meda/email-builder`.
//
// Single top-level `EmailBuilder` component. Heavy/optional integrations
// (rich text editor, media browser, saved blocks library) are injected via
// render-prop slots — see `EmailBuilderProps`. Block primitives, palettes,
// inspectors, and renderers remain internal implementation details.
export { EmailBuilder } from './email-builder.js';
export { renderToEmailHtml, } from './render-to-email-html.js';
export { createStarterDocument } from './starter-shell.js';
export { BLOCK_KINDS, defaultEmailBuilderLabels, } from './types.js';
