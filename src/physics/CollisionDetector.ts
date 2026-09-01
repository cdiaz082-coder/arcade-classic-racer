import { Vector2D } from '../utils/Vector2D';

export class CollisionDetector {
  /**
   * Colisión Círculo vs Círculo
   */
  public static checkCircleCollision(
    pos1: Vector2D,
    radius1: number,
    pos2: Vector2D,
    radius2: number
  ): boolean {
    const distance = pos1.distanceTo(pos2);
    return distance < radius1 + radius2;
  }

  /**
   * Colisión Círculo vs AABB (Bounding Box de azulejos/paredes)
   */
  public static checkCircleAABBCollision(
    circlePos: Vector2D,
    radius: number,
    boxMin: Vector2D,
    boxMax: Vector2D
  ): boolean {
    const closestX = Math.max(boxMin.x, Math.min(circlePos.x, boxMax.x));
    const closestY = Math.max(boxMin.y, Math.min(circlePos.y, boxMax.y));

    const distanceX = circlePos.x - closestX;
    const distanceY = circlePos.y - closestY;

    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared < radius * radius;
  }

  /**
   * Colisión punto vs círculo (útil para items)
   */
  public static checkPointInCircle(
    point: Vector2D,
    center: Vector2D,
    radius: number
  ): boolean {
    return point.distanceTo(center) < radius;
  }
}
