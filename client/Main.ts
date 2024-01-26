import * as Phaser from 'phaser';
import {gameConfig} from './Config';

class Main extends Phaser.Scene{
  constructor(){super(gameConfig)}
}

declare global {
  interface Window {
    main: Main;
  }
}

window.onload = function(){
  window.main = new Main();
}


