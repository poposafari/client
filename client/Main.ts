import * as Phaser from 'phaser';
import {gameConfig} from './src/Config';
import {OverworldScene} from './src/OverworldScene';

class Main extends Phaser.Game{
  constructor(){
    super(gameConfig);
    this.scene.add('OverworldScene',OverworldScene);
  }
}

declare global {
  interface Window {
    main: Main;
  }
}

window.onload = function(){
  window.main = new Main();
}