// Email builder type system.
//
// Block kinds match the spec from the source surface
// (apps/web/src/components/email-builder/block-types.ts) but are narrowed to a
// publishable subset. The Convex-coupled `contentSlot` kind is omitted.
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
];
export const defaultEmailBuilderLabels = {
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
