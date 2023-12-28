import * as Phaser from "phaser";
import { Player } from "./Player";
import { Direction } from "./Direction";
import { Movements } from "./Movements";
import { MovementControls } from "./MovementControls";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 600;

export class GameScene extends Phaser.Scene {
  static readonly TILE_SIZE = 32;

  private readonly PLAYER_WALK_FRAMERATE=6; //6
  private readonly PLAYER_RUN_FRAMERATE=0; //5
  private readonly PLAYER_WALK_DELAY=0;
  private readonly PLAYER_RUN_DELAY=0;

  private readonly PET_FRAMERATE=6;
  private readonly PET_DELAY = 0;

  private moveControls: MovementControls;
  private movements: Movements;
  
  //private timerEvent:Phaser.Time.TimerEvent;
  
  constructor() {
    super(sceneConfig);
  }
  public preload() {
    this.load.image("nature_1","assets/map/nature_1.png");
    this.load.image("pokeball","assets/character/ball.png");
    //this.load.image("nature_2","assets/map/nature_2.png");
    this.load.tilemapTiledJSON("test-town-map","assets/map/test_map_grid.json");
    this.load.atlas('player','assets/character/player_girl_0.png','assets/character/player_girl_0.json');
    this.load.atlas('pet','assets/pokemon/132.png','assets/pokemon/001.json');
  }
  public create() {
    this.time.addEvent({ delay: 1000, loop: true });
    const testTilemap = this.make.tilemap({ key: "test-town-map" });
    testTilemap.addTilesetImage("nature_1", "nature_1");

    testTilemap.createLayer(0,"nature_1",0,0);
    testTilemap.createLayer(1,"nature_1",0,0);

    const playerSprite = this.add.sprite(0, 0, "player");
    const petSprite = this.add.sprite(0,1,"pet");
    const ballSprite = this.add.sprite(1,0,"pokeball");
    playerSprite.setDepth(1); //z-index++.
    ballSprite.setDepth(1);
    petSprite.setDepth(0);

    ballSprite.setVisible(false);

    this.cameras.main.startFollow(playerSprite);
    this.cameras.main.roundPixels = true; 

    const player = new Player(playerSprite,new Phaser.Math.Vector2(3, 2));
    const pet = new Player(petSprite,new Phaser.Math.Vector2(2, 2));
    const ball = new Player(ballSprite,new Phaser.Math.Vector2(4, 2));
    
    this.movements = new Movements(player,pet,playerSprite,petSprite,ballSprite,testTilemap);
    this.moveControls = new MovementControls(this.input, this.movements);

    const playerFrames = this.anims.generateFrameNames('player',{
      prefix:'player_girl_0-',
      suffix:"",
      start:0,
      end:23,
    });

    const petFrames = this.anims.generateFrameNames('pet',{
      prefix:'001-',
      suffix:"",
      start:0,
      end:15,
    });
  
    const playerCustomFrameWalkUp = [
      [playerFrames[1],playerFrames[0]],
      [playerFrames[2],playerFrames[0]]
    ];
    const playerCustomFrameWalkDown = [
      [playerFrames[4],playerFrames[3]],
      [playerFrames[5],playerFrames[3]]
    ];
    const playerCustomFrameWalkLeft = [
      [playerFrames[7],playerFrames[6]],
      [playerFrames[8],playerFrames[6]]
    ];
    const playerCustomFrameWalkRight = [
      [playerFrames[10],playerFrames[9]],
      [playerFrames[11],playerFrames[9]]
    ];
    const playerCustomFrameRunUp = [
      [playerFrames[13],playerFrames[12]],
      [playerFrames[14],playerFrames[12]],
      [playerFrames[12],playerFrames[12]]
    ];
    const playerCustomFrameRunDown = [
      [playerFrames[16],playerFrames[15]],
      [playerFrames[17],playerFrames[15]],
      [playerFrames[15],playerFrames[15]]
    ];
    const playerCustomFrameRunLeft = [
      [playerFrames[19],playerFrames[18]],
      [playerFrames[20],playerFrames[18]],
      [playerFrames[18],playerFrames[18]]
    ];
    const playerCustomFrameRunRight = [
      [playerFrames[22],playerFrames[21]],
      [playerFrames[23],playerFrames[21]],
      [playerFrames[21],playerFrames[21]]
    ];

    const petCustomFrameMovementDown = [
      [petFrames[0],petFrames[1],petFrames[2],petFrames[3]],
    ];
    const petCustomFrameMovementLeft = [
      [petFrames[4],petFrames[5],petFrames[6],petFrames[7]],
    ];
    const petCustomFrameMovementRight = [
      [petFrames[8],petFrames[9],petFrames[10],petFrames[11]],
    ];
    const petCustomFrameMovementUp = [
      [petFrames[12],petFrames[13],petFrames[14],petFrames[15]],
    ];
    //sprite(player) walk frames.
    this.createPlayerAnimation(Direction.WALK_UP_1, playerCustomFrameWalkUp[0],this.PLAYER_WALK_FRAMERATE,this.PLAYER_WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_UP_2, playerCustomFrameWalkUp[1],this.PLAYER_WALK_FRAMERATE,this.PLAYER_WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_DOWN_1, playerCustomFrameWalkDown[0],this.PLAYER_WALK_FRAMERATE,this.PLAYER_WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_DOWN_2, playerCustomFrameWalkDown[1],this.PLAYER_WALK_FRAMERATE,this.PLAYER_WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_LEFT_1, playerCustomFrameWalkLeft[0],this.PLAYER_WALK_FRAMERATE,this.PLAYER_WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_LEFT_2, playerCustomFrameWalkLeft[1],this.PLAYER_WALK_FRAMERATE,this.PLAYER_WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_RIGHT_1, playerCustomFrameWalkRight[0],this.PLAYER_WALK_FRAMERATE,this.PLAYER_WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_RIGHT_2, playerCustomFrameWalkRight[1],this.PLAYER_WALK_FRAMERATE,this.PLAYER_WALK_DELAY);

    //sprite(player) run frames.
    this.createPlayerAnimation(Direction.RUN_UP_1, playerCustomFrameRunUp[0],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_UP_2, playerCustomFrameRunUp[1],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_UP_3, playerCustomFrameRunUp[2],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    
    this.createPlayerAnimation(Direction.RUN_DOWN_1, playerCustomFrameRunDown[0],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_DOWN_2, playerCustomFrameRunDown[1],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_DOWN_3, playerCustomFrameRunDown[2],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);

    this.createPlayerAnimation(Direction.RUN_LEFT_1, playerCustomFrameRunLeft[0],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_LEFT_2, playerCustomFrameRunLeft[1],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_LEFT_3, playerCustomFrameRunLeft[2],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    
    this.createPlayerAnimation(Direction.RUN_RIGHT_1, playerCustomFrameRunRight[0],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_RIGHT_2, playerCustomFrameRunRight[1],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_RIGHT_3, playerCustomFrameRunRight[2],this.PLAYER_RUN_FRAMERATE,this.PLAYER_RUN_DELAY);
    
    //sprite(follow pokemon) movement frames.
    this.createPlayerAnimation(Direction.PET_DOWN, petCustomFrameMovementDown[0],this.PET_FRAMERATE,this.PET_DELAY);
    this.createPlayerAnimation(Direction.PET_LEFT, petCustomFrameMovementLeft[0],this.PET_FRAMERATE,this.PET_DELAY);
    this.createPlayerAnimation(Direction.PET_RIGHT, petCustomFrameMovementRight[0],this.PET_FRAMERATE,this.PET_DELAY);
    this.createPlayerAnimation(Direction.PET_UP, petCustomFrameMovementUp[0],this.PET_FRAMERATE,this.PET_DELAY);
    
    // this.timerEvent = this.time.addEvent({
    //   delay: 10, // 0.5ms
    //   loop: true, // 반복 실행 여부
    //   callback: this.test, // 실행할 콜백 함수
    //   callbackScope: this // 콜백 함수의 컨텍스트 설정 (여기서는 현재 씬)
    // });
  }
  // public test(){
  //   // another loop.
  // }
  public update(_time: number, delta: number) { //최적화할때, 키보드 값이 들어갈때만 업데이트가 진행되도록 한다.
    this.moveControls.update();
    this.movements.playerUpdate();
  }
  private createPlayerAnimation(
    name: string,
    frames: Phaser.Types.Animations.AnimationFrame[],
    frameRate: number,
    delay: number
  ) {
    this.anims.create({
      key: name,
      frames: frames,
      frameRate: frameRate,
      repeat: -1,
      delay:delay,
      yoyo:false
    });
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "Poke-Town",
  render: {
    antialias: false,
  },
  type: Phaser.AUTO,
  scene: GameScene,
  scale: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: "game",
  backgroundColor: "#48C4F8",
  pixelArt:true
};

export const game = new Phaser.Game(gameConfig);