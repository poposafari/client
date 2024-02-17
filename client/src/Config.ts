import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../constants/Game";
import { InitScene } from "./scene/InitScene";
import { MapScene } from "./scene/MapScene";
import { SeasonScene } from "./scene/SeasonScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "PoPoSeop",
    render: {
      antialias: false,
    },
    type: Phaser.AUTO,
    scene: [InitScene,SeasonScene,MapScene],
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