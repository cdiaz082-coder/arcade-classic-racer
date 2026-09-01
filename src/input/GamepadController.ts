export class GamepadController {
  private gamepadIndex: number | null = null;

  constructor() {
    window.addEventListener('gamepadconnected', (e: GamepadEvent) => {
      this.gamepadIndex = e.gamepad.index;
    });

    window.addEventListener('gamepaddisconnected', (e: GamepadEvent) => {
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadIndex = null;
      }
    });
  }

  private getGamepad(): Gamepad | null {
    if (this.gamepadIndex === null) return null;
    const gamepads = navigator.getGamepads();
    return gamepads[this.gamepadIndex] || null;
  }

  public getThrottle(): number {
    const gp = this.getGamepad();
    if (!gp) return 0;

    // Triggers R2 / L2 o Stick Analógico Izquierdo Y
    const r2 = gp.buttons[7] ? gp.buttons[7].value : 0;
    const l2 = gp.buttons[6] ? gp.buttons[6].value : 0;

    if (r2 > 0.1 || l2 > 0.1) {
      return r2 - l2;
    }

    const axisY = gp.axes[1] || 0;
    if (Math.abs(axisY) > 0.15) {
      return -axisY; // Invertir eje Y estándar
    }

    return 0;
  }

  public getSteering(): number {
    const gp = this.getGamepad();
    if (!gp) return 0;

    const axisX = gp.axes[0] || 0;
    if (Math.abs(axisX) > 0.15) {
      return axisX;
    }

    // D-Pad Izquierda / Derecha
    if (gp.buttons[14] && gp.buttons[14].pressed) return -1;
    if (gp.buttons[15] && gp.buttons[15].pressed) return 1;

    return 0;
  }

  public isOilPressed(): boolean {
    const gp = this.getGamepad();
    if (!gp) return false;

    // Botón A / X (índice 0) o Botón B / Circle (índice 1)
    return (gp.buttons[0] && gp.buttons[0].pressed) || (gp.buttons[1] && gp.buttons[1].pressed);
  }

  public isPausePressed(): boolean {
    const gp = this.getGamepad();
    if (!gp) return false;

    // Botón Start / Options (índice 9)
    return gp.buttons[9] ? gp.buttons[9].pressed : false;
  }
}
