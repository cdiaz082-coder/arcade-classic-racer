import { Scene } from '../scenes/Scene';

export class SceneManager {
  private static instance: SceneManager;
  private currentScene: Scene | null = null;

  private constructor() {}

  public static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  public changeScene(newScene: Scene): void {
    if (this.currentScene && this.currentScene.destroy) {
      this.currentScene.destroy();
    }
    this.currentScene = newScene;
    this.currentScene.init();
  }

  public update(dt: number): void {
    if (this.currentScene) {
      this.currentScene.update(dt);
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.currentScene) {
      this.currentScene.render(ctx);
    }
  }
}
