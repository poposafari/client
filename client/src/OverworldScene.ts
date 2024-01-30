import * as Phaser from "phaser";
import { ImageManagement } from "./ImageManagement";
import { KeyControl } from "./KeyControl"
import { Player } from "./Player";
import { PlayerBehavior } from "./PlayerBehavior";
import { WildPokemonBehavior } from "./WildPokemonBehavior";
import { WildPokemon } from "./WildPokemon";
import {io} from 'socket.io-client';

export class OverworldScene extends Phaser.Scene {
  
  constructor(){ super({key: 'OverworldScene'}) }

  static readonly TILE_SIZE = 32;
  static readonly MAX_WILDPOKEMON = 4;

  private imageManagement: ImageManagement;
  private keyControl: KeyControl;

  private player: Player;
  private playerBehavior: PlayerBehavior;
  private wildPokemonBehavior: WildPokemonBehavior;
  private wildPokemonList: Array<WildPokemon>=[];

  private nickname: string = 'null';
  private lastTilePosX: number = null;
  private lastTilePosY: number = null;
  private petPokdex: string = '000';
  private spriteType: number = null;
  private players:Array<Object> = [];
  private socket:any = null;
  
  public preload(){
    this.imageManagement = new ImageManagement(this);
    this.imageManagement.loadMapImage();
    this.imageManagement.loadPlayerImage();
    this.imageManagement.loadItemImage();
    this.imageManagement.loadPokemonImage();
    //axios로 사용자 정보 가져와야 함.
    this.socket = io('/game');
    this.nickname = 'seophohoho';
    this.lastTilePosX = Phaser.Math.Between(1,10);
    this.lastTilePosY = Phaser.Math.Between(1,10);
    this.petPokdex = '000';
    this.spriteType = 8;
  }
  public create(){
    let temp_players:Array<Object>=[];
    this.imageManagement.createMap();
    this.socket.emit('newPlayer',{
      socketId:this.socket.id,
      nickname:this.nickname,
      tilePosX:this.lastTilePosX,
      tilePosY:this.lastTilePosY,
      petPokdex:this.petPokdex,
      spriteType:this.spriteType
    });
    this.socket.on('currentPlayers',(players:Array<object>)=>{
      for(let i=0;i<players.length;i++){
        if(players[i]['socketId'] === this.socket.id){
          this.imageManagement.createPlayer(`player_${players[i]['spriteType']}_movement`); 
          this.player = new Player(
              this.imageManagement.playerSprite,
              new Phaser.Math.Vector2(players[i]['tilePosX'], players[i]['tilePosY']),
              this.add.text(0,0,players[i]['nickname'],{fontSize:13,color: '#fff',backgroundColor:'#000000'})
            )
        } 
        else{
          this.imageManagement.createPlayer(`player_${players[i]['spriteType']}_movement`); 
          new Player(
              this.imageManagement.playerSprite,
              new Phaser.Math.Vector2(players[i]['tilePosX'], players[i]['tilePosY']),
              this.add.text(0,0,players[i]['nickname'],{fontSize:13,color: '#fff',backgroundColor:'#000000'})
            )
          }
        }
      });
      this.socket.on('newPlayer',(player:object)=>{
        this.imageManagement.createPlayer(`player_${player['spriteType']}_movement`); 
        new Player(
          this.imageManagement.playerSprite,
          new Phaser.Math.Vector2(player['tilePosX'], player['tilePosY']),
          this.add.text(0,0,player['nickname'],{fontSize:13,color: '#fff',backgroundColor:'#000000'})
        )
      });
      // this.imageManagement.createPlayer(`player_${data}_movement`);
      // this.player = new Player(
      // this.imageManagement.playerSprite,
      // new Phaser.Math.Vector2(players[key].tilePosX, players[key].tilePosY),
      // this.add.text(0,0,players[key].nickname,{fontSize:13,color: '#fff',backgroundColor:'#000000'})

    // this.imageManagement.createPlayer(`player_${players[key].spriteType}_movement`);
    // this.player = new Player(
    //   this.imageManagement.playerSprite,
    //   new Phaser.Math.Vector2(players[key].tilePosX, players[key].tilePosY),
    //   this.add.text(0,0,players[key].nickname,{fontSize:13,color: '#fff',backgroundColor:'#000000'})
    // );
    // this.playerBehavior = new PlayerBehavior(this.player,this.imageManagement,this.wildPokemonList);
    // this.keyControl = new KeyControl(this.input,this.playerBehavior);
    // this.playerBehavior.create();  
    // this.wildPokemonBehavior = new WildPokemonBehavior(this.player,this.imageManagement,this.wildPokemonList,this.time);
    // this.wildPokemonBehavior.create();
  }
  update(_time: number, delta: number) { //최적화할때, 키보드 값이 들어갈때만 업데이트가 진행되도록 한다.
    // this.keyControl.update();
    // this.wildPokemonBehavior.update();
    // this.playerBehavior.update();
  }
}