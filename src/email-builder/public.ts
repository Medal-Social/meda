// Root re-export for `@medalsocial/meda` — exposes the most common
// types/components without forcing consumers to import the full subpath.
export {
  type EmailBlock,
  type EmailBrand,
  EmailBuilder,
  type EmailBuilderLabels,
  type EmailBuilderProps,
  type EmailDocument,
  renderToEmailHtml,
} from './index.js';
