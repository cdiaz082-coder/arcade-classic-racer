export class GameLoop {
  private lastTime: number = 0;
  private running: boolean = false;
  private updateFn: (dt: number) => void;
  private renderFn: () => void;
  private rafId: number = 0;

  constructor(updateFn: (dt: number) => void, renderFn: () => void) {
    this.updateFn = updateFn;
    this.renderFn = renderFn;
  }

  public start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  public stop(): void {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
  }

  private loop(currentTime: number): void {
    if (!this.running) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Evita saltos grandes por lag o cambio de pestaña
    if (dt > 0.1) dt = 0.1;

    this.updateFn(dt);
    this.renderFn();

    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }
}
