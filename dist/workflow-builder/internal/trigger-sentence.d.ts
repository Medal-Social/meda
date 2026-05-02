import type { WorkflowNodeKind } from '../types.js';
/**
 * Returns a short human-readable description for a workflow node based on its
 * kind. Consumers can override per-node via `data.description`.
 */
export declare function getDefaultNodeSentence(kind: WorkflowNodeKind, label?: string): string;
/** Tailwind class tokens per kind. Mapped to the meda token system. */
export declare const NODE_KIND_STYLES: Record<WorkflowNodeKind, {
    bg: string;
    border: string;
    icon: string;
}>;
export declare const NODE_WIDTH = 264;
export declare const NODE_HEIGHT = 80;
