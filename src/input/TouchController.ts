import { Vector2D } from '../utils/Vector2D';

export class TouchController {
  private throttleValue: number = 0;
  private steeringValue: number = 0;
  private oilTriggered: boolean = false;
  private pauseTriggered: boolean = false;

  private dpadCenter: Vector2D = new Vector2D(120, 0);
  private isTouchingDpad: boolean = false;

  constructor() {
    this.setupTouchListeners();
  }

  private setupTouchListeners(): void {
    window.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });
    window.addEventListener('touchmove', this.handleTouch.bind(this), { passive: false });
    window.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
  }

  private handleTouch(e: TouchEvent): void {
    e.preventDefault();

    const width = window.innerWidth;
    const height = window.innerHeight;
    this.dpadCenter.y = height - 120;

    let localThrottle = 0;
    let localSteering = 0;
    let localOil = false;

    for (let i = 0; i < e.touches.length; i++) {
      const t = e.touches[i];
      const touchPos = new Vector2D(t.clientX, t.clientY);

      // Zona D-pad analógica virtual (Lado Izquierdo)
      if (touchPos.x < width * 0.4) {
        const diff = touchPos.subtract(this.dpadCenter);
        if (diff.length() < 120) {
          localSteering = Math.max(-1, Math.min(1, diff.x / 60));
          localThrottle = Math.max(-1, Math.min(1, -diff.y / 60));
        }
      }

      // Zona de Botón de Aceite (Lado Derecho Inferior)
      if (touchPos.x > width * 0.7 && touchPos.y > height - 160) {
        localOil = true;
      }

      // Zona de Pausa (Esquina Superior Derecha)
      if (touchPos.x > width - 60 && touchPos.y < 60) {
        this.pauseTriggered = true;
      }
    }

    this.steeringValue = localSteering;
    this.throttleValue = localThrottle;
    this.oilTriggered = localOil;
  }

  private handleTouchEnd(e: TouchEvent): void {
    if (e.touches.length === 0) {
      this.throttleValue = 0;
      this.steeringValue = 0;
      this.oilTriggered = false;
    }
  }

  public getThrottle(): number {
    return this.throttleValue;
  }

  public getSteering(): number {
    return this.steeringValue;
  }

  public isOilPressed(): boolean {
    return this.oilTriggered;
  }

  public isPausePressed(): boolean {
    const val = this.pauseTriggered;
    this.pauseTriggered = false;
    return val;
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.save();

    // D-Pad Virtual (Izquierda)
    const dpadX = 120;
    const dpadY = height - 120;

    ctx.beginPath();
    ctx.arc(dpadX, dpadY, 60, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Stick activo
    const stickX = dpadX + this.steeringValue * 40;
    const stickY = dpadY - this.throttleValue * 40;

    ctx.beginPath();
    ctx.arc(stickX, stickY, 25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
    ctx.fill();

    // Botón de Aceite (Derecha)
    const oilX = width - 100;
    const oilY = height - 100;

    ctx.beginPath();
    ctx.arc(oilX, oilY, 45, 0, Math.PI * 2);
    ctx.fillStyle = this.oilTriggered ? 'rgba(230, 126, 34, 0.8)' : 'rgba(230, 126, 34, 0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ACEITE', oilX, oilY);

    ctx.restore();
  }
}
