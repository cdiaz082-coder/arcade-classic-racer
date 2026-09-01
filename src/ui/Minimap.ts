import { Tilemap, TileType } from '../levels/Tilemap';
import { Player } from '../player/Player';
import { Enemy } from '../enemies/Enemy';
import { Item, ItemType } from '../items/Item';
import { Vector2D } from '../utils/Vector2D';
import { TILE_SIZE } from '../config/Constants';

export class Minimap {
  private size: number = 140;

  public render(
    ctx: CanvasRenderingContext2D,
    tilemap: Tilemap,
    player: Player,
    enemies: Enemy[],
    items: Item[],
    exitPos: Vector2D,
    exitUnlocked: boolean,
    screenWidth: number
  ): void {
    ctx.save();

    const padding = 15;
    const mapX = screenWidth - this.size - padding;
    const mapY = 65;

    ctx.fillStyle = 'rgba(10, 15, 20, 0.85)';
    ctx.fillRect(mapX, mapY, this.size, this.size);
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    ctx.strokeRect(mapX, mapY, this.size, this.size);

    const scaleX = this.size / tilemap.getWidth();
    const scaleY = this.size / tilemap.getHeight();

    // Caminos
    ctx.fillStyle = '#2c3e50';
    for (let r = 0; r < tilemap.rows; r++) {
      for (let c = 0; c < tilemap.cols; c++) {
        if (tilemap.tiles[r][c] !== TileType.WALL) {
          ctx.fillRect(
            mapX + c * TILE_SIZE * scaleX,
            mapY + r * TILE_SIZE * scaleY,
            Math.max(2, TILE_SIZE * scaleX),
            Math.max(2, TILE_SIZE * scaleY)
          );
        }
      }
    }

    // Objetivos (banderas)
    ctx.fillStyle = '#f1c40f';
    for (const item of items) {
      if (!item.collected && item.type === ItemType.FLAG) {
        ctx.fillRect(
          mapX + item.position.x * scaleX - 2,
          mapY + item.position.y * scaleY - 2,
          5,
          5
        );
      }
    }

    // Salida (exitPos ya viene en coordenadas de mundo)
    if (exitUnlocked) {
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(
        mapX + exitPos.x * scaleX - 3,
        mapY + exitPos.y * scaleY - 3,
        7,
        7
      );
    }

    // Enemigos
    ctx.fillStyle = '#e74c3c';
    for (const enemy of enemies) {
      if (!enemy.isAlive) continue;
      ctx.fillRect(
        mapX + enemy.position.x * scaleX - 2,
        mapY + enemy.position.y * scaleY - 2,
        4,
        4
      );
    }

    // Jugador
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(
      mapX + player.position.x * scaleX,
      mapY + player.position.y * scaleY,
      3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
}
