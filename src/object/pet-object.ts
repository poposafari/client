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

export class PetObject extends MovableObject {
  constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, nickname: string, overworldInfo: OverworldInfo) {
    super(scene, texture, x, y, map, nickname, overworldInfo, OBJECT.PET);
  }

  move(player: PlayerObject) {
    this.movementStop = false;
    this.setMovement(player.getStatus());
    this.followReady(player.getPosition(), player.isPlayerStop());
  }

  followReady(playerPos: Phaser.Math.Vector2, isPlayerStop: boolean) {
    const currentPos = this.getPosition();

    const diffX = playerPos.x - currentPos.x;
    const diffY = playerPos.y - currentPos.y;

    if (isPlayerStop) return;

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
      if (isPokedexShiny(overworldKey)) {
        if (!this.dummy2.anims.isPlaying) {
          this.dummy2.play(ANIMATION.OVERWORLD_SHINY);
          this.dummy2.setTexture(TEXTURE.OVERWORLD_SHINY);
        }
        this.dummy2.setScale(2.4);
      } else {
        this.dummy2.setTexture(TEXTURE.BLANK);
        this.dummy2.stop();
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
}
