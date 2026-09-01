import { Vector2D } from '../utils/Vector2D';
import { MathUtils } from '../utils/MathUtils';

export class Camera {
  public position: Vector2D;
  public viewportWidth: number;
  public viewportHeight: number;
  public zoom: number;
  
  // Parámetros para el zoom dinámico por velocidad
  private minZoom: number = 1.4; // Zoom máximo cuando el auto va rápido (se aleja la vista)
  private maxZoom: number = 2.2; // Zoom mínimo cuando el auto va lento/detenido (se acerca la vista)
  private targetZoom: number = 1.8;

  private mapWidth: number = 0;
  private mapHeight: number = 0;

  constructor(viewportWidth: number, viewportHeight: number, initialZoom: number = 1.8) {
    this.position = new Vector2D(0, 0);
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.zoom = initialZoom;
  }

  public setBounds(mapWidth: number, mapHeight: number): void {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  public updateViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  /**
   * Sigue al vehículo y ajusta el zoom dinámicamente según su velocidad actual.
   * @param targetX Posición X del auto
   * @param targetY Posición Y del auto
   * @param currentSpeed Velocidad actual del vehículo
   * @param maxSpeed Velocidad máxima esperada del vehículo
   * @param lerpFactor Factor de suavizado
   */
  public followWithSpeed(
    targetX: number, 
    targetY: number, 
    currentSpeed: number, 
    maxSpeed: number = 10, 
    lerpFactor: number = 0.1
  ): void {
    // Calcular el zoom objetivo basado en la velocidad (más velocidad = menor zoom / más alejado)
    const speedRatio = MathUtils.clamp(Math.abs(currentSpeed) / Math.max(maxSpeed, 1), 0, 1);
    this.targetZoom = MathUtils.lerp(this.maxZoom, this.minZoom, speedRatio);

    // Suavizar la transición del zoom para que no sea brusco
    this.zoom = MathUtils.lerp(this.zoom, this.targetZoom, 0.05);

    const effectiveWidth = this.viewportWidth / this.zoom;
    const effectiveHeight = this.viewportHeight / this.zoom;

    const desiredX = targetX - effectiveWidth / 2;
    const desiredY = targetY - effectiveHeight / 2;

    this.position.x = MathUtils.lerp(this.position.x, desiredX, lerpFactor);
    this.position.y = MathUtils.lerp(this.position.y, desiredY, lerpFactor);

    // Confinar la cámara dentro de los límites del mapa
    if (this.mapWidth > 0 && this.mapHeight > 0) {
      const maxW = this.mapWidth - effectiveWidth;
      const maxH = this.mapHeight - effectiveHeight;

      if (this.mapWidth <= effectiveWidth) {
        this.position.x = (this.mapWidth - effectiveWidth) / 2;
      } else {
        this.position.x = MathUtils.clamp(this.position.x, 0, maxW);
      }

      if (this.mapHeight <= effectiveHeight) {
        this.position.y = (this.mapHeight - effectiveHeight) / 2;
      } else {
        this.position.y = MathUtils.clamp(this.position.y, 0, maxH);
      }
    }
  }

  public worldToScreen(worldX: number, worldY: number): Vector2D {
    return new Vector2D(
      (worldX - this.position.x) * this.zoom,
      (worldY - this.position.y) * this.zoom
    );
  }

  public screenToWorld(screenX: number, screenY: number): Vector2D {
    return new Vector2D(
      (screenX / this.zoom) + this.position.x,
      (screenY / this.zoom) + this.position.y
    );
  }
}
