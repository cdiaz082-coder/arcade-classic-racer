import { Scene } from './Scene';
import { SceneManager } from '../core/SceneManager';
import { GameScene } from './GameScene';
import { GameOverScene } from './GameOverScene';
import { InputManager } from '../input/InputManager';
import { AudioManager } from '../audio/AudioManager';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/Constants';

/**
 * Pantalla clásica de CONTINUE con cuenta regresiva 9 → 0.
 * Si el jugador pulsa un botón a tiempo, reanuda con la misma puntuación y nivel.
 * Si llega a 0, pasa a Game Over.
 */
export class ContinueScene implements Scene {
  private countdown: number = 9;
  private timer: number = 0;
  private score: number;
  private levelIndex: number;
  private input: InputManager;
  private wasPressed: boolean = true; // Evita continuar con el mismo frame del input anterior

  constructor(score: number, levelIndex: number) {
    this.score = score;
    this.levelIndex = levelIndex;
    this.input = InputManager.getInstance();
  }

  public init(): void {
    this.countdown = 9;
    this.timer = 0;
    this.wasPressed = true;
    AudioManager.getInstance().playCollisionSound();
  }

  public update(dt: number): void {
    this.timer += dt;

    // Cada segundo baja la cuenta
    if (this.timer >= 1.0) {
      this.timer -= 1.0;
      this.countdown--;

      if (this.countdown < 0) {
        SceneManager.getInstance().changeScene(new GameOverScene(this.score));
        return;
      }
    }

    const pressed = this.input.isOilPressed() || this.input.isPausePressed();

    // Solo aceptar input después de soltar el botón anterior
    if (pressed && !this.wasPressed) {
      // Continuar: reanudar partida con score y nivel actuales
      const nextGame = new GameScene(this.score, this.levelIndex, true);
      SceneManager.getInstance().changeScene(nextGame);
      return;
    }

    this.wasPressed = pressed;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    // Fondo con destello rojo dramático
    const flash = Math.sin(Date.now() * 0.005) * 0.15 + 0.15;
    ctx.fillStyle = `rgba(180, 0, 0, ${flash})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#111111';
    ctx.fillRect(50, 50, CANVAS_WIDTH - 100, CANVAS_HEIGHT - 100);

    // Título
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 56px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¿CONTINUAR?', CANVAS_WIDTH / 2, 180);

    // Número gigante estilo arcade
    ctx.fillStyle = this.countdown <= 3 ? '#e74c3c' : '#ffffff';
    ctx.font = '900 140px sans-serif';
    ctx.fillText(this.countdown.toString(), CANVAS_WIDTH / 2, 340);

    // Barra de "mecha" que se acorta
    const fuseWidth = Math.max(0, (this.countdown / 9) * 300);
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(CANVAS_WIDTH / 2 - 150, 410, 300, 10);
    ctx.fillStyle = this.countdown <= 3 ? '#e74c3c' : '#e67e22';
    ctx.fillRect(CANVAS_WIDTH / 2 - 150, 410, fuseWidth, 10);

    // Instrucción
    ctx.fillStyle = '#ecf0f1';
    ctx.font = '20px sans-serif';
    ctx.fillText(
      'PRESIONA ESPACIO / BOTÓN A / TOCA PARA CONTINUAR',
      CANVAS_WIDTH / 2,
      480
    );

    // Score actual
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Puntuación actual: ${this.score}  |  Nivel ${this.levelIndex}`, CANVAS_WIDTH / 2, 540);

    ctx.restore();
  }
}
