// import { GM } from '../core/game-manager';
// import { ANIMATION } from '../enums/animation';
// import { DIRECTION } from '../enums/direction';
// import { OBJECT } from '../enums/object-type';
// import { PLAYER_STATUS } from '../enums/player-status';
// import { POKEMON_STATUS } from '../enums/pokemon-status';
// import { TEXTURE } from '../enums/texture';
// import { SocketHandler } from '../handlers/socket-handler';
// import { InGameScene } from '../scenes/ingame-scene';
// import { OverworldInfo } from '../storage/overworld-info';
// import { PlayerInfo } from '../storage/player-info';
// import { findEventTile } from '../uis/ui';
// import { BaseObject, MAP_SCALE, TILE_SIZE } from './base-object';

// const Vector2 = Phaser.Math.Vector2;

// interface MovementQueue {
//   direction: DIRECTION;
//   animationKey: ANIMATION | string;
// }

// export class MovableObject extends BaseObject {
//   private step: number = 0;
//   private baseSpeed: number = 100;
//   protected currentDirection: DIRECTION = DIRECTION.NONE;
//   private lastDirection: DIRECTION = DIRECTION.DOWN;
//   private tileSizePixelsWalked: number = 0;
//   private smoothFrameNumbers: number[] = [];
//   private movementFinish: boolean = true;
//   protected movementStop: boolean = true;
//   private movementDirectionQueue: Array<MovementQueue> = [];
//   private status: PLAYER_STATUS | null;
//   protected map: Phaser.Tilemaps.Tilemap;

//   private movementDirection: { [key in DIRECTION]?: Phaser.Math.Vector2 } = {
//     [DIRECTION.UP]: Vector2.UP,
//     [DIRECTION.DOWN]: Vector2.DOWN,
//     [DIRECTION.LEFT]: Vector2.LEFT,
//     [DIRECTION.RIGHT]: Vector2.RIGHT,
//   };

//   constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap | null, nickname: string, objectType: OBJECT) {
//     super(scene, texture, x, y, nickname, objectType);
//     this.map = map!;
//     this.stopAnmation(3);

//     if (this.getType() === OBJECT.POKEMON) {
//       this.startAnmation(`${texture}_down`);
//     }

//     this.status = null;
//   }

//   process(direction: DIRECTION, animationKey: ANIMATION | string) {
//     if (this.isMoving()) return;
//     this.currentDirection = direction;
//     this.startAnmation(animationKey, 8);
//   }

//   processStop() {
//     this.currentDirection = DIRECTION.NONE;
//   }

//   getMovementDirectionQueue() {
//     return this.movementDirectionQueue;
//   }

//   getLastDirection() {
//     return this.lastDirection;
//   }

//   ready(direction: DIRECTION, animationKey: ANIMATION | string, status?: PLAYER_STATUS) {
//     if (this.isBlockingDirection(direction)) {
//       this.startAnmation(animationKey);
//       this.lastDirection = direction;
//       this.movementDirectionQueue.length = 0;
//       return;
//     }

//     if (status) this.status = status;
//     this.movementDirectionQueue.push({ direction: direction, animationKey: animationKey });
//   }

//   update(delta: number) {
//     if (this.movementStop) return;

//     if (this.movementFinish && this.movementDirectionQueue.length === 0) {
//       this.standStop(this.lastDirection);
//       return;
//     }

//     if (this.movementFinish && this.movementDirectionQueue.length > 0) {
//       const temp = this.movementDirectionQueue.shift();
//       this.process(temp!.direction, temp!.animationKey);
//       this.setTilePos(this.getTilePos().add(this.movementDirection[this.currentDirection]!));
//       this.movementFinish = false;
//     }

//     if (this.isMoving()) {
//       const pixelsToMove = (this.baseSpeed * delta) / 11;
//       this.moveObject(pixelsToMove);
//     }
//   }

//   private moveObject(pixelsToWalkThisUpdate: number) {
//     const directionVector = this.movementDirection[this.currentDirection]!.clone();
//     const movement = directionVector.scale(pixelsToWalkThisUpdate);
//     const currentPos = this.getPosition();
//     const newPosition = currentPos.add(movement);

//     this.setPosition(newPosition);
//     this.tileSizePixelsWalked += pixelsToWalkThisUpdate;

//     if (this.tileSizePixelsWalked >= TILE_SIZE * MAP_SCALE) {
//       const currentTile = this.getTilePos();
//       const newTile = currentTile;
//       const tileCenterX = newTile.x * TILE_SIZE * MAP_SCALE + (TILE_SIZE * MAP_SCALE) / 2;
//       const tileCenterY = newTile.y * TILE_SIZE * MAP_SCALE + TILE_SIZE * MAP_SCALE;
//       this.setPosition(new Phaser.Math.Vector2(tileCenterX, tileCenterY));
//       this.tileSizePixelsWalked = 0;
//       this.movementFinish = true;
//       this.processStop();
//       this.stopAnmation(this.getStopFrameNumber(this.lastDirection)!);
//       this.getSprite().setDepth(newTile.y);
//       this.updateObjectData();
//       this.step++;

//       if (this.getType() === OBJECT.PLAYER) {
//       }

//       // if (this.getType() === OBJECT.PLAYER && this.status) {
//       //   SocketHandler.getInstance().move({ overworld: OverworldInfo.getInstance().getKey(), x: this.getTilePos().x, y: this.getTilePos().y, direction: this.lastDirection, status: this.status });
//       //   this.status = null;
//       // }
//     } else {
//       this.lastDirection = this.currentDirection;
//     }
//   }

