import { Vector2D } from '../utils/Vector2D';
import { Camera } from '../camera/Camera';
import { OIL_SLICK_DURATION } from '../config/Constants';

export class OilSlick {
  public position: Vector2D;
  public radius: number = 28;
  public life: number;
  public maxLife: number;
  public active: boolean = true;

  constructor(x: number, y: number, duration: number = OIL_SLICK_DURATION) {
    this.position = new Vector2D(x, y);
    this.life = duration;
    this.maxLife = duration;
  }

  public update(dt: number): void {
    this.life -= dt * 1000;
    if (this.life <= 0) {
      this.active = false;
    }
  }

  public contains(x: number, y: number): boolean {
    const dx = this.position.x - x;
    const dy = this.position.y - y;
    return Math.sqrt(dx * dx + dy * dy) < this.radius;
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (!this.active) return;

    const screen = camera.worldToScreen(this.position.x, this.position.y);
    const alpha = Math.max(0.15, this.life / this.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Mancha de aceite
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(screen.x, screen.y, this.radius, this.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Brillo
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}
