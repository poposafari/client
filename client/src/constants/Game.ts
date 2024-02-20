import { InitScene } from "..//scene/InitScene";
import { MapScene } from "..//scene/MapScene";
import { PlayerScene } from "..//scene/PlayerScene";
import { SeasonScene } from "..//scene/SeasonScene";

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 600;

export const TILE_SIZE = 32;

export const MOVEMENT_SPEED = 2;

export const enum OBJECT_TYPE {
  PLAYER = 'player',
  PET = 'pet',
}

export const enum BEHAVIOR_STATUS {
  NONE = 'none',
  WALK = 'walk',
  RUN = 'run',
  THROW = 'throw',
  THROW_PREV = 'throw-prev',
  THROW_NEXT = 'throw-next',
}

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "PoPoSeop",
    render: {
      antialias: false,
    },
    type: Phaser.AUTO,
    scene: [InitScene,SeasonScene,MapScene,PlayerScene],
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

