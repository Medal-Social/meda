// Subpath barrel for `@medalsocial/meda/email-builder`.
//
// The block-based email composer.
//
// Deliberately deferred (compared to the source surface in
// apps/web/src/components/email-builder):
//   - Lexical rich-text editor — the text block uses a `<textarea>`. Pass
//     `renderTextEditor` to inject a richer editor.
//   - Media browser dialog — pass `renderMediaPicker` to inject one.
//   - Saved-blocks library — pass `renderSavedBlocks` to inject one.
//   - Send-test, brand-kit dialog, template library, AI assistance, quality
//     panel, sender identity, dark-mode preview — all out of scope for v0.
//   - Convex coupling — none. The document is fully prop-driven.
export { BlockErrorBoundary } from './block-error-boundary.js';
export { BlockPalette } from './block-palette.js';
export { BLOCK_REGISTRY, COLUMN_WIDTHS, createBlock, getColumnWidths, getDefaultBlockProps, } from './block-registry.js';
export { BlockRenderer } from './block-renderer.js';
export { BuilderCanvas } from './builder-canvas.js';
export { BuilderHeader } from './builder-header.js';
export { BuilderLeftTabs } from './builder-left-tabs.js';
export { EmailBuilder } from './email-builder.js';
export { EnvelopeCard } from './envelope-card.js';
export { FloatingBar } from './floating-bar.js';
export { MobileDrawer } from './mobile-drawers.js';
export { MobileTabBar } from './mobile-tab-bar.js';
export { PropertyInspector } from './property-inspector.js';
export { renderToEmailHtml, } from './render-to-email-html.js';
export { createStarterDocument } from './starter-shell.js';
export { BLOCK_KINDS, defaultEmailBuilderLabels, } from './types.js';
export { ViewControls } from './view-controls.js';
