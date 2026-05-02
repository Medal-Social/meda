'use client';

import type { ReactNode } from 'react';
import { ButtonPropertyEditor } from './property-editors/button-editor.js';
import { ColumnsPropertyEditor } from './property-editors/columns-editor.js';
import { DividerPropertyEditor } from './property-editors/divider-editor.js';
import { FooterPropertyEditor } from './property-editors/footer-editor.js';
import { HeadingPropertyEditor } from './property-editors/heading-editor.js';
import { ImagePropertyEditor } from './property-editors/image-editor.js';
import { SocialPropertyEditor } from './property-editors/social-editor.js';
import { SpacerPropertyEditor } from './property-editors/spacer-editor.js';
import { TextPropertyEditor } from './property-editors/text-editor.js';
import type {
  BlockKind,
  BlockPropsMap,
  ButtonBlockProps,
  ColumnsBlockProps,
  DividerBlockProps,
  EmailBlock,
  EmailBuilderProps,
  FooterBlockProps,
  HeadingBlockProps,
  ImageBlockProps,
  SocialBlockProps,
  SpacerBlockProps,
  TextBlockProps,
} from './types.js';

interface PropertyInspectorProps {
  block: EmailBlock | null;
  onChange: <K extends BlockKind>(blockId: string, patch: Partial<BlockPropsMap[K]>) => void;
  emptyContent: ReactNode;
  renderMediaPicker?: EmailBuilderProps['renderMediaPicker'];
  renderTextEditor?: EmailBuilderProps['renderTextEditor'];
}

export function PropertyInspector({
  block,
  onChange,
  emptyContent,
  renderMediaPicker,
  renderTextEditor,
}: PropertyInspectorProps) {
  if (!block) {
    return (
      <div
        data-slot="email-builder-inspector-empty"
        className="flex h-full items-center justify-center p-6 text-center text-muted-foreground text-sm"
      >
        {emptyContent}
      </div>
    );
  }
  return (
    <div data-slot="email-builder-inspector" className="flex flex-col gap-3 p-4">
      <div className="font-semibold text-foreground text-sm capitalize">
        {block.kind} properties
      </div>
      {renderEditor(block, onChange, { renderMediaPicker, renderTextEditor })}
    </div>
  );
}

function renderEditor(
  block: EmailBlock,
  onChange: PropertyInspectorProps['onChange'],
  slots: {
    renderMediaPicker?: EmailBuilderProps['renderMediaPicker'];
    renderTextEditor?: EmailBuilderProps['renderTextEditor'];
  }
): ReactNode {
  const id = block.id;
  switch (block.kind) {
    case 'heading':
      return (
        <HeadingPropertyEditor
          value={block.props as HeadingBlockProps}
          onChange={(p) => onChange<'heading'>(id, p)}
        />
      );
    case 'text':
      return (
        <TextPropertyEditor
          value={block.props as TextBlockProps}
          onChange={(p) => onChange<'text'>(id, p)}
          renderEditor={slots.renderTextEditor}
        />
      );
    case 'image':
      return (
        <ImagePropertyEditor
          value={block.props as ImageBlockProps}
          onChange={(p) => onChange<'image'>(id, p)}
          renderMediaPicker={slots.renderMediaPicker}
        />
      );
    case 'button':
      return (
        <ButtonPropertyEditor
          value={block.props as ButtonBlockProps}
          onChange={(p) => onChange<'button'>(id, p)}
        />
      );
    case 'divider':
      return (
        <DividerPropertyEditor
          value={block.props as DividerBlockProps}
          onChange={(p) => onChange<'divider'>(id, p)}
        />
      );
    case 'spacer':
      return (
        <SpacerPropertyEditor
          value={block.props as SpacerBlockProps}
          onChange={(p) => onChange<'spacer'>(id, p)}
        />
      );
    case 'columns':
      return (
        <ColumnsPropertyEditor
          value={block.props as ColumnsBlockProps}
          onChange={(p) => onChange<'columns'>(id, p)}
        />
      );
    case 'social':
      return (
        <SocialPropertyEditor
          value={block.props as SocialBlockProps}
          onChange={(p) => onChange<'social'>(id, p)}
        />
      );
    case 'footer':
      return (
        <FooterPropertyEditor
          value={block.props as FooterBlockProps}
          onChange={(p) => onChange<'footer'>(id, p)}
        />
      );
    default:
      return null;
  }
}
