import Phaser from 'phaser';
import { SignInScene } from './scenes/SignInScene';
import { LoadingScene } from './scenes/LoadingScene';
import { SignUpScene } from './scenes/SignUpScene';

const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 900;

export const gameConfig: Phaser.Types.Core.GameConfig = {
    title: "PoPoSeop",
    render: {
      antialias: false,
    },
    parent: 'game-container',
    type: Phaser.AUTO,
    scene: [LoadingScene,SignUpScene,SignInScene],
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
    backgroundColor: '#111111',
    pixelArt:true,
};

new Phaser.Game(gameConfig);