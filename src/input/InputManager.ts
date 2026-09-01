import { KeyboardController } from './KeyboardController';
import { GamepadController } from './GamepadController';
import { TouchController } from './TouchController';

export class InputManager {
  private static instance: InputManager;
  private keyboard: KeyboardController;
  private gamepad: GamepadController;
  private touch: TouchController;

  private constructor() {
    this.keyboard = new KeyboardController();
    this.gamepad = new GamepadController();
    this.touch = new TouchController();
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  public getThrottle(): number {
    const k = this.keyboard.getThrottle();
    if (k !== 0) return k;

    const g = this.gamepad.getThrottle();
    if (g !== 0) return g;

    return this.touch.getThrottle();
  }

  public getSteering(): number {
    const k = this.keyboard.getSteering();
    if (k !== 0) return k;

    const g = this.gamepad.getSteering();
    if (g !== 0) return g;

    return this.touch.getSteering();
  }

  public isOilPressed(): boolean {
    return this.keyboard.isOilPressed() || this.gamepad.isOilPressed() || this.touch.isOilPressed();
  }

  public isPausePressed(): boolean {
    return this.keyboard.isPausePressed() || this.gamepad.isPausePressed() || this.touch.isPausePressed();
  }

  public renderTouchOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Renderizar controles virtuales si el dispositivo admite toque
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      this.touch.render(ctx, width, height);
    }
  }
}
