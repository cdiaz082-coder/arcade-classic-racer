import { STORAGE_KEYS } from '../config/Constants';

export interface SaveData {
  highScore: number;
  unlockedLevels: number;
  unlockedVehicles: string[];
  selectedVehicleId: string;
  credits: number;
  soundVolume: number;
  musicVolume: number;
}

export class SaveManager {
  private static defaultData: SaveData = {
    highScore: 0,
    unlockedLevels: 1,
    unlockedVehicles: ['STREET_CRUISER'],
    selectedVehicleId: 'STREET_CRUISER',
    credits: 0,
    soundVolume: 0.8,
    musicVolume: 0.5
  };

  public static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVE_DATA);
      if (!raw) return { ...this.defaultData };
      const parsed = JSON.parse(raw);
      return { ...this.defaultData, ...parsed };
    } catch (e) {
      console.warn('Error al cargar guardado local, usando defaults.', e);
      return { ...this.defaultData };
    }
  }

  public static save(data: SaveData): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SAVE_DATA, JSON.stringify(data));
    } catch (e) {
      console.error('Error al guardar datos.', e);
    }
  }

  public static reset(): SaveData {
    this.save({ ...this.defaultData });
    return { ...this.defaultData };
  }

  // --- High Score (estilo arcade) ---

  public static getHighScore(): number {
    return this.load().highScore;
  }

  /**
   * Guarda la puntuación si es récord.
   * @returns true si es un nuevo récord.
   */
  public static saveHighScore(score: number): boolean {
    const data = this.load();
    if (score > data.highScore) {
      data.highScore = score;
      this.save(data);
      return true;
    }
    return false;
  }
}

