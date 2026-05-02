import type { ReactNode } from 'react';
import type { EmailBuilderLabels } from './types.js';
interface BuilderLeftTabsProps {
    labels: EmailBuilderLabels;
    blocksContent: ReactNode;
    designContent?: ReactNode;
    envelopeContent: ReactNode;
}
/** Vertical tab strip + content panel for the left sidebar. */
export declare function BuilderLeftTabs({ labels, blocksContent, designContent, envelopeContent, }: BuilderLeftTabsProps): import("react/jsx-runtime").JSX.Element;
export {};
