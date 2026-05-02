interface DropZoneProps {
    /** Stable id (e.g. `drop-2`). */
    id: string;
    /** Visual height when no block is being dragged. */
    collapsedHeight?: number;
}
/** A horizontal drop slot rendered between blocks on the canvas. */
export declare function DropZone({ id, collapsedHeight }: DropZoneProps): import("react/jsx-runtime").JSX.Element;
export {};
