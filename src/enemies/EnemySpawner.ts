import { Vector2D } from '../utils/Vector2D';
import { Enemy, EnemyType } from './Enemy';
import { TILE_SIZE } from '../config/Constants';

export class EnemySpawner {
  public static spawnEnemies(
    spawnPoints: Vector2D[],
    levelIndex: number
  ): Enemy[] {
    const enemies: Enemy[] = [];
    if (spawnPoints.length === 0) return enemies;

    const types = [
      EnemyType.CHASER,
      EnemyType.INTERCEPTOR,
      EnemyType.BLOCKER,
      EnemyType.SCOUT,
      EnemyType.HEAVY
    ];

    const speedMultiplier = 1.0 + levelIndex * 0.04;

    for (let i = 0; i < spawnPoints.length; i++) {
      const tile = spawnPoints[i];
      const worldX = tile.x * TILE_SIZE + TILE_SIZE / 2;
      const worldY = tile.y * TILE_SIZE + TILE_SIZE / 2;

      // Elegir tipo según el nivel
      let type: EnemyType;
      if (levelIndex < 3) {
        type = EnemyType.CHASER;
      } else if (levelIndex < 6) {
        type = types[i % 3]; // CHASER, INTERCEPTOR, BLOCKER
      } else {
        type = types[i % types.length];
      }

      enemies.push(new Enemy(worldX, worldY, type, speedMultiplier));
    }

    return enemies;
  }
}
