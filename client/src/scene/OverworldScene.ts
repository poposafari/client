import * as Phaser from "phaser";
import { DEPTH, ImageManager } from "../manager/ImageManager";
// import { KeyControl } from "../KeyControl"
// import { Player } from "../Player";
// import { PlayerBehavior } from "../PlayerBehavior";
// import { WildPokemonBehavior } from "../WildPokemonBehavior";
// import { WildPokemon } from "../WildPokemon";
// import { OtherPlayerBehavior } from "../OtherPlayerBehavior";
import  PlayerManager  from "../manager/PlayerManager";

export class OverworldScene extends Phaser.Scene {
  
  constructor(){ super({key: 'OverworldScene'}) }

  // private imageManagement: ImageManager;

  // private socket: any;
  // private keyControl: KeyControl;

  // private player: Player;
  // private playerBehavior: PlayerBehavior;

  // private wildPokemonBehavior: WildPokemonBehavior;
  // private wildPokemonList: Array<WildPokemon>=[];

  // public init(data:object){
  //   this.socket = data['socket'];
  // }
  // public preload(){
  //   this.imageManagement = new ImageManager(this);
  // }
  // public async create(){
  //   this.imageManagement.createMap();


    // this.socket.on('newPlayer',(player:object)=>{
    //   this.playerManagement.addNewPlayer(player);
    //   this.playerManagement.addOtherPlayer(this,this.imageManagement,player,this.socket,this.wildPokemonList);
    // });

    // this.socket.on('playerDisconnect',(socketId:string)=>{
    //   this.playerManagement.destoryPlayer(socketId);
    // });

    // this.socket.on('playerBehavior',(data:object)=>{
    //   this.playerManagement.setBehavior(data);
    // });

  //   // this.playerBehavior = this.playerManagement.getBehavior();
  //   this.keyControl = new KeyControl(this.input,this.playerBehavior);
  //   this.wildPokemonBehavior = new WildPokemonBehavior(this.player,this.imageManagement,this.wildPokemonList,this.time);
  //   this.wildPokemonBehavior.create();
  // }
  // update(_time: number, delta: number) { //최적화할때, 키보드 값이 들어갈때만 업데이트가 진행되도록 한다.
  //   if(this.keyControl){this.keyControl.update();}
  //   if(this.playerBehavior){this.playerBehavior.update();}
  //   if(this.wildPokemonBehavior){this.wildPokemonBehavior.update();}
  //   // this.playerManagement.behaviorUpdate();
  // }
}