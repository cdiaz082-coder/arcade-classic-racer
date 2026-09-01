import { TILE_SIZE } from '../config/Constants';
import { Camera } from '../camera/Camera';

export enum TileType {
  EMPTY = 0,
  WALL = 1,
  ROAD = 2,
  START = 3,
  EXIT = 4
}

export class Tilemap {
  public cols: number;
  public rows: number;
  public tiles: number[][];

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.tiles = Array.from({ length: rows }, () => Array(cols).fill(TileType.WALL));
  }

  public getWidth(): number {
    return this.cols * TILE_SIZE;
  }

  public getHeight(): number {
    return this.rows * TILE_SIZE;
  }

  public getTile(col: number, row: number): number {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return TileType.WALL;
    }
    return this.tiles[row][col];
  }

  public setTile(col: number, row: number, type: TileType): void {
    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      this.tiles[row][col] = type;
    }
  }

  public isSolid(col: number, row: number): boolean {
    return this.getTile(col, row) === TileType.WALL;
  }

  public isSolidAtWorldPos(x: number, y: number): boolean {
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    return this.isSolid(col, row);
  }

  public render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const startCol = Math.max(0, Math.floor(camera.position.x / TILE_SIZE));
    const endCol = Math.min(this.cols, Math.ceil((camera.position.x + camera.viewportWidth) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(camera.position.y / TILE_SIZE));
    const endRow = Math.min(this.rows, Math.ceil((camera.position.y + camera.viewportHeight) / TILE_SIZE));

    for (let r = startRow; r < endRow; r++) {
      for (let c = startCol; c < endCol; c++) {
        const tile = this.tiles[r][c];
        const screenPos = camera.worldToScreen(c * TILE_SIZE, r * TILE_SIZE);

        if (tile === TileType.WALL) {
          ctx.fillStyle = '#1c232d';
          ctx.fillRect(screenPos.x, screenPos.y, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#12171f';
          ctx.strokeRect(screenPos.x, screenPos.y, TILE_SIZE, TILE_SIZE);
        } else if (tile === TileType.ROAD || tile === TileType.START) {
          ctx.fillStyle = '#2c3e50';
          ctx.fillRect(screenPos.x, screenPos.y, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#34495e';
          ctx.lineWidth = 1;
          ctx.strokeRect(screenPos.x, screenPos.y, TILE_SIZE, TILE_SIZE);
        } else if (tile === TileType.EXIT) {
          ctx.fillStyle = '#27ae60';
          ctx.fillRect(screenPos.x, screenPos.y, TILE_SIZE, TILE_SIZE);
          // Patrón de meta
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(screenPos.x + 8, screenPos.y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
        }
      }
    }
  }
}
