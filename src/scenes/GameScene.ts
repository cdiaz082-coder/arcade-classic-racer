import { Scene } from './Scene';
import { Tilemap } from '../levels/Tilemap';
import { LevelGenerator } from '../levels/LevelGenerator';
import { Player } from '../player/Player';
import { Enemy } from '../enemies/Enemy';
import { EnemySpawner } from '../enemies/EnemySpawner';
import { Item, ItemType } from '../items/Item';
import { ItemSpawner } from '../items/ItemSpawner';
import { OilSlick } from '../items/OilSlick';
import { Camera } from '../camera/Camera';
import { HUD } from '../ui/HUD';
import { Minimap } from '../ui/Minimap';
import { AudioManager } from '../audio/AudioManager';
import { CollisionDetector } from '../physics/CollisionDetector';
import { InputManager } from '../input/InputManager';
import { VehicleFactory } from '../vehicles/VehicleFactory';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  INITIAL_LIVES,
  OIL_SLICK_SLIP_TIME
} from '../config/Constants';
import { Vector2D } from '../utils/Vector2D';
import { SceneManager } from '../core/SceneManager';
import { ContinueScene } from './ContinueScene';

export class GameScene implements Scene {
  private levelIndex: number = 1;
  private score: number = 0;
  private lives: number = INITIAL_LIVES;

  private tilemap!: Tilemap;
  private player!: Player;
  private enemies: Enemy[] = [];
  private items: Item[] = [];
  private oilSlicks: OilSlick[] = [];
  private camera!: Camera;
  private hud: HUD = new HUD();
  private minimap: Minimap = new Minimap();

  private exitUnlocked: boolean = false;
  private exitPos: Vector2D = new Vector2D(0, 0);
  private isPaused: boolean = false;
  private wasPausePressed: boolean = false;
  private gameOver: boolean = false;
  private levelComplete: boolean = false;
  private completeTimer: number = 0;

  /** true si venimos de Continue (conservar score/nivel) */
  private resumeFromContinue: boolean = false;

  constructor(score: number = 0, levelIndex: number = 1, fromContinue: boolean = false) {
    this.score = score;
    this.levelIndex = levelIndex;
    this.resumeFromContinue = fromContinue;
  }

  public init(): void {
    if (!this.resumeFromContinue) {
      this.lives = INITIAL_LIVES;
      this.score = 0;
      this.levelIndex = 1;
    } else {
      // Al continuar se da 1 vida extra (estilo arcade)
      this.lives = 1;
    }
    this.gameOver = false;
    this.levelComplete = false;
    this.loadLevel(this.levelIndex);
  }

  private loadLevel(index: number): void {
    const levelData = LevelGenerator.generate(index);

    this.tilemap = levelData.tilemap;
    this.exitPos = levelData.exitPoint;
    this.exitUnlocked = false;
    this.oilSlicks = [];
    this.levelComplete = false;
    this.completeTimer = 0;

    // playerSpawn ya viene en coordenadas de mundo
    const stats = VehicleFactory.getVehicleById('STREET_CRUISER');

    if (!this.player) {
      this.player = new Player(
        levelData.playerSpawn.x,
        levelData.playerSpawn.y,
        stats
      );
    } else {
      this.player.position = levelData.playerSpawn.clone();
      this.player.velocity = new Vector2D(0, 0);
      this.player.angle = 0;
      this.player.refillOil();
      this.player.invulnerable = false;
      this.player.isSpinningOut = false;
    }

    this.camera = new Camera(CANVAS_WIDTH, CANVAS_HEIGHT, 1.8);
this.camera.setBounds(this.tilemap.getWidth(), this.tilemap.getHeight());
this.camera.followWithSpeed(this.player.position.x, this.player.position.y, 0, this.player.maxSpeed, 1);
    
    // enemySpawns están en coordenadas de tiles
    this.enemies = EnemySpawner.spawnEnemies(levelData.enemySpawns, index);

    // objectives están en coordenadas de tiles → ItemSpawner los convierte
    this.items = ItemSpawner.spawnItems(levelData.objectives, index);
  }

