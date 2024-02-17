import { OtherPlayerBehavior } from "../OtherPlayerBehavior";
import { Player } from "../Player";
import { PlayerBehavior } from "../PlayerBehavior";
import { Pokemon } from "../Pokemon";
import { WildPokemon } from "../WildPokemon";
import { OverworldScene } from "../scene/OverworldScene";
import { DEPTH, ImageManager } from "./ImageManager";

export class PlayerManagement{
    constructor(){}
    
    private players:object={};
    private playerInfo:object={
        socketId: null,
        pokedex: '000',
        nickname: '',
        spriteIndex: 1,
        money: 0,
        pokeball: 0,
        greatball: 0,
        ultraball: 0,
        masterball: 0,
        player_x: 0,
        player_y: 0,
        pet_x: 0,
        pet_y: 0,
    }

    public setPlayerInfo(socketId:any,obj:object):void{
        this.playerInfo['socketId'] = socketId;
        this.playerInfo['pokedex'] = obj['pokedex'];
        this.playerInfo['nickname'] = obj['nickname'];
        this.playerInfo['spriteIndex'] = obj['sprite'];
        this.playerInfo['money'] = obj['money'];
        this.playerInfo['pokeball'] = obj['pokeball'];
        this.playerInfo['greatball'] = obj['greatball'];
        this.playerInfo['ultraball'] = obj['ultraball'];
        this.playerInfo['masterball'] = obj['masterball'];
        this.playerInfo['player_x'] = obj['player_x'];
        this.playerInfo['player_y'] = obj['player_y'];
        this.playerInfo['pet_x'] = obj['pet_x'];
        this.playerInfo['pet_y'] = obj['pet_y'];
    }
    public getPlayerInfo():object{
        return this.playerInfo;
    }
    public getSocketId(){
        return this.playerInfo['socketId'];
    }
    public getBehavior():PlayerBehavior{
        return this.players[this.playerInfo['socketId']]['behavior'];
    }
    public getOtherPlayerInfo(socketId:string):object{
        return this.players[socketId];
    }
    public setPlayers(players:object):void{
        this.players = players;
    } 8
    public getPlayers():object{
        return this.players;
    }
    public addPlayer(scene:Phaser.Scene,imageManagement:ImageManager,player:object,socket:any,wildPokemonList:Array<WildPokemon>){
        player['playerObj'] = new Player(
            imageManagement.createPlayerSprite(player['spriteIndex']),
            new Phaser.Math.Vector2(player['player_x'],player['player_x']),
            scene.add.text(player['player_x'],player['player_y'],player['nickname'],{fontSize:13,color: '#fff',backgroundColor:'#000000'}),
            new Pokemon(
                imageManagement.createPetSprite(player['pokedex']),
                new Phaser.Math.Vector2(player['pet_x'],player['pet_y'])
            ),
        );
        player['behavior'] = new PlayerBehavior(socket,player['playerObj'],imageManagement,wildPokemonList);
        player['behavior'].create();
    }
    public addOtherPlayer(scene:Phaser.Scene,imageManagement:ImageManager,player:object,socket:any,wildPokemonList:Array<WildPokemon>){
        player['playerObj'] = new Player(
            imageManagement.createOtherPlayerSprite(player['spriteIndex']),
            new Phaser.Math.Vector2(player['player_x'],player['player_y']),
            scene.add.text(player['player_x'],player['player_y'],player['nickname'],{fontSize:13,color: '#fff',backgroundColor:'#000000'}),
            new Pokemon(
                imageManagement.createPetSprite(player['pokedex']),
                new Phaser.Math.Vector2(player['pet_x'],player['pet_y'])
            ),
        );
        player['behavior'] = new OtherPlayerBehavior(socket,player['playerObj'],imageManagement,wildPokemonList);
        player['behavior'].create();
    }
    public addNewPlayer(player:object){
        this.players[player['socketId']] = player;
        console.log(this.players[player['socketId']]);
    }
    public destoryPlayer(socketId:string){
        this.players[socketId].playerObj.destoryAll();
        delete this.players[socketId];
    }
    public setBehavior(data:object){
        if(this.players[data['socketId']]['behavior'].isReadyBehavior()){
            this.players[data['socketId']]['behavior'].setBehavior(data);
        }
    }
    public behaviorUpdate(){
        Object.keys(this.players).forEach((id)=>{
            if(this.players[id]['socketId'] != this.getSocketId()){
                if(this.players[id]['behavior']){
                  this.players[id]['behavior'].update();
                  if(this.players[id]['playerObj'].getTilePos().x === this.players[id].playerObj.getTilePos().x){
                    if(this.players[this.playerInfo['socketId']]['playerObj'].getTilePos().y+1 === this.players[id].playerObj.getTilePos().y){
                        this.players[this.playerInfo['socketId']]['playerObj'].setDepthPlayerAndPet(DEPTH.PLAYER_MIN,DEPTH.PET);
                        this.players[id].playerObj.setDepthPlayerAndPet(DEPTH.PLAYER_MIDDLE,DEPTH.PET);
                    }
                    if(this.players[this.playerInfo['socketId']]['playerObj'].getTilePos().y-1 === this.players[id].playerObj.getTilePos().y){
                        this.players[this.playerInfo['socketId']]['playerObj'].setDepthPlayerAndPet(DEPTH.PLAYER_MAX,DEPTH.PET);
                        this.players[id].playerObj.setDepthPlayerAndPet(DEPTH.PLAYER_MIDDLE,DEPTH.PET);
                    }
                  }
                  else{
                    this.players[this.playerInfo['socketId']]['playerObj'].setDepthPlayerAndPet(DEPTH.PLAYER_MIDDLE,DEPTH.PET);
                    this.players[id].playerObj.setDepthPlayerAndPet(DEPTH.PLAYER_MIDDLE,DEPTH.PET);
                  }
                }
            }
        });
    }
}