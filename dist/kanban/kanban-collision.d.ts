import { type CollisionDetection } from '@dnd-kit/core';
type CollisionArgs = Parameters<CollisionDetection>[0];
type CollisionResult = ReturnType<CollisionDetection>;
interface CollisionDetectionFns {
    pointerWithinFn?: CollisionDetection;
    closestCenterFn?: CollisionDetection;
}
export declare function runKanbanCollisionDetection(args: CollisionArgs, fns?: CollisionDetectionFns): CollisionResult;
export declare const kanbanCollisionDetection: CollisionDetection;
export declare function isKanbanCardDropAllowed<TStatus extends string>({ itemId, sourceStatus, targetStatus, canDropCard, }: {
    itemId: string;
    sourceStatus: TStatus;
    targetStatus: TStatus;
    canDropCard?: (itemId: string, targetStatus: TStatus) => boolean;
}): boolean;
export {};
