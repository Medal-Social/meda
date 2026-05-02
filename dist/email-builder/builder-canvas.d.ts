import type { ReactNode } from 'react';
import type { DevicePreview, EmailBlock, EmailBuilderLabels } from './types.js';
interface BuilderCanvasProps {
    blocks: EmailBlock[];
    selectedBlockId: string | null;
    onSelectBlock: (id: string | null) => void;
    device: DevicePreview;
    labels: EmailBuilderLabels;
    /** Optional content to render above the empty state — typically the palette CTA. */
    emptyStateAction?: ReactNode;
    /** Per-block floating bar; rendered near the selected block. */
    renderFloatingBar?: (block: EmailBlock) => ReactNode;
}
export declare function BuilderCanvas({ blocks, selectedBlockId, onSelectBlock, device, labels, emptyStateAction, renderFloatingBar, }: BuilderCanvasProps): import("react/jsx-runtime").JSX.Element;
export {};
