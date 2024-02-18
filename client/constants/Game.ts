import { InitScene } from "../src/scene/InitScene";
import { MapScene } from "../src/scene/MapScene";
import { PlayerScene } from "../src/scene/PlayerScene";
import { SeasonScene } from "../src/scene/SeasonScene";

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 600;

export const TILE_SIZE = 32;

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