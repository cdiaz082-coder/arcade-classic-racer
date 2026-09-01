export interface Scene {
  init(): void;
  update(dt: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  destroy?(): void;
}
