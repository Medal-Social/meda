import type { ReactNode } from 'react';
import type { BlockKind, BlockPropsMap, EmailBlock, EmailBuilderProps } from './types.js';
interface PropertyInspectorProps {
    block: EmailBlock | null;
    onChange: <K extends BlockKind>(blockId: string, patch: Partial<BlockPropsMap[K]>) => void;
    emptyContent: ReactNode;
    renderMediaPicker?: EmailBuilderProps['renderMediaPicker'];
    renderTextEditor?: EmailBuilderProps['renderTextEditor'];
}
export declare function PropertyInspector({ block, onChange, emptyContent, renderMediaPicker, renderTextEditor, }: PropertyInspectorProps): import("react/jsx-runtime").JSX.Element;
export {};
