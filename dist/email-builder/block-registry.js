const DEFAULT_PADDING = { top: 12, right: 24, bottom: 12, left: 24 };
let __idCounter = 0;
function genId(prefix = 'blk') {
    __idCounter += 1;
    // Prefix + epoch + counter is enough for stable in-memory uniqueness.
    return `${prefix}_${Date.now().toString(36)}_${__idCounter.toString(36)}`;
}
export function getDefaultBlockProps() {
    const heading = {
        text: 'Your headline',
        level: 2,
        alignment: 'left',
        color: '#111827',
        fontFamily: '',
        fontWeight: 600,
        fontSize: 28,
        padding: { ...DEFAULT_PADDING },
    };
    const text = {
        content: 'Tell your readers what this email is about.',
        alignment: 'left',
        color: '#374151',
        fontFamily: '',
        fontWeight: 400,
        fontSize: 16,
        padding: { ...DEFAULT_PADDING },
    };
    const image = {
        src: '',
        alt: 'Image',
        linkUrl: '',
        width: 600,
        height: 'auto',
        alignment: 'center',
        padding: { ...DEFAULT_PADDING },
    };
    const button = {
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
    const divider = {
        color: '#e5e7eb',
        thickness: 1,
        width: 100,
        style: 'solid',
        padding: { ...DEFAULT_PADDING },
    };
    const spacer = { height: 24 };
    const columns = {
        layout: '50-50',
        verticalAlignment: 'top',
        backgroundColor: 'transparent',
        gap: 16,
        mobileStacking: true,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
    };
    const social = {
        links: [
            { platform: 'twitter', url: 'https://twitter.com/' },
            { platform: 'linkedin', url: 'https://linkedin.com/' },
        ],
        iconSize: 24,
        spacing: 8,
        alignment: 'center',
        padding: { ...DEFAULT_PADDING },
    };
    const footer = {
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
export const COLUMN_WIDTHS = {
    '50-50': [50, 50],
    '33-67': [33, 67],
    '67-33': [67, 33],
    '33-33-33': [33, 33, 34],
};
export function getColumnWidths(layout) {
    return COLUMN_WIDTHS[layout] ?? [100];
}
export function createBlock(kind, overrides) {
    const defaults = { ...getDefaultBlockProps()[kind] };
    const props = overrides ? { ...defaults, ...overrides } : defaults;
    const block = { id: genId(kind), kind, props };
    if (kind === 'columns') {
        const layout = props.layout;
        block.children = Array.from({ length: getColumnWidths(layout).length }, () => []);
    }
    return block;
}
export const BLOCK_REGISTRY = [
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
export const ALIGNMENT_OPTIONS = ['left', 'center', 'right'];
