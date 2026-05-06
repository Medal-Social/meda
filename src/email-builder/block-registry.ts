// Block defaults + metadata registry. Pure data — no React imports.
import type {
  Alignment,
  BlockKind,
  BlockPropsMap,
  ButtonBlockProps,
  ColumnLayout,
  ColumnsBlockProps,
  DividerBlockProps,
  EmailBlock,
  FooterBlockProps,
  HeadingBlockProps,
  ImageBlockProps,
  SocialBlockProps,
  SpacerBlockProps,
  SpacingValue,
  TextBlockProps,
} from './types.js';

const DEFAULT_PADDING: SpacingValue = { top: 12, right: 24, bottom: 12, left: 24 };

let __idCounter = 0;
function genId(prefix = 'blk'): string {
  __idCounter += 1;
  // Prefix + epoch + counter is enough for stable in-memory uniqueness.
  return `${prefix}_${Date.now().toString(36)}_${__idCounter.toString(36)}`;
}

export function getDefaultBlockProps(): { [K in BlockKind]: BlockPropsMap[K] } {
  const heading: HeadingBlockProps = {
    text: 'Your headline',
    level: 2,
    alignment: 'left',
    color: '#111827',
    fontFamily: '',
    fontWeight: 600,
    fontSize: 28,
    padding: { ...DEFAULT_PADDING },
  };
  const text: TextBlockProps = {
    content: 'Tell your readers what this email is about.',
    alignment: 'left',
    color: '#374151',
    fontFamily: '',
    fontWeight: 400,
    fontSize: 16,
    padding: { ...DEFAULT_PADDING },
  };
  const image: ImageBlockProps = {
    src: '',
    alt: 'Image',
    linkUrl: '',
    width: 600,
    height: 'auto',
    alignment: 'center',
    padding: { ...DEFAULT_PADDING },
  };
  const button: ButtonBlockProps = {
    text: 'Click me',
    url: 'https://',
    backgroundColor: '#4F46E5',
    textColor: '#ffffff',
    borderRadius: 8,
    size: 'md',
    alignment: 'center',
    fullWidth: false,
    padding: { ...DEFAULT_PADDING },
  };
  const divider: DividerBlockProps = {
    color: '#e5e7eb',
    thickness: 1,
    width: 100,
    style: 'solid',
    padding: { ...DEFAULT_PADDING },
  };
  const spacer: SpacerBlockProps = { height: 24 };
  const columns: ColumnsBlockProps = {
    layout: '50-50',
    verticalAlignment: 'top',
    backgroundColor: 'transparent',
    gap: 16,
    mobileStacking: true,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  };
  const social: SocialBlockProps = {
    links: [
      { platform: 'twitter', url: 'https://twitter.com/' },
      { platform: 'linkedin', url: 'https://linkedin.com/' },
    ],
    iconSize: 24,
    spacing: 8,
    alignment: 'center',
    padding: { ...DEFAULT_PADDING },
  };
  const footer: FooterBlockProps = {
    companyName: 'Your Company',
    address: '123 Main St, City, Country',
    customText: 'You received this email because you signed up at example.com.',
    unsubscribeText: 'Unsubscribe',
    textColor: '#6b7280',
    fontSize: 12,
    alignment: 'center',
    padding: { top: 24, right: 24, bottom: 24, left: 24 },
  };
  return { heading, text, image, button, divider, spacer, columns, social, footer };
}

export const COLUMN_WIDTHS: Record<ColumnLayout, number[]> = {
  '50-50': [50, 50],
  '33-67': [33, 67],
  '67-33': [67, 33],
  '33-33-33': [33, 33, 34],
};

export function getColumnWidths(layout: ColumnLayout): number[] {
  /* v8 ignore next -- fallback is unreachable; ColumnLayout union exhausts COLUMN_WIDTHS keys */
  return COLUMN_WIDTHS[layout] ?? [100];
}

export function createBlock<K extends BlockKind>(
  kind: K,
  overrides?: Partial<BlockPropsMap[K]>
): EmailBlock<K> {
  const defaults = { ...getDefaultBlockProps()[kind] } as BlockPropsMap[K];
  const props = overrides ? { ...defaults, ...overrides } : defaults;
  const block: EmailBlock<K> = { id: genId(kind), kind, props };
  if (kind === 'columns') {
    const layout = (props as unknown as ColumnsBlockProps).layout;
    block.children = Array.from({ length: getColumnWidths(layout).length }, () => []);
  }
  return block;
}

// ============================================
// Block metadata for the palette
// ============================================

export interface BlockMeta {
  kind: BlockKind;
  label: string;
  description: string;
  category: 'content' | 'layout' | 'marketing';
}

export const BLOCK_REGISTRY: BlockMeta[] = [
  {
    kind: 'heading',
    label: 'Heading',
    description: 'Section headline.',
    category: 'content',
  },
  {
    kind: 'text',
    label: 'Text',
    description: 'A paragraph of text.',
    category: 'content',
  },
  { kind: 'image', label: 'Image', description: 'An inline image.', category: 'content' },
  {
    kind: 'button',
    label: 'Button',
    description: 'Call-to-action button.',
    category: 'content',
  },
  {
    kind: 'divider',
    label: 'Divider',
    description: 'A horizontal divider.',
    category: 'layout',
  },
  {
    kind: 'spacer',
    label: 'Spacer',
    description: 'Vertical whitespace.',
    category: 'layout',
  },
  {
    kind: 'columns',
    label: 'Columns',
    description: 'Multi-column layout.',
    category: 'layout',
  },
  {
    kind: 'social',
    label: 'Social',
    description: 'Social media icons.',
    category: 'marketing',
  },
  {
    kind: 'footer',
    label: 'Footer',
    description: 'Email footer with unsubscribe link.',
    category: 'marketing',
  },
];

export const ALIGNMENT_OPTIONS: Alignment[] = ['left', 'center', 'right'];
