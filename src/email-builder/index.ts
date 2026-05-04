// open/meda/src/email-builder/index.ts
//
// Subpath barrel for `@medalsocial/meda/email-builder`.
//
// Single top-level `EmailBuilder` component. Heavy/optional integrations
// (rich text editor, media browser, saved blocks library) are injected via
// render-prop slots — see `EmailBuilderProps`. Block primitives, palettes,
// inspectors, and renderers remain internal implementation details.

export { EmailBuilder } from './email-builder.js';
export {
  type RenderToEmailHtmlOptions,
  renderToEmailHtml,
} from './render-to-email-html.js';
export { createStarterDocument } from './starter-shell.js';
export {
  type Alignment,
  BLOCK_KINDS,
  type BlockKind,
  type BlockPropsMap,
  type ButtonBlockProps,
  type ColumnLayout,
  type ColumnsBlockProps,
  type DevicePreview,
  type DividerBlockProps,
  defaultEmailBuilderLabels,
  type EmailBlock,
  type EmailBrand,
  type EmailBuilderLabels,
  type EmailBuilderProps,
  type EmailDocument,
  type EmailEnvelope,
  type FooterBlockProps,
  type HeadingBlockProps,
  type ImageBlockProps,
  type MediaPickerContext,
  type SavedBlocksContext,
  type SocialBlockProps,
  type SocialLink,
  type SpacerBlockProps,
  type SpacingValue,
  type TextBlockProps,
} from './types.js';
