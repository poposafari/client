import * as Phaser from "phaser";
import { ImageManagement } from "./ImageManagement";
import { KeyControl } from "./KeyControl"
import { Player } from "./Player";
import { PlayerBehavior } from "./PlayerBehavior";
import { WildPokemonBehavior } from "./WildPokemonBehavior";
import { WildPokemon } from "./WildPokemon";


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
  static readonly MAX_WILDPOKEMON = 4;

  private imageManagement: ImageManagement;
  private keyControl: KeyControl;

  private player: Player;
  private playerBehavior: PlayerBehavior;
  private wildPokemonBehavior: WildPokemonBehavior;
  private wildPokemonList: Array<WildPokemon>=[];
  
  public preload(){
    this.imageManagement = new ImageManagement(this);
    this.imageManagement.loadMapImage();
    this.imageManagement.loadPlayerImage();
    this.imageManagement.loadItemImage();
    this.imageManagement.loadPokemonImage();
  }
  public create(){
    this.imageManagement.createMap();
    this.imageManagement.createPlayerSprite();

    this.player = new Player(this.imageManagement.playerSprite,new Phaser.Math.Vector2(4, 3));
    this.playerBehavior = new PlayerBehavior(this.player,this.imageManagement,this.wildPokemonList);
    this.wildPokemonBehavior = new WildPokemonBehavior(this.player,this.imageManagement,this.wildPokemonList,this.time);
    this.keyControl = new KeyControl(this.input,this.playerBehavior);
    this.playerBehavior.create();
    this.wildPokemonBehavior.create();
  }
  public update(_time: number, delta: number) { //최적화할때, 키보드 값이 들어갈때만 업데이트가 진행되도록 한다.
    this.keyControl.update();
    this.wildPokemonBehavior.update();
    this.playerBehavior.update();
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