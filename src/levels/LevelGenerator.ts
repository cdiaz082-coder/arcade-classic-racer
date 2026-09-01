import { ProceduralGenerator, LevelData as ProcLevelData } from './ProceduralGenerator';
import { Tilemap } from './Tilemap';
import { Vector2D } from '../utils/Vector2D';

/**
 * Interfaz unificada que espera GameScene.
 * Actúa como adaptador sobre ProceduralGenerator.
 */
export interface LevelData {
  tilemap: Tilemap;
  playerSpawn: Vector2D;
  enemySpawns: Vector2D[];
  objectives: Vector2D[];
  exitPoint: Vector2D;
}

export class LevelGenerator {
  /**
   * Genera un nivel y lo adapta a la interfaz que usan las escenas.
   */
  public static generate(levelIndex: number): LevelData {
    const raw: ProcLevelData = ProceduralGenerator.generate(levelIndex);

    return {
      tilemap: raw.tilemap,
      playerSpawn: raw.playerSpawn,
      enemySpawns: raw.enemySpawnPoints,
      objectives: raw.objectivePoints,
      exitPoint: raw.exitPos
    };
  }
}
