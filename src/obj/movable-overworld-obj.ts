import { MAP_SCALE, TILE_SIZE } from '../constants';
import { GM } from '../core/game-manager';
import { ANIMATION, DIRECTION, OBJECT, TEXTURE } from '../enums';
import { SocketHandler } from '../handlers/socket-handler';
import { InGameScene } from '../scenes/ingame-scene';
import { OverworldStorage } from '../storage';
import { findEventTile } from '../uis/ui';
import { matchPlayerStatus, matchPlayerStatusToDirection } from '../utils/string-util';
import { OverworldObj } from './overworld-obj';

const Vector2 = Phaser.Math.Vector2;

type MovementQueue = {
  direction: DIRECTION;
  animationKey: ANIMATION | string;
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

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap | null, texture: TEXTURE | string, x: number, y: number, name: string = '', objType: OBJECT, initDirection: DIRECTION) {
    super(scene, texture, x, y, name, objType);

    this.map = map ? map : null;
    this.step = 0;
    this.lastDirection = initDirection;
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
    const storage = OverworldStorage.getInstance();

    for (const statue of storage.getStatue()) {
      const statueTilePos = statue.getTilePos();

      if (statueTilePos.x === nextTilePos.x && statueTilePos.y === nextTilePos.y) {
        return statue;
      }
    }

    for (const door of storage.getDoors()) {
      const doorTilePos = door.getTilePos();

      if (doorTilePos.x === nextTilePos.x && doorTilePos.y === nextTilePos.y) {
        return door;
      }
    }

    for (const npc of storage.getNpcs()) {
      const npcTilePos = npc.getTilePos();

      if (npcTilePos.x === nextTilePos.x && npcTilePos.y === nextTilePos.y) {
        return npc;
      }
    }

    for (const wild of storage.getWilds()) {
      const wildTilePos = wild.getTilePos();

      if (wildTilePos.x === nextTilePos.x && wildTilePos.y === nextTilePos.y && !wild.isCatchable()) {
        return wild;
      }
    }

    for (const groundItem of storage.getGroundItems()) {
      const groundItemTilePos = groundItem.getTilePos();

      if (groundItemTilePos.x === nextTilePos.x && groundItemTilePos.y === nextTilePos.y && !groundItem.isCatchable()) {
        return groundItem;
      }
    }

    return null;
  }

  hasPlayer(pos: Phaser.Math.Vector2): boolean {
    const playerAtPosition = GM.getPlayerObj();
    if (playerAtPosition) {
      return playerAtPosition.getTilePos().equals(pos);
    }
    return false;
  }

  hasWild(pos: Phaser.Math.Vector2): boolean {
    const wildAtPosition = OverworldStorage.getInstance()
      .getWilds()
      .find((wild) => wild.getTilePos().equals(pos));

    if (wildAtPosition && wildAtPosition.isCatchable()) {
      return false;
    }

    return !!wildAtPosition;
  }

  hasGroundItem(pos: Phaser.Math.Vector2): boolean {
    const groundItemAtPosition = OverworldStorage.getInstance()
      .getGroundItems()
      .find((groundItem) => groundItem.getTilePos().equals(pos));

    if (groundItemAtPosition && groundItemAtPosition.isCatchable()) {
      return false;
    }

    return !!groundItemAtPosition;
  }

  hasDoor(pos: Phaser.Math.Vector2): boolean {
    return OverworldStorage.getInstance()
      .getDoors()
      .some((door) => door.getTilePos().equals(pos));
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

      if (this.getObjType() === OBJECT.PLAYER) {
        const socketHandler = SocketHandler.getInstance();
        GM.updateUserData({ x: this.getTilePos().x, y: this.getTilePos().y });

        socketHandler.movementPlayer({
          x: this.getTilePos().x,
          y: this.getTilePos().y,
          direction: matchPlayerStatusToDirection(GM.getPlayerObj()!.getLastDirection()),
          movement: matchPlayerStatus(GM.getPlayerObj()!.getCurrentStatus()),
          pet: null,
        });
      }
    } else {
      this.lastDirection = this.currentDirection;
    }
  }

  private hasBlocking(pos: Phaser.Math.Vector2, direction: DIRECTION) {
    if (this.hasStairTile(direction)) return false;
    if (this.hasNoTile(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.hasBlockingTile(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.hasNpc(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.hasDoor(pos) && this.getObjType() === OBJECT.PLAYER) return true;
    if (this.hasWild(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.hasGroundItem(pos) && (this.getObjType() === OBJECT.PLAYER || this.getObjType() === OBJECT.WILD)) return true;
    if (this.getObjType() === OBJECT.WILD && this.hasPlayer(pos)) return true;

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
    return OverworldStorage.getInstance()
      .getNpcs()
      .some((npc) => npc.getTilePos().equals(pos));
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
