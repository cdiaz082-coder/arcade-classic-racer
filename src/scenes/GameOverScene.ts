import { Scene } from './Scene';
import { SceneManager } from '../core/SceneManager';
import { MenuScene } from './MenuScene';
import { SaveManager } from '../save/SaveManager';
import { InputManager } from '../input/InputManager';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/Constants';

export class GameOverScene implements Scene {
  private finalScore: number;
  private highScore: number;
  private isNewRecord: boolean = false;
  private input: InputManager;
  private timeActive: number = 0;
  private wasPressed: boolean = true;

  constructor(score: number) {
    this.finalScore = score;
    this.highScore = SaveManager.getHighScore();
    this.isNewRecord = SaveManager.saveHighScore(score);
    this.input = InputManager.getInstance();
  }

  public init(): void {
    this.timeActive = 0;
    this.wasPressed = true;
  }

  public update(dt: number): void {
    this.timeActive += dt;

    // Bloquear input el primer segundo para no saltarlo por error
    if (this.timeActive > 1.0) {
      const pressed = this.input.isOilPressed() || this.input.isPausePressed();
      if (pressed && !this.wasPressed) {
        SceneManager.getInstance().changeScene(new MenuScene());
        return;
      }
      this.wasPressed = pressed;
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // GAME OVER
    ctx.fillStyle = '#e74c3c';
    ctx.font = '900 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 200);

    // Nuevo récord parpadeante
    if (this.isNewRecord) {
      const alpha = (Math.sin(this.timeActive * 5) + 1) / 2;
      ctx.fillStyle = `rgba(241, 196, 15, ${alpha.toFixed(2)})`;
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('¡NUEVO RÉCORD!', CANVAS_WIDTH / 2, 270);
    }

    // Estadísticas
    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.fillText(`PUNTUACIÓN FINAL: ${this.finalScore}`, CANVAS_WIDTH / 2, 340);

    const displayHigh = Math.max(this.finalScore, this.highScore);
    ctx.fillText(`MÁXIMA PUNTUACIÓN: ${displayHigh}`, CANVAS_WIDTH / 2, 390);

    if (this.timeActive > 1.0) {
      ctx.fillStyle = '#7f8c8d';
      ctx.font = '18px sans-serif';
      ctx.fillText('PRESIONA PARA VOLVER AL MENÚ', CANVAS_WIDTH / 2, 480);
    }

    ctx.restore();
  }
}
