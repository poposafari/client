import { DIRECTION } from '../enums/direction';
import { KEY } from '../enums/key';
import { TEXTURE } from '../enums/texture';
import { InGameScene } from '../scenes/ingame-scene';
import { MovableObject } from './movable-object';
import { PlayerObject } from './player-object';
import { PLAYER_STATUS } from '../enums/player-status';
import { OBJECT } from '../enums/object-type';
import { PlayerInfo } from '../storage/player-info';
import { OverworldInfo } from '../storage/overworld-info';
import { getPokemonOverworldKey, getPokemonOverworldOrIconKey, isPokedexShiny } from '../utils/string-util';
import { ANIMATION } from '../enums/animation';
import { HM } from '../enums/hidden-move';
import { MAP_SCALE, TILE_SIZE } from './base-object';
import { EASE } from '../enums/ease';

export class PetObject extends MovableObject {
  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, nickname: string) {
    super(scene, texture, x, y, map, nickname, OBJECT.PET);
  }

  move(player: PlayerObject) {
    this.movementStop = false;
    this.setMovement(player.getStatus());
    this.followReady(player);
  }

  followReady(player: PlayerObject) {
    if (player.isPlayerStop()) return;

    const current = this.getTilePos();
    const playerPos = player.getTilePos();

    const diffX = playerPos.x - current.x;
    const diffY = playerPos.y - current.y;

    if (diffX > 0) {
      this.ready(DIRECTION.RIGHT, this.getAnimation(KEY.RIGHT)!);
    } else if (diffX < 0) {
      this.ready(DIRECTION.LEFT, this.getAnimation(KEY.LEFT)!);
    } else if (diffY > 0) {
      this.ready(DIRECTION.DOWN, this.getAnimation(KEY.DOWN)!);
    } else if (diffY < 0) {
      this.ready(DIRECTION.UP, this.getAnimation(KEY.UP)!);
    }
  }

  private getAnimation(key: KEY) {
    const playerData = PlayerInfo.getInstance();

    let pokemon = playerData.getPet();
    let overworldKey = '000';

    if (pokemon) {
      overworldKey = getPokemonOverworldKey(pokemon);
      this.setVisible(true);
      if (pokemon.shiny) {
        if (!this.dummy2?.anims.isPlaying) {
          this.dummy2?.play(ANIMATION.OVERWORLD_SHINY);
          this.dummy2?.setTexture(TEXTURE.OVERWORLD_SHINY);
        }
        this.dummy2?.setScale(2.4);
      } else {
        this.dummy2?.setTexture(TEXTURE.BLANK);
        this.dummy2?.stop();
      }
    } else {
      this.setVisible(false);
    }

    switch (key) {
      case KEY.UP:
        return `pokemon_overworld${overworldKey}_up`;
      case KEY.DOWN:
        return `pokemon_overworld${overworldKey}_down`;
      case KEY.LEFT:
        return `pokemon_overworld${overworldKey}_left`;
      case KEY.RIGHT:
        return `pokemon_overworld${overworldKey}_right`;
    }

    return '';
  }

  private setMovement(status: PLAYER_STATUS) {
    let smoothFrames = [12, 0, 4, 8];
    let speed;
    switch (status) {
      case PLAYER_STATUS.WALK:
        speed = 2;
        break;
      case PLAYER_STATUS.RUNNING:
        speed = 4;
        break;
      case PLAYER_STATUS.RIDE:
        speed = 8;
        break;
      case PLAYER_STATUS.SURF:
        speed = 4;
        break;
    }

    this.setSmoothFrames(smoothFrames!);
    this.setSpeed(speed!);
  }

  jump() {
    if (this.isMoving() || !this.isMovementFinish()) return;

    const direction = this.getLastDirection();
    const directionVector = new Phaser.Math.Vector2(direction === DIRECTION.LEFT ? -1 : direction === DIRECTION.RIGHT ? 1 : 0, direction === DIRECTION.UP ? -1 : direction === DIRECTION.DOWN ? 1 : 0);

    const tileSize = TILE_SIZE * MAP_SCALE;
    const sprite = this.getSprite();
    const scene = this.getScene();
    const currentPos = this.getPosition();
    // const targetPos = currentPos.clone().add(directionVector.clone().scale(tileSize)); // ✅ 1칸만 이동
    const targetPos = currentPos.clone().add(directionVector.clone().scale(tileSize * 2)); // ✅ 2칸 이동
    const jumpHeight = 30;
    const duration = 300;

    const startTime = scene.time.now;

    scene.tweens.add({
      targets: sprite,
      x: targetPos.x,
      duration,
      ease: EASE.LINEAR,
      onUpdate: () => {
        const elapsed = scene.time.now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const parabolaY = -4 * jumpHeight * t * (1 - t);
        sprite.y = Phaser.Math.Interpolation.Linear([currentPos.y, targetPos.y], t) + parabolaY;
      },
      onComplete: () => {
        // this.setTilePos(this.getTilePos().add(directionVector)); // ✅ 1칸만 이동
        this.setTilePos(this.getTilePos().add(directionVector.clone().scale(2))); // ✅ 2칸 이동
        this.setPosition(targetPos);
        this.updateObjectData();
      },
    });
  }
}
