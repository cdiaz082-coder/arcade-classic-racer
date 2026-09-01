import { Scene } from './Scene';
import { SceneManager } from '../core/SceneManager';
import { GameScene } from './GameScene';
import { InputManager } from '../input/InputManager';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/Constants';

export class MenuScene implements Scene {
  private titleAnimationTime: number = 0;
  private input: InputManager;
  private canStart: boolean = false;
  private startDelay: number = 0.4; // Evita inicio inmediato al cargar

  constructor() {
    this.input = InputManager.getInstance();
  }

  public init(): void {
    this.titleAnimationTime = 0;
    this.canStart = false;
    this.startDelay = 0.4;
  }

  public update(dt: number): void {
    this.titleAnimationTime += dt * 3;

    if (this.startDelay > 0) {
      this.startDelay -= dt;
      if (this.startDelay <= 0) this.canStart = true;
      return;
    }

    if (this.canStart && (this.input.isOilPressed() || this.input.isPausePressed())) {
      SceneManager.getInstance().changeScene(new GameScene());
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#1a252f');
    gradient.addColorStop(1, '#111820');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Título animado
    const scale = 1 + Math.sin(this.titleAnimationTime) * 0.03;
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 220);
    ctx.scale(scale, scale);

    ctx.fillStyle = '#e67e22';
    ctx.font = '900 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('RALLY-X REDUX', 0, 0);
    ctx.restore();

    ctx.fillStyle = '#ecf0f1';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      '¡Evita a los enemigos y recolecta todas las banderas!',
      CANVAS_WIDTH / 2,
      340
    );

    // Texto parpadeante
    const alpha = (Math.sin(this.titleAnimationTime * 2) + 1) / 2;
    ctx.fillStyle = `rgba(241, 196, 15, ${alpha.toFixed(2)})`;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(
      'PRESIONA ESPACIO / BOTÓN A / TOCA PARA EMPEZAR',
      CANVAS_WIDTH / 2,
      480
    );

    // Controles
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '14px sans-serif';
    ctx.fillText(
      'WASD / Flechas = Mover   |   ESPACIO = Aceite   |   P = Pausa',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 40
    );

    ctx.restore();
  }
}
