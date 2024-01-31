import * as Phaser from "phaser";
import { ImageManagement } from "./ImageManagement";
import { KeyControl } from "./KeyControl"
import { Player } from "./Player";
import { PlayerBehavior } from "./PlayerBehavior";
import { WildPokemonBehavior } from "./WildPokemonBehavior";
import { WildPokemon } from "./WildPokemon";
import {io} from 'socket.io-client';
import { Pokemon } from "./Pokemon";

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
  private petPokdex: string = '001';
  private spriteType: number = null;
  private socket:any = null;

  private players:object={};
  
  public preload(){
    this.imageManagement = new ImageManagement(this);
    this.imageManagement.loadMapImage();
    this.imageManagement.loadPlayerImage();
    this.imageManagement.loadPlayerAnimation();
    this.imageManagement.loadItemImage();
    this.imageManagement.loadPokemonImage();
    this.imageManagement.loadPokemonAnimation();
    //axios로 사용자 정보 가져와야 함.
    this.nickname = 'seophohoho';
    this.lastTilePosX = Phaser.Math.Between(1,10);
    this.lastTilePosY = Phaser.Math.Between(1,10);
    this.petPokdex = '000';
    this.spriteType = 8;
    this.socket = io('/game');
  }
  public create(){
    this.imageManagement.createMap();
    this.socket.emit('newPlayer',{
      socketId:this.socket.id,
      nickname:this.nickname,
      tilePosX:this.lastTilePosX,
      tilePosY:this.lastTilePosY,
      petPokdex:this.petPokdex,
      spriteType:this.spriteType
    });
    this.socket.on('currentPlayers',(players:object)=>{
      Object.keys(players).forEach((id)=>{
          if(players[id].socketId === this.socket.id){
            const playerSprite = this.imageManagement.createPlayerSprite(`player_${players[id].spriteType}_movement`);
            const petSprite = this.imageManagement.createPetSprite(players[id].petPokedex);
            this.player = new Player(
              playerSprite,
              new Phaser.Math.Vector2(players[id].tilePosX, players[id].tilePosY),
              this.add.text(0,0,players[id].nickname,{fontSize:13,color: '#fff',backgroundColor:'#000000'}),
              petSprite,
              new Pokemon(petSprite,new Phaser.Math.Vector2(players[id].tilePosX, players[id].tilePosY+1)),
            )
          } 
          else{
            const playerSprite = this.imageManagement.createOtherPlayerSprite(`player_${players[id].spriteType}_movement`);
            const petSprite = this.imageManagement.createPetSprite(players[id].petPokedex);
            this.players[players[id].socketId] = new Player(
              playerSprite,
              new Phaser.Math.Vector2(players[id].tilePosX, players[id].tilePosY),
              this.add.text(0,0,players[id].nickname,{fontSize:13,color: '#fff',backgroundColor:'#000000'}),
              petSprite,
              new Pokemon(petSprite,new Phaser.Math.Vector2(players[id].tilePosX, players[id].tilePosY+1)),
            );
          }
        })
      });
      this.socket.on('newPlayer',(player:object)=>{
        const playerSprite = this.imageManagement.createOtherPlayerSprite(`player_${player['spriteType']}_movement`); 
        const petSprite = this.imageManagement.createPetSprite(player['petPokedex']);
        this.players[player['socketId']] = new Player(
          playerSprite,
          new Phaser.Math.Vector2(player['tilePosX'], player['tilePosY']),
          this.add.text(0,0,player['nickname'],{fontSize:13,color: '#fff',backgroundColor:'#000000'}),
          petSprite,
          new Pokemon(petSprite,new Phaser.Math.Vector2(player['tilePosX'], player['tilePosY']+1)),
        )
        console.log(this.players);
      });
      this.socket.on('playerDisconnect',(socketId:string)=>{
        this.players[socketId].sprite.destroy();
        this.players[socketId].petSprite.destroy();
      });
    // this.playerBehavior = new PlayerBehavior(this.player,this.imageManagement,this.wildPokemonList);
    // this.keyControl = new KeyControl(this.input,this.playerBehavior);
    // this.playerBehavior.create();  
    // this.wildPokemonBehavior = new WildPokemonBehavior(this.player,this.imageManagement,this.wildPokemonList,this.time);
    // this.wildPokemonBehavior.create();
  }
  update(_time: number, delta: number) { //최적화할때, 키보드 값이 들어갈때만 업데이트가 진행되도록 한다.
    // this.keyControl.update();
    // // this.wildPokemonBehavior.update();
    // this.playerBehavior.update();
  }
}