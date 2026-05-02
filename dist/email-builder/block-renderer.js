'use client';
import { jsx as _jsx } from "react/jsx-runtime";
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
/** Pure renderer — turns an EmailBlock into preview React. No selection chrome. */
export function BlockRenderer({ block }) {
    return (_jsx(BlockErrorBoundary, { blockId: block.id, children: _jsx(BlockBody, { block: block }) }));
}
function BlockBody({ block }) {
    switch (block.kind) {
        case 'heading':
            return _jsx(HeadingBlock, { props: block.props });
        case 'text':
            return _jsx(TextBlock, { props: block.props });
        case 'image':
            return _jsx(ImageBlock, { props: block.props });
        case 'button':
            return _jsx(ButtonBlock, { props: block.props });
        case 'divider':
            return _jsx(DividerBlock, { props: block.props });
        case 'spacer':
            return _jsx(SpacerBlock, { props: block.props });
        case 'columns':
            return (_jsx(ColumnsBlock, { props: block.props, columnChildren: block.children }));
        case 'social':
            return _jsx(SocialBlock, { props: block.props });
        case 'footer':
            return _jsx(FooterBlock, { props: block.props });
        default:
            return null;
    }
}
