import { Vector2D } from '../utils/Vector2D';
import { MathUtils } from '../utils/MathUtils';

export class Camera {
  public position: Vector2D;
  public viewportWidth: number;
  public viewportHeight: number;
  private mapWidth: number = 0;
  private mapHeight: number = 0;

  constructor(viewportWidth: number, viewportHeight: number) {
    this.position = new Vector2D(0, 0);
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
  }

  public setBounds(mapWidth: number, mapHeight: number): void {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  public updateViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  public follow(targetX: number, targetY: number, lerpFactor: number = 0.1): void {
    const desiredX = targetX - this.viewportWidth / 2;
    const desiredY = targetY - this.viewportHeight / 2;

    this.position.x = MathUtils.lerp(this.position.x, desiredX, lerpFactor);
    this.position.y = MathUtils.lerp(this.position.y, desiredY, lerpFactor);

    // Confinar la cámara dentro de las dimensiones del mapa
    if (this.mapWidth > 0 && this.mapHeight > 0) {
      if (this.mapWidth <= this.viewportWidth) {
        this.position.x = (this.mapWidth - this.viewportWidth) / 2;
      } else {
        this.position.x = MathUtils.clamp(this.position.x, 0, this.mapWidth - this.viewportWidth);
      }

      if (this.mapHeight <= this.viewportHeight) {
        this.position.y = (this.mapHeight - this.viewportHeight) / 2;
      } else {
        this.position.y = MathUtils.clamp(this.position.y, 0, this.mapHeight - this.viewportHeight);
      }
    }
  }

  public worldToScreen(worldX: number, worldY: number): Vector2D {
    return new Vector2D(worldX - this.position.x, worldY - this.position.y);
  }

  public screenToWorld(screenX: number, screenY: number): Vector2D {
    return new Vector2D(screenX + this.position.x, screenY + this.position.y);
  }
}
