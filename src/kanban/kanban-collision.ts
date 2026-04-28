import { type CollisionDetection, closestCenter, pointerWithin } from '@dnd-kit/core';

type CollisionArgs = Parameters<CollisionDetection>[0];
type CollisionResult = ReturnType<CollisionDetection>;

interface CollisionDetectionFns {
  pointerWithinFn?: CollisionDetection;
  closestCenterFn?: CollisionDetection;
}

export function runKanbanCollisionDetection(
  args: CollisionArgs,
  fns: CollisionDetectionFns = {}
): CollisionResult {
  const pointerWithinFn = fns.pointerWithinFn ?? pointerWithin;
  const closestCenterFn = fns.closestCenterFn ?? closestCenter;
  const activeId = String(args.active.id);

  const pointerCollisions = pointerWithinFn(args).filter(
    (collision) => String(collision.id) !== activeId
  );
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }

  return closestCenterFn(args).filter((collision) => String(collision.id) !== activeId);
}

export const kanbanCollisionDetection: CollisionDetection = (args) =>
  runKanbanCollisionDetection(args);

export function isKanbanCardDropAllowed<TStatus extends string>({
  itemId,
  sourceStatus,
  targetStatus,
  canDropCard,
}: {
  itemId: string;
  sourceStatus: TStatus;
  targetStatus: TStatus;
  canDropCard?: (itemId: string, targetStatus: TStatus) => boolean;
}): boolean {
  if (sourceStatus === targetStatus) {
    return true;
  }

  return canDropCard ? canDropCard(itemId, targetStatus) : true;
}