//   protected standStop(direction: DIRECTION) {
//     let frameNumber = 0;
//     switch (direction) {
//       case DIRECTION.UP:
//         frameNumber = 0;
//         break;
//       case DIRECTION.DOWN:
//         frameNumber = 3;
//         break;
//       case DIRECTION.LEFT:
//         frameNumber = 6;
//         break;
//       case DIRECTION.RIGHT:
//         frameNumber = 9;
//         break;
//     }

//     this.stopAnmation(frameNumber);
//   }

//   isMoving() {
//     return this.currentDirection != DIRECTION.NONE;
//   }

//   getStopFrameNumber(direction: DIRECTION) {
//     let idx = 0;
//     switch (direction) {
//       case DIRECTION.UP:
//         idx = 0;
//         break;
//       case DIRECTION.DOWN:
//         idx = 1;
//         break;
//       case DIRECTION.LEFT:
//         idx = 2;
//         break;
//       case DIRECTION.RIGHT:
//         idx = 3;
//         break;
//     }
//     return this.smoothFrameNumbers[idx];
//   }

//   isBlockingDirection(direction: DIRECTION): boolean {
//     const nextTilePos = this.getTilePos().add(this.movementDirection[direction]!);

//     if (this.hasStairTile(direction)) return false;
//     if (this.getType() === OBJECT.OTHER_PLAYER) return false;

//     return (
//       this.hasBlockingTile(nextTilePos) ||
//       this.hasBlockingNpc(nextTilePos) ||
//       this.hasGroundItemObject(nextTilePos) ||
//       this.hasPokemonObject(nextTilePos) ||
//       (this.getType() !== OBJECT.PET && this.hasPlayerObject(nextTilePos))
//     );
//   }

//   private hasBlockingNpc(pos: Phaser.Math.Vector2): boolean {
//     return OverworldInfo.getInstance()
//       .getNpcs()
//       .some((npc) => npc.getTilePos().equals(pos));
//   }

//   private hasPlayerObject(pos: Phaser.Math.Vector2): boolean {
//     const player = PlayerInfo.getInstance();
//     return player.getPosX() === pos.x && player.getPosY() === pos.y;
//   }

//   private hasGroundItemObject(pos: Phaser.Math.Vector2): boolean {
//     return OverworldInfo.getInstance()
//       .getGroundItems()
//       .some((item) => item.getTilePos().equals(pos) && !item.getCatch());
//   }

//   private hasPokemonObject(pos: Phaser.Math.Vector2): boolean {
//     return OverworldInfo.getInstance()
//       .getPokemons()
//       .some((p) => p.getTilePos().equals(pos) && p.getStatus() === POKEMON_STATUS.ROAMING);
//   }

//   hasBlockingTile(pos: Phaser.Math.Vector2): boolean {
//     if (this.hasNoTile(pos)) return true;
//     if (this.getType() === OBJECT.PET) return false;
//     return this.map.layers.some((layer) => {
//       const tile = this.map.getTileAt(pos.x, pos.y, false, layer.name);
//       return tile && tile.properties.collides;
//     });
//   }

//   hasStairTile(direction: DIRECTION): boolean {
//     const tiles = this.getTileInfo(direction);
//     return findEventTile(tiles) === 'stair';
//   }

//   private hasNoTile(pos: Phaser.Math.Vector2): boolean {
//     return !this.map.layers.some((layer) => this.map.hasTileAt(pos.x, pos.y, layer.name));
//   }

//   getTileInfo(direction: DIRECTION): Phaser.Tilemaps.Tile[] {
//     const ret: Phaser.Tilemaps.Tile[] = [];
//     const nextTilePos = this.getTilePos().add(this.movementDirection[direction]!);
//     this.map.layers.forEach((layer) => {
//       const tile = this.map.getTileAt(nextTilePos.x, nextTilePos.y, false, layer.name);
//       if (tile) ret.push(tile);
//     });
//     return ret;
//   }

//   setSmoothFrames(frames: number[]) {
//     this.smoothFrameNumbers = frames;
//   }

//   setSpeed(speed: number) {
//     this.baseSpeed = speed;
//   }

//   getStep() {
//     return this.step;
//   }

//   resetStep() {
//     this.step = 0;
//   }

//   isMovementFinish() {
//     return this.movementFinish;
//   }

//   updateObjectData() {
//     if (this.getType() === OBJECT.PLAYER) {
//       GM.getUserData()!.x = this.getTilePos().x;
//       GM.getUserData()!.y = this.getTilePos().y;
//     }
//   }

//   setMap(map: Phaser.Tilemaps.Tilemap) {
//     if (map) this.map = map;
//   }

//   getObjectInFront(direction: DIRECTION) {
//     const nextTilePos = this.tilePosInDirection(direction);
//     const npcs = OverworldInfo.getInstance().getNpcs();

//     for (const npc of npcs) {
//       const npcTilePos = npc.getTilePos();
//       if (npcTilePos.x === nextTilePos.x && npcTilePos.y === nextTilePos.y) {
//         return npc;
//       }
//     }

//     for (const pokemon of OverworldInfo.getInstance().getPokemons()) {
//       const pokemonTilePos = pokemon.getTilePos();
//       if (pokemonTilePos.x === nextTilePos.x && pokemonTilePos.y === nextTilePos.y && pokemon.getStatus() === POKEMON_STATUS.ROAMING) {
//         return pokemon;
//       }
//     }

//     for (const groundItem of OverworldInfo.getInstance().getGroundItems()) {
//       const groundTilePos = groundItem.getTilePos();
//       if (groundTilePos.x === nextTilePos.x && groundTilePos.y === nextTilePos.y && groundItem.getCatch() === false) {
//         return groundItem;
//       }
//     }
//   }

//   private tilePosInDirection(direction: DIRECTION): Phaser.Math.Vector2 {
//     return this.getTilePos().add(this.movementDirection[direction]!);
//   }
// }
