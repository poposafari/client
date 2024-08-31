import Phaser from "phaser";
import {LoadingScene} from "./scenes/loading-scene"

const config: Phaser.Types.Core.GameConfig={
  type:Phaser.WEBGL,
  parent:"app",
  scale:{
    width:1920,
    height:1080,
    mode: Phaser.Scale.FIT
  },
  plugins:{

  },
  dom:{
    createContainer: true
  },
  pixelArt:true,
  scene:[LoadingScene]
}

let game;

const start=()=>{
  game = new Phaser.Game(config);
}

start();