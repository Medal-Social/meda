// Email builder type system.
//
// Block kinds match the spec from the source surface
// (apps/web/src/components/email-builder/block-types.ts) but are narrowed to a
// publishable subset. The Convex-coupled `contentSlot` kind is omitted.

import type { ReactNode } from 'react';

// ============================================
// Block kinds
// ============================================

export const BLOCK_KINDS = [
  'heading',
  'text',
  'image',
  'button',
  'divider',
  'spacer',
  'columns',
  'social',
  'footer',
] as const;

export type BlockKind = (typeof BLOCK_KINDS)[number];

export type Alignment = 'left' | 'center' | 'right';

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ============================================
// Per-kind block props
// ============================================

export interface HeadingBlockProps {
  text: string;
  level: 1 | 2 | 3;
  alignment: Alignment;
  color: string;
  fontFamily: string;
  fontWeight: 400 | 500 | 600 | 700;
  fontSize: number;
  padding: SpacingValue;
}

export interface TextBlockProps {
  /**
   * Plain or simple HTML text. The reference Lexical editor was deferred — the
   * default property editor renders a `<textarea>`; consumers can swap a richer
   * editor in via the `renderTextEditor` slot in a future iteration.
   */
  content: string;
  alignment: Alignment;
  color: string;
  fontFamily: string;
  fontWeight: 300 | 400 | 500 | 600 | 700;
  fontSize: number;
  padding: SpacingValue;
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  linkUrl: string;
  width: number;
  height: number | 'auto';
  alignment: Alignment;
  padding: SpacingValue;
}

export interface ButtonBlockProps {
  text: string;
  url: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: number;
  size: 'sm' | 'md' | 'lg';
  alignment: Alignment;
  fullWidth: boolean;
  padding: SpacingValue;
}

export interface DividerBlockProps {
  color: string;
  thickness: number;
  width: number; // percentage (1–100)
  style: 'solid' | 'dashed' | 'dotted';
  padding: SpacingValue;
}

export interface SpacerBlockProps {
  height: number;
}

export type ColumnLayout = '50-50' | '33-67' | '67-33' | '33-33-33';

export interface ColumnsBlockProps {
  layout: ColumnLayout;
  verticalAlignment: 'top' | 'middle' | 'bottom';
  backgroundColor: string;
  gap: number;
  mobileStacking: boolean;
  padding: SpacingValue;
}

export interface SocialLink {
  platform: string;
  url: string;
  iconUrl?: string;
}

export interface SocialBlockProps {
  links: SocialLink[];
  iconSize: number;
  spacing: number;
  alignment: Alignment;
  padding: SpacingValue;
}

export interface FooterBlockProps {
  companyName: string;
  address: string;
  customText: string;
  unsubscribeText: string;
  textColor: string;
  fontSize: number;
  alignment: Alignment;
  padding: SpacingValue;
}

export interface BlockPropsMap {
  heading: HeadingBlockProps;
  text: TextBlockProps;
  image: ImageBlockProps;
  button: ButtonBlockProps;
  divider: DividerBlockProps;
  spacer: SpacerBlockProps;
  columns: ColumnsBlockProps;
  social: SocialBlockProps;
  footer: FooterBlockProps;
}

// ============================================
// Block + document
// ============================================

export interface EmailBlock<K extends BlockKind = BlockKind> {
  id: string;
  kind: K;
  props: BlockPropsMap[K];
  /** Only used by `kind: 'columns'` — one entry per column. */
  children?: EmailBlock[][];
}

export interface EmailEnvelope {
  subject?: string;
  fromName?: string;
  fromEmail?: string;
  replyTo?: string;
  preheader?: string;
}

export interface EmailDocument {
  blocks: EmailBlock[];
  envelope?: EmailEnvelope;
}

// ============================================
// Brand
// ============================================

export interface EmailBrand {
  logoUrl?: string;
  brandColor?: string;
  accentColor?: string;
  fontHeading?: string;
  fontBody?: string;
}

// ============================================
// Labels
// ============================================

export interface EmailBuilderLabels {
  // Builder chrome
  addBlock: string;
  blockPalette: string;
  blocksTab: string;
  designTab: string;
  envelopeTab: string;
  rightRailEmpty: string;
  // Mobile chrome
  openBlocks: string;
  openInspector: string;
  openSettings: string;
  // Header / floating bar
  preview: string;
  desktopPreview: string;
  mobilePreview: string;
  exportHtml: string;
  // Canvas
  emptyTitle: string;
  emptyDescription: string;
  // Inspector
  inspectorEmpty: string;
  // Block actions
  duplicateBlock: string;
  deleteBlock: string;
  moveUp: string;
  moveDown: string;
}

export const defaultEmailBuilderLabels: EmailBuilderLabels = {
  addBlock: 'Add block',
  blockPalette: 'Block palette',
  blocksTab: 'Blocks',
  designTab: 'Design',
  envelopeTab: 'Envelope',
  rightRailEmpty: 'Select a block to edit its properties.',
  openBlocks: 'Blocks',
  openInspector: 'Inspector',
  openSettings: 'Settings',
  preview: 'Preview',
  desktopPreview: 'Desktop preview',
  mobilePreview: 'Mobile preview',
  exportHtml: 'Export HTML',
  emptyTitle: 'Start your email',
  emptyDescription: 'Add a block from the palette to get started.',
  inspectorEmpty: 'Select a block to edit its properties.',
  duplicateBlock: 'Duplicate block',
  deleteBlock: 'Delete block',
  moveUp: 'Move up',
  moveDown: 'Move down',
};

// ============================================
// Component props
// ============================================

export type DevicePreview = 'desktop' | 'mobile';

export interface MediaPickerContext {
  onPick: (url: string) => void;
  onCancel: () => void;
}

export interface SavedBlocksContext {
  onPick: (block: EmailBlock) => void;
}

export interface EmailBuilderProps {
  document: EmailDocument;
  onDocumentChange: (next: EmailDocument) => void;
  brand?: EmailBrand;
  /** Slot for picking media (image picker, etc.). Receives a callback to commit. */
  renderMediaPicker?: (ctx: MediaPickerContext) => ReactNode;
  /** Slot for the saved-blocks library. */
  renderSavedBlocks?: (ctx: SavedBlocksContext) => ReactNode;
  /** Slot for a richer text editor (e.g. Lexical). Defaults to a `<textarea>`. */
  renderTextEditor?: (ctx: { value: string; onChange: (next: string) => void }) => ReactNode;
  /** Override the export-HTML button handler. Receives the rendered HTML string. */
  onExportHtml?: (html: string) => void;
  labels?: Partial<EmailBuilderLabels>;
  className?: string;
  /** Initial device preview. Defaults to `desktop`. */
  initialDevice?: DevicePreview;
}
