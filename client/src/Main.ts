import * as Phaser from 'phaser';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT =600;

class NicknameScene extends Phaser.Scene{
  constructor(){
      super({key: 'NicknameScene'});
  }
  preload(){
      console.log('??');
      this.load.html('nicknameform','../client/public/html/nicknameform.html');
  }
  create(){
      const element = this.add.dom(400, 600).createFromCache('nicknameform');
      element.addListener('click');
      element.on('click',function(event){
          if (event.target.name === 'playButton')
          {
              const inputText = this.getChildByName('nameField');
              console.log(inputText.value);
          }
      });
  }
}

class Main extends Phaser.Scene{
    constructor(){super({key:'Main',active: true})}
    preload(){
      console.log('!');
      this.scene.add('NicknameScene',gameConfig);
    }
    create(){
      this.scene.start('NicknameScene');
    }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "PoPoSeop",
  render: {
    antialias: false,
  },
  type: Phaser.AUTO,
  scene: [Main,NicknameScene],
  scale: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  dom: {
    createContainer: true
  },
  backgroundColor: '#4488aa',
  pixelArt:true,
};

const game = new Phaser.Game(gameConfig);

