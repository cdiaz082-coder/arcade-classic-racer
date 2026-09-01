export class KeyboardController {
  private keys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      this.keys.add(e.code);
    });

    window.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    });

    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  public getThrottle(): number {
    let throttle = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) throttle += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) throttle -= 1;
    return throttle;
  }

  public getSteering(): number {
    let steering = 0;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) steering += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) steering -= 1;
    return steering;
  }

  public isOilPressed(): boolean {
    return this.keys.has('Space');
  }

  public isPausePressed(): boolean {
    return this.keys.has('KeyP') || this.keys.has('Escape');
  }
}