  public update(dt: number): void {
    if (this.levelComplete) {
      this.completeTimer += dt;
      if (this.completeTimer > 1.8) {
        this.levelIndex++;
        this.loadLevel(this.levelIndex);
      }
      return;
    }

    const input = InputManager.getInstance();

    // Toggle pausa (evitar repetición por mantener pulsado)
    const pauseNow = input.isPausePressed();
    if (pauseNow && !this.wasPausePressed) {
      this.isPaused = !this.isPaused;
    }
    this.wasPausePressed = pauseNow;

    if (this.isPaused) return;

    // Input del jugador
    const throttle = input.getThrottle();
    const steering = input.getSteering();

    this.player.update(dt, throttle, steering, this.tilemap);

    // Soltar mancha de aceite
    if (input.isOilPressed() && this.player.useOil()) {
      this.oilSlicks.push(
        new OilSlick(this.player.position.x, this.player.position.y)
      );
      AudioManager.getInstance().playOilSound();
    }

    this.camera.followWithSpeed(
      this.player.position.x, 
      this.player.position.y, 
      this.player.speed || 0, 
      this.player.maxSpeed || 10
    );
    
    
    // Actualizar manchas de aceite
    for (let i = this.oilSlicks.length - 1; i >= 0; i--) {
      this.oilSlicks[i].update(dt);
      if (!this.oilSlicks[i].active) {
        this.oilSlicks.splice(i, 1);
      }
    }

    // Enemigos
    for (const enemy of this.enemies) {
      if (!enemy.isAlive) continue;

      enemy.update(dt, this.player, this.tilemap);

      // ¿Pisó aceite?
      for (const slick of this.oilSlicks) {
        if (slick.active && slick.contains(enemy.position.x, enemy.position.y)) {
          enemy.triggerSpinout(OIL_SLICK_SLIP_TIME);
        }
      }

      // Colisión con jugador
      if (
        CollisionDetector.checkCircleCollision(
          this.player.position,
          this.player.radius,
          enemy.position,
          enemy.radius
        )
      ) {
        if (!this.player.invulnerable && !this.player.isSpinningOut) {
          this.handleDeath();
          return;
        }
      }
    }

    // Items
    let remainingFlags = 0;
    for (const item of this.items) {
      if (item.collected) continue;

      item.update(dt);

      if (item.type === ItemType.FLAG) {
        remainingFlags++;
      }

      if (
        CollisionDetector.checkCircleCollision(
          this.player.position,
          this.player.radius,
          item.position,
          item.radius
        )
      ) {
        item.collected = true;
        this.applyItemEffect(item);
      }
    }

    if (remainingFlags === 0) {
      this.exitUnlocked = true;
    }

    // Llegar a la salida
    if (this.exitUnlocked) {
      const distToExit = this.player.position.distanceTo(this.exitPos);
      if (distToExit < 40) {
        this.levelComplete = true;
        this.completeTimer = 0;
        this.score += 500 + this.levelIndex * 100;
        AudioManager.getInstance().playPickupSound();
      }
    }
  }

  private applyItemEffect(item: Item): void {
    switch (item.type) {
      case ItemType.FLAG:
        this.score += 100;
        AudioManager.getInstance().playPickupSound();
        break;
      case ItemType.OIL_REFILL:
        this.player.refillOil(3);
        this.score += 50;
        AudioManager.getInstance().playPickupSound();
        break;
      case ItemType.INVULNERABILITY:
        this.player.activateInvulnerability();
        this.score += 75;
        AudioManager.getInstance().playPickupSound();
        break;
      case ItemType.EXTRA_LIFE:
        this.lives++;
        this.score += 200;
        AudioManager.getInstance().playPickupSound();
        break;
    }
  }

  private handleDeath(): void {
    AudioManager.getInstance().playCollisionSound();
    this.lives--;

    if (this.lives > 0) {
      // Reiniciar nivel actual con invulnerabilidad breve
      this.loadLevel(this.levelIndex);
      this.player.activateInvulnerability(2000);
    } else {
      // Sin vidas → pantalla CONTINUE (estilo arcade)
      SceneManager.getInstance().changeScene(
        new ContinueScene(this.score, this.levelIndex)
      );
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    // Fondo
    ctx.fillStyle = '#0a0b0e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Mundo
    this.tilemap.render(ctx, this.camera);

    for (const slick of this.oilSlicks) {
      slick.render(ctx, this.camera);
    }
    for (const item of this.items) {
      item.render(ctx, this.camera);
    }
    for (const enemy of this.enemies) {
      enemy.render(ctx, this.camera);
    }
    this.player.render(ctx, this.camera);

    // UI
    const remainingFlags = this.items.filter(
      (i) => !i.collected && i.type === ItemType.FLAG
    ).length;

    this.hud.render(
      ctx,
      this.player,
      this.score,
      this.lives,
      remainingFlags,
      this.levelIndex,
      CANVAS_WIDTH
    );

    this.minimap.render(
      ctx,
      this.tilemap,
      this.player,
      this.enemies,
      this.items,
      this.exitPos,
      this.exitUnlocked,
      CANVAS_WIDTH
    );

    InputManager.getInstance().renderTouchOverlay(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Overlays de estado
    if (this.isPaused) {
      this.drawCenteredMessage(ctx, 'PAUSA', 'Presiona P para continuar');
    } else if (this.levelComplete) {
      this.drawCenteredMessage(ctx, '¡NIVEL COMPLETADO!', `+${500 + this.levelIndex * 100} pts`);
    } else if (this.gameOver) {
      this.drawCenteredMessage(ctx, 'GAME OVER', `Puntuación: ${this.score}`);
    }
  }

  private drawCenteredMessage(ctx: CanvasRenderingContext2D, title: string, subtitle: string): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    ctx.fillStyle = '#f1c40f';
    ctx.font = '22px sans-serif';
    ctx.fillText(subtitle, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
    ctx.restore();
  }
}
