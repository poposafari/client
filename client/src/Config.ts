import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';

export const CANVAS_WIDTH = 1000;
export const CANVAS_HEIGHT = 600;

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "PoPoSeop",
    render: {
      antialias: false,
    },
    type: Phaser.AUTO,
    scene: [],
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
    plugins: {
      global: [
        {
          key: "rexAwaitLoader",
          plugin: AwaitLoaderPlugin,
          start: true,
        },
      ],
    },
    backgroundColor: '#000000',
    pixelArt:true,
};