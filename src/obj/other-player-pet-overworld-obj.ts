import { ANIMATION, DIRECTION, KEY, OBJECT, PLAYER_STATUS, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { MovableOverworldObj } from './movable-overworld-obj';
import { OtherPlayerOverworldObj } from './other-player-overworld-obj';

export class OtherPlayerPetOverworldObj extends MovableOverworldObj {
  private texture: string = 'pokemon_overworld000';

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap | null, texture: string | null, x: number, y: number) {
    const targetTexture = texture ? texture : 'pokemon_overworld000';

    super(scene, map, targetTexture, x, y, '', OBJECT.PET, DIRECTION.DOWN);

    this.texture = targetTexture;

    this.setSpriteScale(1.5);
    this.startSpriteAnimation(this.getAnimation(KEY.ARROW_DOWN)!);
    this.isShiny();
    this.changePet(targetTexture, PLAYER_STATUS.WALK);
  }

  move(player: OtherPlayerOverworldObj) {
    this.setMovement(player.getCurrentStatus());
    this.followReady(player);
  }

  teleportBehind(player: OtherPlayerOverworldObj): void {
    const playerTilePos = player.getTilePos();
    this.moveTilePos(playerTilePos.x, playerTilePos.y);
  }

  followReady(player: OtherPlayerOverworldObj) {
    if (player.isMovementBlocking()) return;

    const current = this.getTilePos();
    const playerPos = player.getTilePos();

    const diffX = playerPos.x - current.x;
    const diffY = playerPos.y - current.y;

    if (diffX > 0) {
      this.ready(DIRECTION.RIGHT, this.getAnimation(KEY.ARROW_RIGHT)!);
    } else if (diffX < 0) {
      this.ready(DIRECTION.LEFT, this.getAnimation(KEY.ARROW_LEFT)!);
    } else if (diffY > 0) {
      this.ready(DIRECTION.DOWN, this.getAnimation(KEY.ARROW_DOWN)!);
    } else if (diffY < 0) {
      this.ready(DIRECTION.UP, this.getAnimation(KEY.ARROW_UP)!);
    }
  }

  changePet(texture: string | null, status: PLAYER_STATUS) {
    this.texture = texture ? texture : 'pokemon_overworld000';

    if (status === PLAYER_STATUS.RIDE) this.setSpriteVisible(false);

    if (this.texture === 'pokemon_overworld000') {
      this.setSpriteVisible(false);
    } else {
      this.setSpriteVisible(true);
    }

    this.startSpriteAnimation(this.getAnimation(KEY.ARROW_DOWN)!);
    this.stopSpriteAnimation(this.getStopFrameNumberFromDirection(this.lastDirection)!);

    this.isShiny();
  }

  private setMovement(status: PLAYER_STATUS) {
    let smoothFrames = [12, 0, 4, 8];
    let stopFraems = [12, 0, 4, 8];
    let speed = 2;
    switch (status) {
      case PLAYER_STATUS.WALK:
        this.setSpriteVisible(true);
        speed = 2;
        break;
      case PLAYER_STATUS.RUNNING:
        this.setSpriteVisible(true);
        speed = 4;
        break;
      case PLAYER_STATUS.RIDE:
        this.setSpriteVisible(false);
        speed = 6;
        break;
      case PLAYER_STATUS.SURF:
        this.setSpriteVisible(false);
        speed = 4;
        break;
    }

    if (this.texture === 'pokemon_overworld000') this.setSpriteVisible(false);

    this.smoothFrameNumbers = smoothFrames;
    this.stopFrameNumbers = stopFraems;
    this.baseSpeed = speed;
  }

  private getAnimation(key: KEY) {
    switch (key) {
      case KEY.ARROW_UP:
        return `${this.texture}_up`;
      case KEY.ARROW_DOWN:
        return `${this.texture}_down`;
      case KEY.ARROW_LEFT:
        return `${this.texture}_left`;
      case KEY.ARROW_RIGHT:
        return `${this.texture}_right`;
    }
  }

  private isShiny() {
    if (!this.texture) return;

    const isShinyTexture = this.texture.endsWith('s');
    isShinyTexture ? this.setEffect(TEXTURE.OVERWORLD_SHINY, ANIMATION.OVERWORLD_SHINY, -1, 10, 2) : this.setEffect(TEXTURE.BLANK, ANIMATION.NONE);
  }
}
