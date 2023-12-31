import * as Phaser from "phaser";
import { Player } from "./Player";
import { Pet } from "./Pet";
import { Item } from "./Item";
import { SpriteAnimation } from "./SpriteAnimation";
import { KeyControl } from "./KeyControl"
import { Behavior } from "./Behavior";
import { PlayerMovements } from "./PlayerMovements";
import { PetMovements } from "./PetMovements";
import { ItemMovements } from "./ItemMovements";

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT =600;

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};

export class GameScene extends Phaser.Scene {
  constructor(){ super(sceneConfig) }

  static readonly TILE_SIZE = 32;

  private keyControl: KeyControl;
  private behavior: Behavior;
  private playerMovement: PlayerMovements;
  private petMovement: PetMovements;
  private itemMovement: ItemMovements;

  public preload(){
    this.load.image("nature_1","assets/map/nature_1.png");
    this.load.image("pokeball","assets/character/ball.png");
    this.load.tilemapTiledJSON("test-town-map","assets/map/test_map_grid.json");
    this.load.atlas('player','assets/character/player_girl_0.png','assets/character/player_girl_0.json');
    this.load.atlas('pet','assets/pokemon/025.png','assets/pokemon/001.json');
  }
  public create(){
    const map = this.make.tilemap({ key: "test-town-map" });
    map.addTilesetImage("nature_1", "nature_1");
    map.createLayer(0,"nature_1",0,0);
    map.createLayer(1,"nature_1",0,0);

    const playerSprite = this.add.sprite(0, 0, "player");
    const petSprite = this.add.sprite(0,1,"pet");
    const pokeballSprite = this.add.sprite(0,0,"pokeball");

    playerSprite.setDepth(0);
    pokeballSprite.setDepth(0);
    petSprite.setDepth(1);

    petSprite.visible = false; //false..?
    this.cameras.main.startFollow(playerSprite);
    this.cameras.main.roundPixels = true; 
    
    const spriteAnimation = new SpriteAnimation(this);
    const pet = new Pet(petSprite,new Phaser.Math.Vector2(3,3));
    this.petMovement = new PetMovements(pet);

    const player = new Player(playerSprite,new Phaser.Math.Vector2(3, 2));
    this.playerMovement = new PlayerMovements(player,pet,this.petMovement,map);

    const item = new Item(pokeballSprite,new Phaser.Math.Vector2(0, 0));
    this.itemMovement = new ItemMovements(item,this.playerMovement);
    
    this.behavior = new Behavior(player,this.playerMovement,playerSprite,petSprite,this.itemMovement);
    this.keyControl = new KeyControl(this.input,this.behavior);
  }
  public update(_time: number, delta: number) { //최적화할때, 키보드 값이 들어갈때만 업데이트가 진행되도록 한다.
    this.keyControl.update();
    this.behavior.update();
    this.playerMovement.update();
    this.petMovement.update();
    this.itemMovement.update();
  }
}

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: "PoPoSeop",
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