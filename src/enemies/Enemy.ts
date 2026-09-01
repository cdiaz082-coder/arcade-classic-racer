import { Vector2D } from '../utils/Vector2D';
import { Tilemap } from '../levels/Tilemap';
import { Camera } from '../camera/Camera';
import { Player } from '../player/Player';
import { MathUtils } from '../utils/MathUtils';

export enum EnemyType {
  CHASER = 'CHASER',
  INTERCEPTOR = 'INTERCEPTOR',
  BLOCKER = 'BLOCKER',
  SCOUT = 'SCOUT',
  HEAVY = 'HEAVY'
}

export class Enemy {
  public position: Vector2D;
  public velocity: Vector2D;
  public angle: number = 0;
  public type: EnemyType;
  public radius: number = 16;
  public isAlive: boolean = true;
  public isSpinningOut: boolean = false;
  public spinTimer: number = 0;

  private maxSpeed: number;
  private baseSpeed: number;
  private color: string;
  private pathUpdateTimer: number = 0;
  private targetPos: Vector2D;

  constructor(x: number, y: number, type: EnemyType, speedMultiplier: number = 1.0) {
    this.position = new Vector2D(x, y);
    this.velocity = new Vector2D(0, 0);
    this.type = type;
    this.targetPos = new Vector2D(x, y);

    switch (type) {
      case EnemyType.CHASER:
        this.baseSpeed = 160;
        this.color = '#e74c3c';
        break;
      case EnemyType.INTERCEPTOR:
        this.baseSpeed = 200;
        this.color = '#e67e22';
        break;
      case EnemyType.BLOCKER:
        this.baseSpeed = 120;
        this.color = '#8e44ad';
        break;
      case EnemyType.SCOUT:
        this.baseSpeed = 240;
        this.color = '#1abc9c';
        this.radius = 14;
        break;
      case EnemyType.HEAVY:
        this.baseSpeed = 100;
        this.color = '#2c3e50';
        this.radius = 22;
        break;
      default:
        this.baseSpeed = 150;
        this.color = '#c0392b';
    }

    this.maxSpeed = this.baseSpeed * speedMultiplier;
  }

  public update(dt: number, player: Player, tilemap: Tilemap): void {
    if (!this.isAlive) return;

    if (this.isSpinningOut) {
      this.spinTimer -= dt * 1000;
      this.angle += 12 * dt;
      this.velocity = this.velocity.multiply(0.9);
      this.position = this.position.add(this.velocity.multiply(dt));
      if (this.spinTimer <= 0) this.isSpinningOut = false;
      return;
    }

    this.pathUpdateTimer -= dt;
    if (this.pathUpdateTimer <= 0) {
      this.updateTarget(player);
      this.pathUpdateTimer = 0.3 + Math.random() * 0.2;
    }

    // Moverse hacia el objetivo
    const toTarget = this.targetPos.subtract(this.position);
    const dist = toTarget.length();

    if (dist > 4) {
      const dir = toTarget.normalize();
      this.velocity = dir.multiply(this.maxSpeed);
      this.angle = Math.atan2(dir.y, dir.x);
    } else {
      this.velocity = this.velocity.multiply(0.8);
    }

    // Integración + colisión simple
    const nextX = this.position.x + this.velocity.x * dt;
    const nextY = this.position.y + this.velocity.y * dt;

    if (!this.checkWall(nextX, this.position.y, tilemap)) {
      this.position.x = nextX;
    } else {
      this.velocity.x *= -0.5;
    }

    if (!this.checkWall(this.position.x, nextY, tilemap)) {
      this.position.y = nextY;
    } else {
      this.velocity.y *= -0.5;
    }
  }

  private updateTarget(player: Player): void {
    switch (this.type) {
      case EnemyType.CHASER:
        // Perseguir directamente
        this.targetPos = player.position.clone();
        break;

      case EnemyType.INTERCEPTOR:
        // Anticipar posición del jugador
        const predict = player.velocity.multiply(0.6);
        this.targetPos = player.position.add(predict);
        break;

      case EnemyType.BLOCKER:
        // Intentar ponerse entre el jugador y el centro/salida
        this.targetPos = new Vector2D(
          MathUtils.lerp(player.position.x, this.position.x, 0.3),
          MathUtils.lerp(player.position.y, this.position.y, 0.3)
        );
        break;

      case EnemyType.SCOUT:
        // Movimiento más errático / patrulla cerca del jugador
        const offset = new Vector2D(
          (Math.random() - 0.5) * 180,
          (Math.random() - 0.5) * 180
        );
        this.targetPos = player.position.add(offset);
        break;

      case EnemyType.HEAVY:
        // Más lento, persigue pero con menos actualización
        this.targetPos = player.position.clone();
        break;
    }
  }

  private checkWall(x: number, y: number, tilemap: Tilemap): boolean {
    const m = this.radius * 0.7;
    return (
      tilemap.isSolidAtWorldPos(x - m, y - m) ||
      tilemap.isSolidAtWorldPos(x + m, y - m) ||
      tilemap.isSolidAtWorldPos(x - m, y + m) ||
      tilemap.isSolidAtWorldPos(x + m, y + m)
    );
  }

  public triggerSpinout(duration: number = 1500): void {
    this.isSpinningOut = true;
    this.spinTimer = duration;
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    if (!this.isAlive) return;

    const screen = camera.worldToScreen(this.position.x, this.position.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.rotate(this.angle);

    // Cuerpo
    ctx.fillStyle = this.color;
    ctx.beginPath();
    // @ts-ignore
    ctx.roundRect(-16, -10, 32, 20, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Indicador de tipo
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = this.type.charAt(0);
    ctx.fillText(label, 0, 0);

    ctx.restore();
  }
}
