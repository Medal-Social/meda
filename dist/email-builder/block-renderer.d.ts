import type { EmailBlock } from './types.js';
/** Pure renderer — turns an EmailBlock into preview React. No selection chrome. */
export declare function BlockRenderer({ block }: {
    block: EmailBlock;
}): import("react/jsx-runtime").JSX.Element;
