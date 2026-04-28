import { closestCenter, pointerWithin } from '@dnd-kit/core';
export function runKanbanCollisionDetection(args, fns = {}) {
    const pointerWithinFn = fns.pointerWithinFn ?? pointerWithin;
    const closestCenterFn = fns.closestCenterFn ?? closestCenter;
    const activeId = String(args.active.id);
    const pointerCollisions = pointerWithinFn(args).filter((collision) => String(collision.id) !== activeId);
    if (pointerCollisions.length > 0) {
        return pointerCollisions;
    }
    return closestCenterFn(args).filter((collision) => String(collision.id) !== activeId);
}
export const kanbanCollisionDetection = (args) => runKanbanCollisionDetection(args);
export function isKanbanCardDropAllowed({ itemId, sourceStatus, targetStatus, canDropCard, }) {
    if (sourceStatus === targetStatus) {
        return true;
    }
    return canDropCard ? canDropCard(itemId, targetStatus) : true;
}
