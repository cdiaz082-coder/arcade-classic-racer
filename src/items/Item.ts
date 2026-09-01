import { Vector2D } from '../utils/Vector2D';
import { Camera } from '../camera/Camera';

export enum ItemType {
  FLAG = 'FLAG',
  OIL_REFILL = 'OIL_REFILL',
  INVULNERABILITY = 'INVULNERABILITY',
  EXTRA_LIFE = 'EXTRA_LIFE'
}

export class Item {
  public position: Vector2D;
  public type: ItemType;
  public radius: number = 16;
  public collected: boolean = false;
  private floatOffset: number = 0;

  constructor(x: number, y: number, type: ItemType) {
    this.position = new Vector2D(x, y);
    this.type = type;
    this.floatOffset = Math.random() * Math.PI * 2;
  }

  public update(dt: number): void {
    this.floatOffset += dt * 4;
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (this.collected) return;

    const screenPos = camera.worldToScreen(this.position.x, this.position.y);
    const offsetY = Math.sin(this.floatOffset) * 4;

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y + offsetY);

    switch (this.type) {
      case ItemType.FLAG:
        // Bandera de Objetivo
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.moveTo(-6, -14);
        ctx.lineTo(10, -8);
        ctx.lineTo(-6, -2);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ecf0f1';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-6, -14);
        ctx.lineTo(-6, 12);
        ctx.stroke();
        break;

      case ItemType.OIL_REFILL:
        // Recarga de Aceite
        ctx.fillStyle = '#2c3e50';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#f39c12';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OIL', 0, 1);
        break;

      case ItemType.INVULNERABILITY:
        // Estrella / Escudo
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', 0, 1);
        break;

      case ItemType.EXTRA_LIFE:
        // Vida Extra
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♥', 0, 1);
        break;
    }

    ctx.restore();
  }
}
