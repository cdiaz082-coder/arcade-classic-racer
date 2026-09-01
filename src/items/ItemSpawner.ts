import { Vector2D } from '../utils/Vector2D';
import { Item, ItemType } from './Item';
import { TILE_SIZE } from '../config/Constants';

export class ItemSpawner {
  public static spawnItems(objectivePoints: Vector2D[], levelIndex: number): Item[] {
    const items: Item[] = [];

    // 1. Crear Banderas (Objetivos principales obligatorios)
    for (const point of objectivePoints) {
      const x = point.x * TILE_SIZE + TILE_SIZE / 2;
      const y = point.y * TILE_SIZE + TILE_SIZE / 2;
      items.push(new Item(x, y, ItemType.FLAG));
    }

    // 2. Generar Power-ups aleatorios en ubicaciones derivadas
    const extraItemsCount = Math.min(5, 1 + Math.floor(levelIndex * 0.3));
    for (let i = 0; i < extraItemsCount && objectivePoints.length > 0; i++) {
      const basePoint = objectivePoints[i % objectivePoints.length];
      const offsetX = (i % 2 === 0 ? 1 : -1) * TILE_SIZE;
      const offsetY = (i % 3 === 0 ? 1 : -1) * TILE_SIZE;

      const x = basePoint.x * TILE_SIZE + TILE_SIZE / 2 + offsetX;
      const y = basePoint.y * TILE_SIZE + TILE_SIZE / 2 + offsetY;

      // Seleccionar tipo de Power-up según probabilidades
      const rand = Math.random();
      let type = ItemType.OIL_REFILL;
      if (rand > 0.65) type = ItemType.INVULNERABILITY;
      if (rand > 0.90) type = ItemType.EXTRA_LIFE;

      items.push(new Item(x, y, type));
    }

    return items;
  }
}
