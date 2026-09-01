import { Vector2D } from '../utils/Vector2D';
import { MathUtils } from '../utils/MathUtils';
import { VehicleStats } from '../vehicles/VehicleConfig';
import { Tilemap } from '../levels/Tilemap';
import { Camera } from '../camera/Camera';
import { POWERUP_DURATION } from '../config/Constants';
import { AudioManager } from '../audio/AudioManager';

export class Player {
  public position: Vector2D;
  public velocity: Vector2D;
  public angle: number; // En radianes
  public stats: VehicleStats;

  public currentOil: number;
  public invulnerable: boolean = false;
  public invulnerabilityTimer: number = 0;

  public isSpinningOut: boolean = false;
  public spinTimer: number = 0;

  public radius: number = 18;

  constructor(x: number, y: number, stats: VehicleStats) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.angle = 0;
    this.stats = stats;
    this.currentOil = stats.maxOilCapacity;
  }

  public update(
    dt: number,
    throttle: number,   // -1 (freno/reversa) a 1 (acelerador)
    steering: number,   // -1 (izquierda) a 1 (derecha)
    tilemap: Tilemap
  ): void {
    if (this.invulnerable) {
      this.invulnerabilityTimer -= dt * 1000;
      if (this.invulnerabilityTimer <= 0) {
        this.invulnerable = false;
      }
    }

    if (this.isSpinningOut) {
      this.spinTimer -= dt * 1000;
      this.angle += 10 * dt; // Giro fuera de control
      this.velocity = this.velocity.multiply(0.92);
      this.position = this.position.add(this.velocity.multiply(dt));

      if (this.spinTimer <= 0) {
        this.isSpinningOut = false;
      }
      return;
    }

    // 1. Orientación y Dirección
    this.angle += steering * this.stats.turnSpeed * dt;

    // 2. Cálculo Vectorial de Aceleración Arcade
    const forwardDir = new Vector2D(Math.cos(this.angle), Math.sin(this.angle));

    if (throttle > 0) {
      const accelForce = forwardDir.multiply(this.stats.acceleration * throttle * dt);
      this.velocity = this.velocity.add(accelForce);
      AudioManager.getInstance().playEngineSound(1.0 + (this.velocity.length() / this.stats.maxSpeed) * 0.8);
    } else if (throttle < 0) {
      const brakeForce = forwardDir.multiply(this.stats.braking * throttle * dt);
      this.velocity = this.velocity.add(brakeForce);
    }

    // Cap de Velocidad Máxima
    if (this.velocity.length() > this.stats.maxSpeed) {
      this.velocity = this.velocity.normalize().multiply(this.stats.maxSpeed);
    }

    // 3. Simulación de Fricción e Inercia / Derrape Ligeramente Lateral
    const currentSpeed = this.velocity.length();
    if (currentSpeed > 0) {
      const currentDir = this.velocity.normalize();
      // Mezclar vector de movimiento hacia la dirección que apunta el auto según el agarre (grip)
      const blendedDir = currentDir.multiply(1 - this.stats.grip).add(forwardDir.multiply(this.stats.grip)).normalize();

      // Rozamiento pasivo
      const speedAfterFriction = Math.max(0, currentSpeed - 120 * dt);
      this.velocity = blendedDir.multiply(speedAfterFriction);
    }

    // 4. Integración de Posición y Colisión AABB con Paredes
    const nextX = this.position.x + this.velocity.x * dt;
    const nextY = this.position.y + this.velocity.y * dt;

    if (!this.checkWallCollision(nextX, this.position.y, tilemap)) {
      this.position.x = nextX;
    } else {
      this.velocity.x = -this.velocity.x * 0.4; // Rebote elástico
      AudioManager.getInstance().playCollisionSound();
    }

    if (!this.checkWallCollision(this.position.x, nextY, tilemap)) {
      this.position.y = nextY;
    } else {
      this.velocity.y = -this.velocity.y * 0.4; // Rebote elástico
      AudioManager.getInstance().playCollisionSound();
    }
  }

  private checkWallCollision(x: number, y: number, tilemap: Tilemap): boolean {
    const margin = this.radius;
    return (
      tilemap.isSolidAtWorldPos(x - margin, y - margin) ||
      tilemap.isSolidAtWorldPos(x + margin, y - margin) ||
      tilemap.isSolidAtWorldPos(x - margin, y + margin) ||
      tilemap.isSolidAtWorldPos(x + margin, y + margin)
    );
  }

  public triggerSpinout(duration: number): void {
    if (this.invulnerable) return;
    this.isSpinningOut = true;
    this.spinTimer = duration;
  }

  public activateInvulnerability(duration: number = POWERUP_DURATION): void {
    this.invulnerable = true;
    this.invulnerabilityTimer = duration;
  }

  public refillOil(amount: number = 999): void {
    this.currentOil = Math.min(this.stats.maxOilCapacity, this.currentOil + amount);
  }

  public useOil(): boolean {
    if (this.currentOil <= 0) return false;
    this.currentOil -= 1;
    return true;
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const screenPos = camera.worldToScreen(this.position.x, this.position.y);

    ctx.save();
    ctx.translate(screenPos.x, screenPos.y);
    ctx.rotate(this.angle);

    // Aura de Invulnerabilidad
    if (this.invulnerable) {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(241, 196, 15, 0.4)';
      ctx.fill();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Cuerpo del Auto
    ctx.fillStyle = this.stats.color;
    ctx.beginPath();
    // @ts-ignore - roundRect está soportado en navegadores modernos
    ctx.roundRect(-20, -12, 40, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Parabrisas
    ctx.fillStyle = '#111111';
    ctx.fillRect(-2, -8, 12, 16);

    // Luces delanteras
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(18, -10, 4, 4);
    ctx.fillRect(18, 6, 4, 4);

    ctx.restore();
  }
}
