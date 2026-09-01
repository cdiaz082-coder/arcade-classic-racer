import { Vector2D } from '../utils/Vector2D';
import { Tilemap, TileType } from './Tilemap';
import { TILE_SIZE, MIN_OBJECTIVE_DISTANCE, MIN_EXIT_DISTANCE } from '../config/Constants';

export interface LevelData {
  tilemap: Tilemap;
  playerSpawn: Vector2D;       // Posición en mundo (píxeles)
  exitPos: Vector2D;           // Posición en mundo
  objectivePoints: Vector2D[]; // Coordenadas en tiles
  enemySpawnPoints: Vector2D[]; // Coordenadas en tiles
}

export class ProceduralGenerator {
  /**
   * Genera un nivel procedural con caminos conectados (BFS),
   * puntos de objetivo y salida con distancias mínimas.
   */
  public static generate(levelIndex: number): LevelData {
    // Tamaño base aumenta ligeramente con el nivel
    const baseSize = 18 + Math.floor(levelIndex * 0.6);
    const cols = Math.min(32, baseSize + (levelIndex % 3));
    const rows = Math.min(28, baseSize - 2 + (levelIndex % 2));

    const tilemap = new Tilemap(cols, rows);

    // 1. Crear un laberinto simple de caminos
    this.carveRoads(tilemap, cols, rows, levelIndex);

    // 2. Encontrar casillas de camino válidas
    const roadTiles: Vector2D[] = [];
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if (tilemap.getTile(c, r) === TileType.ROAD) {
          roadTiles.push(new Vector2D(c, r));
        }
      }
    }

    if (roadTiles.length < 10) {
      // Fallback de seguridad
      return this.generateFallback(cols, rows);
    }

    // 3. Elegir spawn del jugador (cerca de una esquina)
    const spawnTile = this.pickSpawn(roadTiles, cols, rows);
    tilemap.setTile(spawnTile.x, spawnTile.y, TileType.START);

    // 4. Elegir salida lo más lejos posible del spawn
    const exitTile = this.pickFarthest(roadTiles, spawnTile, MIN_EXIT_DISTANCE);
    tilemap.setTile(exitTile.x, exitTile.y, TileType.EXIT);

    // 5. Elegir objetivos (banderas) con distancia mínima
    const numObjectives = Math.min(6, 2 + Math.floor(levelIndex / 3));
    const objectivePoints = this.pickObjectives(
      roadTiles,
      spawnTile,
      exitTile,
      numObjectives,
      MIN_OBJECTIVE_DISTANCE
    );

    // 6. Puntos de spawn de enemigos (lejos del jugador)
    const enemyCount = Math.min(8, 2 + Math.floor(levelIndex * 0.5));
    const enemySpawnPoints = this.pickEnemySpawns(roadTiles, spawnTile, enemyCount, 5);

    return {
      tilemap,
      playerSpawn: new Vector2D(
        spawnTile.x * TILE_SIZE + TILE_SIZE / 2,
        spawnTile.y * TILE_SIZE + TILE_SIZE / 2
      ),
      exitPos: new Vector2D(
        exitTile.x * TILE_SIZE + TILE_SIZE / 2,
        exitTile.y * TILE_SIZE + TILE_SIZE / 2
      ),
      objectivePoints,
      enemySpawnPoints
    };
  }

  private static carveRoads(tilemap: Tilemap, cols: number, rows: number, seed: number): void {
    // Inicializar todo como pared
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        tilemap.setTile(c, r, TileType.WALL);
      }
    }

    // Algoritmo simple de recursive backtracker + pasillos extra
    const stack: Vector2D[] = [];
    const start = new Vector2D(1, 1);
    tilemap.setTile(start.x, start.y, TileType.ROAD);
    stack.push(start);

    const dirs = [
      new Vector2D(0, -2),
      new Vector2D(0, 2),
      new Vector2D(-2, 0),
      new Vector2D(2, 0)
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      // Mezclar direcciones
      const shuffled = [...dirs].sort(() => Math.random() - 0.5);
      let carved = false;

      for (const d of shuffled) {
        const nx = current.x + d.x;
        const ny = current.y + d.y;

        if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1) {
          if (tilemap.getTile(nx, ny) === TileType.WALL) {
            // Abrir el pasillo intermedio y la celda destino
            tilemap.setTile(current.x + d.x / 2, current.y + d.y / 2, TileType.ROAD);
            tilemap.setTile(nx, ny, TileType.ROAD);
            stack.push(new Vector2D(nx, ny));
            carved = true;
            break;
          }
        }
      }

      if (!carved) {
        stack.pop();
      }
    }

    // Agregar algunos pasillos horizontales/verticales extra para más conectividad
    const extraPassages = 4 + (seed % 5);
    for (let i = 0; i < extraPassages; i++) {
      const c = 2 + Math.floor(Math.random() * (cols - 4));
      const r = 2 + Math.floor(Math.random() * (rows - 4));
      if (Math.random() > 0.5) {
        for (let k = 0; k < 4; k++) {
          if (c + k < cols - 1) tilemap.setTile(c + k, r, TileType.ROAD);
        }
      } else {
        for (let k = 0; k < 4; k++) {
          if (r + k < rows - 1) tilemap.setTile(c, r + k, TileType.ROAD);
        }
      }
    }
  }

  private static pickSpawn(roadTiles: Vector2D[], cols: number, rows: number): Vector2D {
    // Preferir esquinas
    const corners = roadTiles.filter(t =>
      (t.x < cols * 0.3 || t.x > cols * 0.7) &&
      (t.y < rows * 0.3 || t.y > rows * 0.7)
    );
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }
    return roadTiles[Math.floor(Math.random() * roadTiles.length)];
  }

  private static pickFarthest(roadTiles: Vector2D[], from: Vector2D, minDist: number): Vector2D {
    let best = roadTiles[0];
    let bestDist = 0;

    for (const t of roadTiles) {
      const d = Math.abs(t.x - from.x) + Math.abs(t.y - from.y); // Manhattan
      if (d >= minDist && d > bestDist) {
        bestDist = d;
        best = t;
      }
    }
    return best;
  }

  private static pickObjectives(
    roadTiles: Vector2D[],
    spawn: Vector2D,
    exit: Vector2D,
    count: number,
    minDist: number
  ): Vector2D[] {
    const result: Vector2D[] = [];
    const used = new Set<string>();
    used.add(`${spawn.x},${spawn.y}`);
    used.add(`${exit.x},${exit.y}`);

    const candidates = [...roadTiles].sort(() => Math.random() - 0.5);

    for (const t of candidates) {
      if (result.length >= count) break;
      const key = `${t.x},${t.y}`;
      if (used.has(key)) continue;

      const distSpawn = Math.abs(t.x - spawn.x) + Math.abs(t.y - spawn.y);
      const distExit = Math.abs(t.x - exit.x) + Math.abs(t.y - exit.y);

      if (distSpawn >= minDist && distExit >= 3) {
        result.push(t);
        used.add(key);
      }
    }

    // Si no alcanzó la cantidad, rellenar
    while (result.length < count && candidates.length > 0) {
      const t = candidates.pop()!;
      const key = `${t.x},${t.y}`;
      if (!used.has(key)) {
        result.push(t);
        used.add(key);
      }
    }

    return result;
  }

  private static pickEnemySpawns(
    roadTiles: Vector2D[],
    spawn: Vector2D,
    count: number,
    minDist: number
  ): Vector2D[] {
    const result: Vector2D[] = [];
    const candidates = roadTiles
      .filter(t => Math.abs(t.x - spawn.x) + Math.abs(t.y - spawn.y) >= minDist)
      .sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(count, candidates.length); i++) {
      result.push(candidates[i]);
    }
    return result;
  }

  private static generateFallback(cols: number, rows: number): LevelData {
    const tilemap = new Tilemap(cols, rows);
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        tilemap.setTile(c, r, TileType.ROAD);
      }
    }
    tilemap.setTile(2, 2, TileType.START);
    tilemap.setTile(cols - 3, rows - 3, TileType.EXIT);

    return {
      tilemap,
      playerSpawn: new Vector2D(2 * TILE_SIZE + TILE_SIZE / 2, 2 * TILE_SIZE + TILE_SIZE / 2),
      exitPos: new Vector2D((cols - 3) * TILE_SIZE + TILE_SIZE / 2, (rows - 3) * TILE_SIZE + TILE_SIZE / 2),
      objectivePoints: [new Vector2D(Math.floor(cols / 2), Math.floor(rows / 2))],
      enemySpawnPoints: [new Vector2D(cols - 4, 4)]
    };
  }
}
