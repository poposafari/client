import * as Phaser from "phaser";
import { DEPTH, ImageManagement } from "../management/ImageManagement";
import { KeyControl } from "../KeyControl"
import { Player } from "../Player";
import { PlayerBehavior } from "../PlayerBehavior";
import { WildPokemonBehavior } from "../WildPokemonBehavior";
import { WildPokemon } from "../WildPokemon";
import { Pokemon } from "../Pokemon";
import { OtherPlayerBehavior } from "../OtherPlayerBehavior";
import { PlayerManagement } from "../management/PlayerManagement";

export class OverworldScene extends Phaser.Scene {
  
  constructor(){ super({key: 'OverworldScene'}) }

  static readonly TILE_SIZE = 32;
  static readonly MAX_WILDPOKEMON = 0;

  private playerManagement: PlayerManagement;
  private imageManagement: ImageManagement;

  private socket: any;
  private keyControl: KeyControl;

  private player: Player;
  private playerBehavior: PlayerBehavior;

  private wildPokemonBehavior: WildPokemonBehavior;
  private wildPokemonList: Array<WildPokemon>=[];

  public init(data:object){
    this.playerManagement = data['playerManagement'];
    this.socket = data['socket'];
  }
  public preload(){
    this.imageManagement = new ImageManagement(this);
  }
  public async create(){
    this.imageManagement.createMap();

    Object.keys(this.playerManagement.getPlayers()).forEach((id)=>{
        if(this.playerManagement.getPlayers()[id].socketId === this.playerManagement.getPlayerInfo()['socketId']){
          this.playerManagement.addPlayer(this,this.imageManagement,this.playerManagement.getPlayers()[id],this.socket,this.wildPokemonList);
        }
        else{
          this.playerManagement.addOtherPlayer(this,this.imageManagement,this.playerManagement.getPlayers()[id],this.socket,this.wildPokemonList);
        }
    });

    this.socket.on('newPlayer',(player:object)=>{
      this.playerManagement.addNewPlayer(player);
      this.playerManagement.addOtherPlayer(this,this.imageManagement,player,this.socket,this.wildPokemonList);
    });

    this.socket.on('playerDisconnect',(socketId:string)=>{
      this.playerManagement.destoryPlayer(socketId);
    });

    this.socket.on('playerBehavior',(data:object)=>{
      this.playerManagement.setBehavior(data);
    });
    this.playerBehavior = this.playerManagement.getBehavior();
    this.keyControl = new KeyControl(this.input,this.playerBehavior);
    this.wildPokemonBehavior = new WildPokemonBehavior(this.player,this.imageManagement,this.wildPokemonList,this.time);
    this.wildPokemonBehavior.create();
  }
  update(_time: number, delta: number) { //최적화할때, 키보드 값이 들어갈때만 업데이트가 진행되도록 한다.
    if(this.keyControl){this.keyControl.update();}
    if(this.playerBehavior){this.playerBehavior.update();}
    if(this.wildPokemonBehavior){this.wildPokemonBehavior.update();}
    this.playerManagement.behaviorUpdate();
  }
}