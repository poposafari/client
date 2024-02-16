import * as Phaser from 'phaser';
import {gameConfig} from './src/Config';
import {OverworldScene} from './src/scene/OverworldScene';
import { LoadScene } from './src/scene/LoadScene';

class Main extends Phaser.Game{
  constructor(){
    super(gameConfig);
    this.scene.add('LoadScene',LoadScene);
    this.scene.start('LoadScene');
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