import { ANIMATION, DIRECTION, KEY, OBJECT, PLAYER_STATUS, TEXTURE } from '../enums';
import { InGameScene } from '../scenes/ingame-scene';
import { getOverworldPokemonTexture } from '../utils/string-util';
import { MovableOverworldObj } from './movable-overworld-obj';
import { OtherPlayerOverworldObj } from './other-player-overworld-obj';
import { PlayerOverworldObj } from './player-overworld-obj';
import { PlayerPokemon } from './player-pokemon';

export class PetOverworldObj extends MovableOverworldObj {
  private texture: string;
  private data!: PlayerPokemon | null;

  constructor(scene: InGameScene, map: Phaser.Tilemaps.Tilemap | null, pet: PlayerPokemon | null, x: number, y: number) {
    const texture = getOverworldPokemonTexture(null);
    super(scene, map, texture, x, y - 1, '', OBJECT.PET, DIRECTION.DOWN);
    this.texture = texture;

    this.changePet(pet, true);
    this.setSpriteScale(1.5);
    this.startSpriteAnimation(this.getAnimation(KEY.DOWN)!);
    this.isShiny();
  }

  move(player: PlayerOverworldObj | OtherPlayerOverworldObj) {
    this.setMovement(player.getCurrentStatus());
    this.followReady(player);
  }

  teleportBehind(player: PlayerOverworldObj): void {
    const playerTilePos = player.getTilePos();
    this.moveTilePos(playerTilePos.x, playerTilePos.y);
  }

  changePet(newPet: PlayerPokemon | null, isInitial: boolean = false) {
    const oldPet = this.data;
    this.data = newPet;

    if (!newPet) this.setSpriteVisible(false);
    if (oldPet?.getIdx() === newPet?.getIdx() && oldPet?.getPokedex() === newPet?.getPokedex()) return;

    this.texture = getOverworldPokemonTexture(newPet);
    this.startSpriteAnimation(this.getAnimation(KEY.DOWN)!);
    this.stopSpriteAnimation(this.getStopFrameNumberFromDirection(this.lastDirection)!);

    if (newPet) {
      this.isShiny();
      if (!isInitial) {
        this.call();
      } else {
        this.setSpriteVisible(true);
      }
    } else {
      if (!isInitial && newPet) {
        this.recall();
      } else {
        this.setSpriteVisible(false);
      }
    }
  }

  call() {
    const tilePos = this.getTilePos();

    if (!tilePos) return;
    if (!this.data) return;

    this.setDummyOffsetY(tilePos.x, tilePos.y, +80);

    this.setDummy(TEXTURE.POKEMON_CALL, ANIMATION.POKEMON_CALL, 0, 10, 1, () => {
      this.setSpriteVisible(true);
      this.isShiny();
    });
  }

  recall() {
    const tilePos = this.getTilePos();

    if (!tilePos) return;
    if (!this.data) return;

    this.setSpriteVisible(false);
    this.setDummyOffsetY(tilePos.x, tilePos.y, +80);
    this.setDummy(TEXTURE.POKEMON_RECALL, ANIMATION.POKEMON_RECALL, 0, 10, 1, () => {
      this.isShiny();
    });
  }

  private setMovement(status: PLAYER_STATUS) {
    let smoothFrames = [12, 0, 4, 8];
    let stopFraems = [12, 0, 4, 8];
    let speed = 2;
    switch (status) {
      case PLAYER_STATUS.WALK:
        speed = 2;
        break;
      case PLAYER_STATUS.RUNNING:
        speed = 4;
        break;
      case PLAYER_STATUS.RIDE:
        speed = 6;
        break;
      case PLAYER_STATUS.SURF:
        speed = 4;
        break;
    }

    this.smoothFrameNumbers = smoothFrames;
    this.stopFrameNumbers = stopFraems;
    this.baseSpeed = speed;
  }

  followReady(player: PlayerOverworldObj | OtherPlayerOverworldObj) {
    if (player.isMovementBlocking()) return;

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
    switch (key) {
      case KEY.UP:
        return `${this.texture}_up`;
      case KEY.DOWN:
        return `${this.texture}_down`;
      case KEY.LEFT:
        return `${this.texture}_left`;
      case KEY.RIGHT:
        return `${this.texture}_right`;
    }
  }

  private isShiny() {
    this.data?.getShiny() ? this.setEffect(TEXTURE.OVERWORLD_SHINY, ANIMATION.OVERWORLD_SHINY, -1, 10, 2) : this.setEffect(TEXTURE.BLANK, ANIMATION.NONE);
  }
}
