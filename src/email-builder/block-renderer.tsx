'use client';

import { BlockErrorBoundary } from './block-error-boundary.js';
import { ButtonBlock } from './block-renderers/button.js';
import { ColumnsBlock } from './block-renderers/columns.js';
import { DividerBlock } from './block-renderers/divider.js';
import { FooterBlock } from './block-renderers/footer.js';
import { HeadingBlock } from './block-renderers/heading.js';
import { ImageBlock } from './block-renderers/image.js';
import { SocialBlock } from './block-renderers/social.js';
import { SpacerBlock } from './block-renderers/spacer.js';
import { TextBlock } from './block-renderers/text.js';
import type {
  ButtonBlockProps,
  ColumnsBlockProps,
  DividerBlockProps,
  EmailBlock,
  FooterBlockProps,
  HeadingBlockProps,
  ImageBlockProps,
  SocialBlockProps,
  SpacerBlockProps,
  TextBlockProps,
} from './types.js';

/** Pure renderer — turns an EmailBlock into preview React. No selection chrome. */
export function BlockRenderer({ block }: { block: EmailBlock }) {
  return (
    <BlockErrorBoundary blockId={block.id}>
      <BlockBody block={block} />
    </BlockErrorBoundary>
  );
}

function BlockBody({ block }: { block: EmailBlock }) {
  switch (block.kind) {
    case 'heading':
      return <HeadingBlock props={block.props as HeadingBlockProps} />;
    case 'text':
      return <TextBlock props={block.props as TextBlockProps} />;
    case 'image':
      return <ImageBlock props={block.props as ImageBlockProps} />;
    case 'button':
      return <ButtonBlock props={block.props as ButtonBlockProps} />;
    case 'divider':
      return <DividerBlock props={block.props as DividerBlockProps} />;
    case 'spacer':
      return <SpacerBlock props={block.props as SpacerBlockProps} />;
    case 'columns':
      return (
        <ColumnsBlock props={block.props as ColumnsBlockProps} columnChildren={block.children} />
      );
    case 'social':
      return <SocialBlock props={block.props as SocialBlockProps} />;
    case 'footer':
      return <FooterBlock props={block.props as FooterBlockProps} />;
    default:
      return null;
  }
}
