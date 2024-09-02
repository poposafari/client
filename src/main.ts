import Phaser from "phaser";
import {LoadingScene} from "./scenes/loading-scene"
import { InGameScene } from "./scenes/ingame-scene";
import InputTextPlugin from "phaser3-rex-plugins/plugins/inputtext-plugin.js";

const config: Phaser.Types.Core.GameConfig={
  type:Phaser.WEBGL,
  parent:"app",
  scale:{
    width:1920,
    height:1080,
    mode: Phaser.Scale.FIT
  },
  plugins:{
    global:[{
      key: "rexInputTextPlugin",
      plugin: InputTextPlugin,
      start: true
    },
  ]
  },
  dom:{
    createContainer: true
  },
  pixelArt:true,
  scene:[LoadingScene,InGameScene]
}

let game;

const start=()=>{
  game = new Phaser.Game(config);
}

start();