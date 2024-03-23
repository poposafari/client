import { InitScene } from "..//scene/InitScene";
import { MapScene } from "..//scene/MapScene";
import { PlayerScene } from "..//scene/PlayerScene";
import { SeasonScene } from "..//scene/SeasonScene";
import {WildPokemonScene} from "../scene/WildPokemonScene";

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 600;

export const TILE_SIZE = 32;

export const MOVEMENT_SPEED = 2;

export const MAX_PLAYER_SPRITE = 8;

export const MAX_POKEMON = 151;

export const MAX_WILD_POKEMON = 3;

export const MAX_PLAYER_MOVEMENT_FRAME = 23;
export const MAX_POKEMON_FRAME = 15;

export const DEFAULT_FRAMERATE = 6;
export const DEFAULT_DELAY = 0;

export const enum OBJECT_TYPE {
  PLAYER = 'player',
  PET = 'pet',
}

export const enum BEHAVIOR_STATUS {
  IDLE = 'idle',
  MOVEMENT_FINISH = 'movement-finish',
  WALK = 'walk',
  RUN = 'run',
  THROW = 'throw',
  THROW_PREV = 'throw-prev',
  THROW_NEXT = 'throw-next',
}

export const enum IMAGE_KEY {
  TILESET = 'nature_1',
  MAP = 'test-town-map',
  PLAYER_MOVEMENT = 'player_movement',
  PLAYER_RIDE = 'player_ride',
  PLAYER_SURF = 'player_surf',
  PLAYER_FISHING = 'player_fishing',
  ITEM_GROUND = 'item_ground',
  ITEM_THROW = 'item_throw',
}

export const enum SPRITE_DEPTH {
  NICKNAME = 7,
  ITEM = 5,
  WILD_POKEMON = 5,
  PLAYER_MIN = 2,
  PLAYER_MIDDLE = 3,
  PLAYER_MAX = 4,
  PET=1,
}

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "PoPoSeop",
    render: {
      antialias: false,
    },
    type: Phaser.AUTO,
    scene: [InitScene,SeasonScene,MapScene,PlayerScene,WildPokemonScene],
    scale: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    dom: {
      createContainer: true
    },
    fps:{
      target: 60,
      forceSetTimeOut: true
    },
    backgroundColor: '#000000',
    pixelArt:true,
};