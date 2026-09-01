import { KeyboardController } from './KeyboardController';
import { GamepadController } from './GamepadController';
import { TouchController } from './TouchController';

export class InputManager {
  private static instance: InputManager;
  private keyboard: KeyboardController;
  private gamepad: GamepadController;
  private touch: TouchController | null = null;

  private constructor() {
    this.keyboard = new KeyboardController();
    this.gamepad = new GamepadController();
    // Nota: El TouchController se inicializará cuando el canvas esté disponible
  }

  public static getInstance(): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager();
    }
    return InputManager.instance;
  }

  // Inicializar el touch controller pasándole el canvas del juego
  public initTouch(canvas: HTMLCanvasElement): void {
    if (!this.touch) {
      this.touch = new TouchController(canvas);
    }
  }

  public getThrottle(): number {
    const k = this.keyboard.getThrottle();
    if (k !== 0) return k;

    const g = this.gamepad.getThrottle();
    if (g !== 0) return g;

    if (this.touch) {
      const state = this.touch.getState();
      // Botón A presionado = Acelerar a fondo (1.0), si no, 0
      return state.actionA ? 1.0 : 0;
    }
    return 0;
  }

  public getSteering(): number {
    const k = this.keyboard.getSteering();
    if (k !== 0) return k;

    const g = this.gamepad.getSteering();
    if (g !== 0) return g;

    if (this.touch) {
      const state = this.touch.getState();
      if (state.left) return -1.0; // Girar a la izquierda
      if (state.right) return 1.0;  // Girar a la derecha
    }
    return 0;
  }

  public isOilPressed(): boolean {
    if (this.keyboard.isOilPressed() || this.gamepad.isOilPressed()) return true;

    if (this.touch) {
      // Botón B presionado = Soltar aceite
      return this.touch.getState().actionB;
    }
    return false;
  }

  public isPausePressed(): boolean {
    return this.keyboard.isPausePressed() || this.gamepad.isPausePressed();
  }

  public renderTouchOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (('ontouchstart' in window || navigator.maxTouchPoints > 0) && this.touch) {
      this.touch.draw(ctx);
    }
  }
}  
