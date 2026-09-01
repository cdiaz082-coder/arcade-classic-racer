/**
 * AssetManager mejorado.
 * Actualmente el juego dibuja todo con primitivas de Canvas.
 * Esta clase queda lista para cargar sprites reales cuando los tengas.
 */
export class AssetManager {
  private static instance: AssetManager;
  private images: Map<string, HTMLImageElement> = new Map();
  private loaded: boolean = false;
  private loadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Carga todos los assets.
   * Por ahora no hay imágenes reales, pero la arquitectura está lista.
   * Cuando tengas sprites, agrégalos en el array `assetsToLoad`.
   */
  public async loadAll(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise(async (resolve) => {
      // Ejemplo de cómo cargar sprites reales en el futuro:
      // const assetsToLoad = [
      //   { key: 'player_car', src: '/assets/sprites/player.png' },
      //   { key: 'enemy_chaser', src: '/assets/sprites/enemy_red.png' },
      //   { key: 'flag', src: '/assets/sprites/flag.png' },
      // ];
      //
      // await Promise.all(assetsToLoad.map(a => this.loadImage(a.key, a.src)));

      this.loaded = true;
      resolve();
    });

    return this.loadPromise;
  }

  private loadImage(key: string, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images.set(key, img);
        resolve();
      };
      img.onerror = () => reject(new Error(`No se pudo cargar: ${src}`));
      img.src = src;
    });
  }

  public isLoaded(): boolean {
    return this.loaded;
  }

  public getImage(key: string): HTMLImageElement | undefined {
    return this.images.get(key);
  }
}
