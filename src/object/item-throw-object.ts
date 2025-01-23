import { DEPTH } from '../enums/depth';
import { DIRECTION } from '../enums/direction';
import { OBJECT } from '../enums/object-type';
import { TEXTURE } from '../enums/texture';
import { OverworldManager } from '../managers';
import { InGameScene } from '../scenes/ingame-scene';
import { BaseObject, TILE_SIZE, MAP_SCALE } from './base-object';

export class ItemThrowObject extends BaseObject {
  private readonly maxDistance: number = 10;
  private map: Phaser.Tilemaps.Tilemap;
  private direction: DIRECTION;
  private currentDistance: number = 0;
  private speed: number = 20; //20ms당 1 tile임.

  constructor(scene: InGameScene, direction: DIRECTION, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, pokeball: number) {
    super(scene, texture, x, y, '', OBJECT.ITEM_THROW);
    this.map = map;
    this.direction = direction;

    this.move();

    this.setScale(1.5);
    this.setSpriteFrame(pokeball);
    this.setDepth(DEPTH.OVERWORLD_UI);
  }

  move() {
    const directionVector = this.getDirectionVector();

    if (!directionVector) {
      return;
    }

    const moveStep = () => {
      if (this.currentDistance >= this.maxDistance || this.hasBlockingTile(this.getNextPosition(directionVector)) || this.hasPokemon(this.getNextPosition(directionVector))) {
        this.destroy();
        return;
      }

      this.setTilePos(this.getNextPosition(directionVector));
      this.setPosition(this.getNextPixelPosition());

      this.currentDistance++;
      this.getScene().time.delayedCall(this.speed, moveStep);
    };

    moveStep();
  }

  private getDirectionVector(): Phaser.Math.Vector2 | null {
    switch (this.direction) {
      case DIRECTION.UP:
        return new Phaser.Math.Vector2(0, -1);
      case DIRECTION.DOWN:
        return new Phaser.Math.Vector2(0, 1);
      case DIRECTION.LEFT:
        return new Phaser.Math.Vector2(-1, 0);
      case DIRECTION.RIGHT:
        return new Phaser.Math.Vector2(1, 0);
      default:
        return null;
    }
  }

  private getNextPosition(directionVector: Phaser.Math.Vector2): Phaser.Math.Vector2 {
    return this.getTilePos().clone().add(directionVector);
  }

  private getNextPixelPosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.getTilePos().x * TILE_SIZE * MAP_SCALE + (TILE_SIZE / 2) * MAP_SCALE, this.getTilePos().y * TILE_SIZE * MAP_SCALE + TILE_SIZE * MAP_SCALE);
  }

  private hasBlockingTile(pos: Phaser.Math.Vector2): boolean {
    return this.map.layers.some((layer) => {
      const tile = this.map.getTileAt(pos.x, pos.y, false, layer.name);
      return tile && tile.properties.collides;
    });
  }

  private hasPokemon(pos: Phaser.Math.Vector2): boolean {
    const overworldManager = OverworldManager.getInstance();
    const pokemons = overworldManager.getOverworldPokemons();

    for (const pokemon of pokemons) {
      if (pokemon.getPosition().x === this.getPosition().x && pokemon.getPosition().y === this.getPosition().y) {
        pokemon.capture();
        pokemon.stopMovement();
        return true;
      }
    }

    return false;
  }
}
