import { MAP_SCALE, TILE_SIZE } from '../constants';
import { ANIMATION, DIRECTION, OBJECT, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { findEventTile } from '../uis/ui';
import { OverworldObj } from './overworld-obj';
import { PlayerGlobal } from '../core/storage/player-storage';
import { NpcOverworldObj } from './npc-overworld-obj';
import { WildOverworldObj } from './wild-overworld-obj';
import { GroundItemOverworldObj } from './ground-item-overworld-obj';
import { DoorOverworldObj } from './door-overworld-obj';
import { OverworldTriggerObj } from './overworld-trigger-obj';
import { SignOverworldObj } from './sign-overworld-obj';

const Vector2 = Phaser.Math.Vector2;

type MovementQueue = {
  direction: DIRECTION;
  animationKey: ANIMATION | string;
};

export type OverworldObjectCollections = {
  npcs?: NpcOverworldObj[];
  wilds?: WildOverworldObj[];
  groundItems?: GroundItemOverworldObj[];
  doors?: DoorOverworldObj[];
  signs?: SignOverworldObj[];
  triggers?: OverworldTriggerObj[];
};

export class MovableOverworldObj extends OverworldObj {
  private map: Phaser.Tilemaps.Tilemap | null;
  private currentDirection: DIRECTION = DIRECTION.NONE;
  private tileSizePixelsWalked: number = 0;
  private movementCheck: boolean = true;
  private movementDirectionQueue: Array<MovementQueue> = [];
  private movementDirection: { [key in DIRECTION]?: Phaser.Math.Vector2 } = {
    [DIRECTION.UP]: Vector2.UP,
    [DIRECTION.DOWN]: Vector2.DOWN,
    [DIRECTION.LEFT]: Vector2.LEFT,
    [DIRECTION.RIGHT]: Vector2.RIGHT,
  };
  private movementBlocking: boolean = false;
  protected lastDirection: DIRECTION = DIRECTION.DOWN;
  protected step: number;
  protected smoothFrameNumbers: number[] = [];
  protected stopFrameNumbers: number[] = [];
  protected baseSpeed: number = 100;
  protected objectCollections?: OverworldObjectCollections;

  constructor(
    scene: InGameScene,
    map: Phaser.Tilemaps.Tilemap | null,
    texture: TEXTURE | string,
    x: number,
    y: number,
    name: string = '',
    objType: OBJECT,
    initDirection: DIRECTION,
    objectCollections?: OverworldObjectCollections,
  ) {
    super(scene, texture, x, y, name, objType);

    this.map = map ? map : null;
    this.step = 0;
    this.lastDirection = initDirection;
    this.objectCollections = objectCollections;
  }

  setObjectCollections(objectCollections: OverworldObjectCollections) {
    this.objectCollections = objectCollections;
  }

  ready(direction: DIRECTION, animationKey: ANIMATION | string) {
    if (this.isBlockingDirection(direction)) {
      this.lastDirection = direction;
      this.movementDirectionQueue.length = 0;
      this.movementBlocking = true;
      this.stopSpriteAnimation(this.getStopFrameNumberFromDirection(this.lastDirection)!);
      return;
    }

    this.movementBlocking = false;
    this.movementDirectionQueue.push({ direction: direction, animationKey: animationKey });
  }

  update(delta: number) {
    if (this.movementCheck && this.movementDirectionQueue.length === 0) {
      this.stopSpriteAnimation(this.getStopFrameNumberFromDirection(this.lastDirection)!);
      return;
    }

    if (this.movementCheck && this.movementDirectionQueue.length > 0) {
      const temp = this.movementDirectionQueue.shift();
      this.process(temp!.direction, temp!.animationKey);
      this.setTilePos(this.getTilePos().add(this.movementDirection[this.currentDirection]!));
      this.movementCheck = false;
    }

    if (this.isMoving()) {
      const pixelsToMove = (this.baseSpeed * delta) / 12;
      this.moveObject(pixelsToMove);
    }
  }

  process(direction: DIRECTION, animationKey: ANIMATION | string) {
    if (this.isMoving()) return;
    this.currentDirection = direction;
    this.startSpriteAnimation(animationKey);
  }

  processStop() {
    this.currentDirection = DIRECTION.NONE;
  }

  isBlockingDirection(direction: DIRECTION): boolean {
    if (this.getObjType() === OBJECT.PET) return false;

    const nextTilePos = this.getTilePos().add(this.movementDirection[direction]!);
    return this.hasBlocking(nextTilePos, direction);
  }

  isMovementFinish() {
    return this.movementCheck;
  }

  isMovementBlocking() {
    return this.movementBlocking;
  }

  getTileInfo(direction: DIRECTION): Phaser.Tilemaps.Tile[] {
    const ret: Phaser.Tilemaps.Tile[] = [];
    const nextTilePos = this.getTilePos().add(this.movementDirection[direction]!);
    this.map?.layers.forEach((layer) => {
      const tile = this.map?.getTileAt(nextTilePos.x, nextTilePos.y, false, layer.name);
      if (tile) ret.push(tile);
    });
    return ret;
  }

  getStopFrameNumberFromDirection(direction: DIRECTION) {
    switch (direction) {
      case DIRECTION.UP:
        return this.stopFrameNumbers[0];
      case DIRECTION.DOWN:
        return this.stopFrameNumbers[1];
      case DIRECTION.LEFT:
        return this.stopFrameNumbers[2];
      case DIRECTION.RIGHT:
        return this.stopFrameNumbers[3];
    }
  }

  getObjectInFront(direction: DIRECTION) {
    const nextTilePos = this.getTilePos().add(this.movementDirection[direction]!);

    const signs = this.objectCollections?.signs;
    const doors = this.objectCollections?.doors;
    const npcs = this.objectCollections?.npcs;
    const wilds = this.objectCollections?.wilds;
    const groundItems = this.objectCollections?.groundItems;
    const triggers = this.objectCollections?.triggers;

    for (const sign of signs || []) {
      const signTilePos = sign.getTilePos();
      if (signTilePos.x === nextTilePos.x && signTilePos.y === nextTilePos.y) {
        return sign;
      }
    }
    for (const door of doors || []) {
      const doorTilePos = door.getTilePos();
      if (doorTilePos.x === nextTilePos.x && doorTilePos.y === nextTilePos.y) {
        return door;
      }
    }
    for (const npc of npcs || []) {
      const npcTilePos = npc.getTilePos();
      if (npcTilePos.x === nextTilePos.x && npcTilePos.y === nextTilePos.y) {
        return npc;
      }
    }
    for (const wild of wilds || []) {
      const wildTilePos = wild.getTilePos();
      if (wildTilePos.x === nextTilePos.x && wildTilePos.y === nextTilePos.y && !wild.isCatchable()) {
        return wild;
      }
    }
    for (const groundItem of groundItems || []) {
      const groundItemTilePos = groundItem.getTilePos();
      if (groundItemTilePos.x === nextTilePos.x && groundItemTilePos.y === nextTilePos.y && !groundItem.isCatchable()) {
        return groundItem;
      }
    }
    return null;
  }

  hasPlayer(pos: Phaser.Math.Vector2): boolean {
    const playerAtPosition = PlayerGlobal.getObj();
    if (playerAtPosition) {
      return playerAtPosition.getTilePos().equals(pos);
    }
    return false;
  }

  hasWild(pos: Phaser.Math.Vector2): boolean {
    const wilds = this.objectCollections?.wilds;
    const wildAtPosition = wilds?.find((wild) => wild.getTilePos().equals(pos));

    if (wildAtPosition && wildAtPosition.isCatchable()) {
      return false;
    }

    return !!wildAtPosition;
  }

  hasGroundItem(pos: Phaser.Math.Vector2): boolean {
    const groundItems = this.objectCollections?.groundItems;
    const groundItemAtPosition = groundItems?.find((groundItem) => groundItem.getTilePos().equals(pos));

    if (groundItemAtPosition && groundItemAtPosition.isCatchable()) {
      return false;
    }

    return !!groundItemAtPosition;
  }

  hasDoor(pos: Phaser.Math.Vector2): boolean {
    const doors = this.objectCollections?.doors;
    return !!doors?.some((door) => door.getTilePos().equals(pos));
  }

  hasSign(pos: Phaser.Math.Vector2): boolean {
    const signs = this.objectCollections?.signs;
    return !!signs?.some((sign) => sign.getTilePos().equals(pos));
  }

  getLastDirection() {
    return this.lastDirection;
  }

  private moveObject(pixelsToWalkThisUpdate: number) {
    const directionVector = this.movementDirection[this.currentDirection]!.clone();
    const movement = directionVector.scale(pixelsToWalkThisUpdate);
    const currentPos = this.getSpritePos();
    const newPosition = currentPos.add(movement);

    this.setPosition(newPosition);
    this.tileSizePixelsWalked += pixelsToWalkThisUpdate;

    if (this.tileSizePixelsWalked >= TILE_SIZE * MAP_SCALE) {
      const currentTile = this.getTilePos();
      const newTile = currentTile;
      const tileCenterX = newTile.x * TILE_SIZE * MAP_SCALE + (TILE_SIZE * MAP_SCALE) / 2;
      const tileCenterY = newTile.y * TILE_SIZE * MAP_SCALE + TILE_SIZE * MAP_SCALE;
      this.setPosition(new Phaser.Math.Vector2(tileCenterX, tileCenterY));
      this.tileSizePixelsWalked = 0;
      this.movementCheck = true;
      this.processStop();
      this.stopSpriteAnimation(this.getSmoothFrameNumberFromDirection(this.lastDirection)!);
      this.setSpriteDepth(newTile.y);
      this.step++;
    } else {
      this.lastDirection = this.currentDirection;
    }
  }

  hasBlocking(pos: Phaser.Math.Vector2, direction: DIRECTION) {
    if (this.hasStairTile(direction)) return false;
    if (this.hasNoTile(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.hasWild(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.getObjType() === OBJECT.WILD && this.hasPlayer(pos)) return true;
    if (this.hasGroundItem(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.hasNpc(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.hasSign(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.hasDoor(pos) && this.getObjType() === OBJECT.PLAYER) return true;
    if (this.hasBlockingTile(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;

    return false;
  }

  private hasNoTile(pos: Phaser.Math.Vector2): boolean {
    return !this.map!.layers.some((layer) => this.map!.hasTileAt(pos.x, pos.y, layer.name));
  }

  private hasBlockingTile(pos: Phaser.Math.Vector2) {
    return this.map!.layers.some((layer) => {
      const tile = this.map!.getTileAt(pos.x, pos.y, false, layer.name);
      return tile && tile.properties.collides;
    });
  }

  private hasStairTile(direction: DIRECTION) {
    const tiles = this.getTileInfo(direction);
    return findEventTile(tiles) === 'stair';
  }

  private hasNpc(pos: Phaser.Math.Vector2): boolean {
    const npcs = this.objectCollections?.npcs;
    return !!npcs?.some((npc) => npc.getTilePos().equals(pos));
  }

  private isMoving() {
    return this.currentDirection != DIRECTION.NONE;
  }

  private getSmoothFrameNumberFromDirection(direction: DIRECTION) {
    switch (direction) {
      case DIRECTION.UP:
        return this.smoothFrameNumbers[0];
      case DIRECTION.DOWN:
        return this.smoothFrameNumbers[1];
      case DIRECTION.LEFT:
        return this.smoothFrameNumbers[2];
      case DIRECTION.RIGHT:
        return this.smoothFrameNumbers[3];
    }
  }
}
