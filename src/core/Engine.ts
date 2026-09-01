import { GameLoop } from './GameLoop';
import { SceneManager } from './SceneManager';
import { MenuScene } from '../scenes/MenuScene';
import { AudioManager } from '../audio/AudioManager';
import { AssetManager } from '../assets/AssetManager';
import { SaveManager } from '../save/SaveManager';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config/Constants';

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameLoop: GameLoop;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.canvas.id = 'game-canvas';
      document.body.appendChild(this.canvas);
    }

    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('No se pudo inicializar el contexto Canvas 2D');
    }
    this.ctx = context;

    this.setupResize();

    // Cargar preferencias de audio
    const save = SaveManager.load();
    AudioManager.getInstance().init(save.soundVolume, save.musicVolume);

    // Preparar assets (aunque por ahora son sintéticos)
    AssetManager.getInstance().loadAll();

    // Escena inicial
    const sceneManager = SceneManager.getInstance();
    sceneManager.changeScene(new MenuScene());

    this.gameLoop = new GameLoop(
      (dt: number) => sceneManager.update(dt),
      () => {
        // Limpiar cada frame
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        sceneManager.render(this.ctx);
      }
    );
  }

  public start(): void {
    this.gameLoop.start();
  }

  private setupResize(): void {
    const resize = () => {
      const scale = Math.min(
        window.innerWidth / CANVAS_WIDTH,
        window.innerHeight / CANVAS_HEIGHT
      );
      this.canvas.style.width = `${CANVAS_WIDTH * scale}px`;
      this.canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
      this.canvas.style.position = 'absolute';
      this.canvas.style.left = `${(window.innerWidth - CANVAS_WIDTH * scale) / 2}px`;
      this.canvas.style.top = `${(window.innerHeight - CANVAS_HEIGHT * scale) / 2}px`;
    };

    window.addEventListener('resize', resize);
    resize();
  }
}
