import { type EdgeProps } from '@xyflow/react';
interface DefaultEdgeData {
    readOnly?: boolean;
}
type DefaultWorkflowEdgeProps = EdgeProps & {
    data?: DefaultEdgeData;
};
declare function DefaultWorkflowEdgeComponent({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, }: DefaultWorkflowEdgeProps): import("react/jsx-runtime").JSX.Element;
export declare const DefaultWorkflowEdge: import("react").MemoExoticComponent<typeof DefaultWorkflowEdgeComponent>;
export {};
