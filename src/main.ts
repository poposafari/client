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
const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

export class GameScene extends Phaser.Scene {
  static readonly TILE_SIZE = 32;
  private readonly WALK_FRAMERATE=6; //6
  private readonly RUN_FRAMERATE=0; //5
  private readonly WALK_DELAY=0;
  private readonly RUN_DELAY=0;
  private moveControls: MovementControls;
  private movements: Movements;
  
  constructor() {
    super(sceneConfig);
  }

  public preload() {
    this.load.image("nature_1","assets/map/nature_1.png");
    //this.load.image("nature_2","assets/map/nature_2.png");
    this.load.tilemapTiledJSON("test-town-map","assets/map/test_map_grid.json");
    this.load.atlas('player','assets/character/player_girl_0.png','assets/character/player_girl_0.json');
  }

  public create() {
    const testTilemap = this.make.tilemap({ key: "test-town-map" });
    testTilemap.addTilesetImage("nature_1", "nature_1");
    //testTilemap.addTilesetImage("nature_2", "nature_2");

    testTilemap.createLayer(0,"nature_1",0,0);
    testTilemap.createLayer(1,"nature_1",0,0);

    const playerSprite = this.add.sprite(0, 0, "player");
    // playerSprite.setDepth(0); //z-index++.
    // playerSprite.scale = 3; //playerSprite size setting.
    this.cameras.main.startFollow(playerSprite);
    this.cameras.main.roundPixels = true;
    const player = new Player(playerSprite, new Phaser.Math.Vector2(2, 1));

    this.movements = new Movements(player, testTilemap);
    this.moveControls = new MovementControls(this.input, this.movements);

    const playerFrames = this.anims.generateFrameNames('player',{
      prefix:'player_girl_0-',
      suffix:"",
      start:0,
      end:23,
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
      [playerFrames[14],playerFrames[12]]
    ];
    const playerCustomFrameRunDown = [
      [playerFrames[16],playerFrames[15]],
      [playerFrames[17],playerFrames[15]]
    ];
    const playerCustomFrameRunLeft = [
      [playerFrames[19],playerFrames[18]],
      [playerFrames[20],playerFrames[18]]
    ];
    const playerCustomFrameRunRight = [
      [playerFrames[22],playerFrames[21]],
      [playerFrames[23],playerFrames[21]]
    ];

    //sprite(player) walk frames.
    this.createPlayerAnimation(Direction.WALK_UP_1, playerCustomFrameWalkUp[0],this.WALK_FRAMERATE,this.WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_UP_2, playerCustomFrameWalkUp[1],this.WALK_FRAMERATE,this.WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_DOWN_1, playerCustomFrameWalkDown[0],this.WALK_FRAMERATE,this.WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_DOWN_2, playerCustomFrameWalkDown[1],this.WALK_FRAMERATE,this.WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_LEFT_1, playerCustomFrameWalkLeft[0],this.WALK_FRAMERATE,this.WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_LEFT_2, playerCustomFrameWalkLeft[1],this.WALK_FRAMERATE,this.WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_RIGHT_1, playerCustomFrameWalkRight[0],this.WALK_FRAMERATE,this.WALK_DELAY);
    this.createPlayerAnimation(Direction.WALK_RIGHT_2, playerCustomFrameWalkRight[1],this.WALK_FRAMERATE,this.WALK_DELAY);

    //sprite(player) run frames.
    this.createPlayerAnimation(Direction.RUN_UP_1, playerCustomFrameRunUp[0],this.RUN_FRAMERATE,this.RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_UP_2, playerCustomFrameRunUp[1],this.RUN_FRAMERATE,this.RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_DOWN_1, playerCustomFrameRunDown[0],this.RUN_FRAMERATE,this.RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_DOWN_2, playerCustomFrameRunDown[1],this.RUN_FRAMERATE,this.RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_LEFT_1, playerCustomFrameRunLeft[0],this.RUN_FRAMERATE,this.RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_LEFT_2, playerCustomFrameRunLeft[1],this.RUN_FRAMERATE,this.RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_RIGHT_1, playerCustomFrameRunRight[0],this.RUN_FRAMERATE,this.RUN_DELAY);
    this.createPlayerAnimation(Direction.RUN_RIGHT_2, playerCustomFrameRunRight[1],this.RUN_FRAMERATE,this.RUN_DELAY);
  }

  public update(_time: number, delta: number) {
    this.moveControls.update();
    this.movements.playerUpdate(delta);
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
      repeat: 0,
      delay:delay,
      yoyo:false
    });
    if(name.charAt(0) === 'w'){
      this.anims.get(name).frames[0].duration = 10;
      this.anims.get(name).frames[1].duration = 10;
    }
    if(name.charAt(0) === 'r'){
      this.anims.get(name).frames[0].duration = 500;
      this.anims.get(name).frames[1].duration = 500;
    }
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