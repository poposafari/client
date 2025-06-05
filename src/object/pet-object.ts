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

// export class PetObject extends MovableObject {
//   constructor(scene: InGameScene, texture: TEXTURE | string, x: number, y: number, map: Phaser.Tilemaps.Tilemap, nickname: string, overworldInfo: OverworldInfo) {
//     super(scene, texture, x, y, map, nickname, overworldInfo, OBJECT.PET);
//   }

//   tryFollow(player: PlayerObject) {
//     // if (this.mov()) return;

//     const petTile = this.getTilePos();
//     const playerTile = player.getTilePos();

//     const dx = playerTile.x - petTile.x;
//     const dy = playerTile.y - petTile.y;

//     // 이미 붙어 있으면 이동 X
//     if (Math.abs(dx) + Math.abs(dy) > 1) return;

//     let direction: DIRECTION | null = null;
//     if (dx === 1) direction = DIRECTION.RIGHT;
//     else if (dx === -1) direction = DIRECTION.LEFT;
//     else if (dy === 1) direction = DIRECTION.DOWN;
//     else if (dy === -1) direction = DIRECTION.UP;

//     if (!direction) return;

//     this.setMovement(player.getStatus());

//     const animKey = this.getFollowAnimation(direction);
//     this.tryMove(direction, animKey);
//   }

//   private getFollowAnimation(direction: DIRECTION): string {
//     const playerData = PlayerInfo.getInstance();
//     const pokemon = playerData.getPet();
//     let overworldKey = pokemon ? getPokemonOverworldKey(pokemon) : '000';

//     // 반짝이 포켓몬 효과
//     if (pokemon && isPokedexShiny(overworldKey)) {
//       if (!this.dummy2.anims.isPlaying) {
//         this.dummy2.play(ANIMATION.OVERWORLD_SHINY);
//         this.dummy2.setTexture(TEXTURE.OVERWORLD_SHINY);
//       }
//       this.dummy2.setScale(2.4);
//     } else {
//       this.dummy2.setTexture(TEXTURE.BLANK);
//       this.dummy2.stop();
//     }

//     this.setVisible(!!pokemon);

//     return `pokemon_overworld${overworldKey}_${direction}`;
//   }

//   private setMovement(status: PLAYER_STATUS) {
//     switch (status) {
//       case PLAYER_STATUS.WALK:
//         this.setMoveDuration(200);
//         break;
//       case PLAYER_STATUS.RUNNING:
//         this.setMoveDuration(100);
//         break;
//       case PLAYER_STATUS.RIDE:
//         this.setMoveDuration(70);
//         break;
//       case PLAYER_STATUS.SURF:
//         this.setMoveDuration(120);
//         break;
//     }
//   }
// }
