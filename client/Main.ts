import * as Phaser from 'phaser';
import {gameConfig} from './constants/Game';

class Main extends Phaser.Game{
  constructor(){
    super(gameConfig);
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