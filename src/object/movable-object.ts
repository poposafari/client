import { ANIMATION } from '../enums/animation';
import { DIRECTION } from '../enums/direction';
import { OBJECT } from '../enums/object-type';
import { POKEMON_STATUS } from '../enums/pokemon-status';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldInfo } from '../storage/overworld-info';
import { PlayerInfo } from '../storage/player-info';
import { BaseObject, MAP_SCALE, TILE_SIZE } from './base-object';

const Vector2 = Phaser.Math.Vector2;

interface MovementQueue {
  direction: DIRECTION;
  animationKey: ANIMATION | string;
}

export class MovableObject extends BaseObject {
  private step: number = 0;
  private stepSpeed: number = 2;
  protected currentDirection: DIRECTION = DIRECTION.NONE;
  private lastDirection: DIRECTION = DIRECTION.DOWN;
  private tileSizePixelsWalked: number = 0;
  private pixelsToWalkThisUpdate: number = 0;
  private smoothFrameNumbers: number[] = [];
  private movementFinish: boolean = true;
  protected movementStop: boolean = true;
  private movementDirectionQueue: Array<MovementQueue> = [];
  protected map: Phaser.Tilemaps.Tilemap;
  protected overworldInfo: OverworldInfo;

  private movementDirection: {
    [key in DIRECTION]?: Phaser.Math.Vector2;
  } = {
    [DIRECTION.UP]: Vector2.UP,
    [DIRECTION.DOWN]: Vector2.DOWN,
    [DIRECTION.LEFT]: Vector2.LEFT,
    [DIRECTION.RIGHT]: Vector2.RIGHT,
  };

  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap | null, nickname: string, overworldInfo: OverworldInfo, objectType: OBJECT) {
    super(scene, texture, x, y, nickname, objectType);
    this.map = map!;

    this.overworldInfo = overworldInfo;

    this.stopAnmation(3);

    if (this.getType() === OBJECT.POKEMON) {
      this.startAnmation(`${texture}_down`);
    }
  }

  process(direction: DIRECTION, animationKey: ANIMATION | string) {
    if (this.isMoving()) return;
    this.pixelsToWalkThisUpdate = this.stepSpeed;
    this.currentDirection = direction;
    this.startAnmation(animationKey);
    this.setTilePos(this.getTilePos().add(this.movementDirection[this.currentDirection]!));
  }

  processStop() {
    this.currentDirection = DIRECTION.NONE;
  }

  getMovementDirectionQueue() {
    return this.movementDirectionQueue;
  }

  private willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate: number): boolean {
    return this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= TILE_SIZE * MAP_SCALE;
  }

  private moveSprite(pixelsToWalkThisUpdate: number) {
    const directionVector = this.movementDirection[this.currentDirection]!.clone();
    const movement = directionVector.scale(pixelsToWalkThisUpdate);
    const currentPos = this.getPosition();
    const newPosition = currentPos.add(movement);

    this.setPosition(newPosition);
    this.tileSizePixelsWalked += pixelsToWalkThisUpdate;
    this.tileSizePixelsWalked %= 32 * MAP_SCALE;

    if (this.tileSizePixelsWalked >= TILE_SIZE * MAP_SCALE) {
      const targetTilePos = this.getTilePos();
      this.setPosition(targetTilePos.scale(TILE_SIZE * MAP_SCALE));
      this.tileSizePixelsWalked = 0;
    }

    this.lastDirection = this.currentDirection;
  }

  ready(direction: DIRECTION, animationKey: ANIMATION | string) {
    if (this.isBlockingDirection(direction)) {
      this.startAnmation(animationKey);
      this.lastDirection = direction;
      this.movementDirectionQueue.length = 0;
      return;
    }

    this.movementDirectionQueue.push({ direction: direction, animationKey: animationKey });
  }

  update(delta?: number) {
    if (this.movementStop) return;

    if (this.movementFinish && this.movementDirectionQueue.length === 0) {
      this.standStop(this.lastDirection);
    }

    if (this.movementFinish && this.movementDirectionQueue.length > 0) {
      const temp = this.movementDirectionQueue.shift();
      this.process(temp!.direction, temp!.animationKey);
    }
    if (this.isMoving()) this.moveObject();
  }

  protected standStop(direction: DIRECTION) {
    let frameNumber = 0;

    switch (direction) {
      case DIRECTION.UP:
        frameNumber = 0;
        break;
      case DIRECTION.DOWN:
        frameNumber = 3;
        break;
      case DIRECTION.LEFT:
        frameNumber = 6;
        break;
      case DIRECTION.RIGHT:
        frameNumber = 9;
        break;
    }

    this.stopAnmation(frameNumber);
  }

  private moveObject() {
    if (this.willCrossTileBorderThisUpdate(this.pixelsToWalkThisUpdate * MAP_SCALE)) {
      this.moveSprite(this.pixelsToWalkThisUpdate * MAP_SCALE);
      this.processStop();
      this.stopAnmation(this.getStopFrameNumber(this.lastDirection)!);
      this.step++;
      this.movementFinish = true;
      this.getSprite().setDepth(this.getTilePos().y);
      this.updateObjectData();
    } else {
      this.moveSprite(this.pixelsToWalkThisUpdate * MAP_SCALE);
      this.movementFinish = false;
    }
  }

  isMoving() {
    return this.currentDirection != DIRECTION.NONE;
  }

  getStopFrameNumber(direction: DIRECTION) {
    let idx = 0;
    switch (direction) {
      case DIRECTION.UP:
        idx = 0;
        break;
      case DIRECTION.DOWN:
        idx = 1;
        break;
      case DIRECTION.LEFT:
        idx = 2;
        break;
      case DIRECTION.RIGHT:
        idx = 3;
        break;
    }
    return this.smoothFrameNumbers[idx];
  }

  getLastDirection() {
    return this.lastDirection;
  }

  getObjectInFront(direction: DIRECTION) {
    const nextTilePos = this.tilePosInDirection(direction);
    const npcs = this.overworldInfo.getNpcs();

    for (const npc of npcs) {
      const npcTilePos = npc.getTilePos();
      if (npcTilePos.x === nextTilePos.x && npcTilePos.y === nextTilePos.y) {
        return npc;
      }
    }

    for (const pokemon of this.overworldInfo.getPokemons()) {
      const pokemonTilePos = pokemon.getTilePos();
      if (pokemonTilePos.x === nextTilePos.x && pokemonTilePos.y === nextTilePos.y && pokemon.getStatus() === POKEMON_STATUS.ROAMING) {
        return pokemon;
      }
    }

    for (const groundItem of this.overworldInfo.getGroundItems()) {
      const groundTilePos = groundItem.getTilePos();
      if (groundTilePos.x === nextTilePos.x && groundTilePos.y === nextTilePos.y && groundItem.getActive() === true) {
        return groundItem;
      }
    }
  }

  isBlockingDirection(direction: DIRECTION): boolean {
    const nextTilePos = this.tilePosInDirection(direction);
    let isBlocked =
      this.hasBlockingTile(nextTilePos) ||
      this.hasBlockingNpc(nextTilePos) ||
      this.hasGroundItemObject(nextTilePos) ||
      this.hasPokemonObject(nextTilePos) ||
      (this.getType() !== OBJECT.PET && this.hasPlayerObject(nextTilePos));
    return isBlocked;
  }

  private tilePosInDirection(direction: DIRECTION): Phaser.Math.Vector2 {
    return this.getTilePos().add(this.movementDirection[direction]!);
  }

  private hasPlayerObject(pos: Phaser.Math.Vector2): boolean {
    const playerData = PlayerInfo.getInstance();
    const x = playerData.getPosX();
    const y = playerData.getPosY();

    if (x === pos.x && y === pos.y) {
      return true;
    }

    return false;
  }

  private hasGroundItemObject(pos: Phaser.Math.Vector2) {
    for (const groundItem of this.overworldInfo.getGroundItems()) {
      const groundTilePos = groundItem.getTilePos();
      if (groundTilePos.x === pos.x && groundTilePos.y === pos.y && groundItem.getActive() === true) {
        return true;
      }
    }
    return false;
  }

  private hasPokemonObject(pos: Phaser.Math.Vector2): boolean {
    for (const pokemon of this.overworldInfo.getPokemons()) {
      const pokemonTilePos = pokemon.getTilePos();
      if (pokemonTilePos.x === pos.x && pokemonTilePos.y === pos.y && pokemon.getStatus() === POKEMON_STATUS.ROAMING) {
        return true;
      }
    }
    return false;
  }

  private hasBlockingNpc(pos: Phaser.Math.Vector2): boolean {
    const npcs = this.overworldInfo.getNpcs();

    for (const npc of npcs) {
      const npcTilePos = npc.getTilePos();
      if (npcTilePos.x === pos.x && npcTilePos.y === pos.y) {
        return true;
      }
    }
    return false;
  }

  hasBlockingTile(pos: Phaser.Math.Vector2): boolean {
    if (this.hasNoTile(pos)) return true;
    return this.map.layers.some((layer) => {
      const tile = this.map.getTileAt(pos.x, pos.y, false, layer.name);
      return tile && tile.properties.collides;
    });
  }

  getTileInfo(direction: DIRECTION): Phaser.Tilemaps.Tile | null {
    const nextTilePos = this.tilePosInDirection(direction);

    return this.map.layers.map((layer) => this.map.getTileAt(nextTilePos.x, nextTilePos.y, false, layer.name)).find((tile) => tile !== null && tile.index !== -1) || null;
  }

  private hasNoTile(pos: Phaser.Math.Vector2): boolean {
    return this.map.layers.some((layer) => {
      this.map.hasTileAt(pos.x, pos.y, layer.name);
    });
  }

  setSmoothFrames(frames: number[]) {
    this.smoothFrameNumbers = frames;
  }

  setSpeed(speed: number) {
    this.stepSpeed = speed;
  }

  getStep() {
    return this.step;
  }

  resetStep() {
    this.step = 0;
  }

  isMovementFinish() {
    return this.movementFinish;
  }

  updateObjectData() {
    const type = this.getType();

    if (type === OBJECT.PLAYER) {
      const playerData = PlayerInfo.getInstance();
      playerData.setX(this.getTilePos().x);
      playerData.setY(this.getTilePos().y);
    }
  }

  setMap(map: Phaser.Tilemaps.Tilemap) {
    if (!map) return;
    this.map = map;
  }
}
