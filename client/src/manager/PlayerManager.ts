import { Player } from "../Player";
import { ImageManager } from "./ImageManager";
import { TextManager } from "./TextManager";
import { Pokemon } from "../Pokemon";
import { OBJECT_TYPE } from "../constants/Game";

class PlayerManager{
    constructor(){}
    
    private players:object={};
    private playersWaitQueue:object={};
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

    public setCurrentPlayersInfo(players:object){
        this.players = players;
    }
    public setOtherPlayersWaitQueue(player:object){
        this.playersWaitQueue[player['socketId']] = player;
    }
    public getOtherPlayersWaitQueue():object{
        return this.playersWaitQueue;
    }
    public getCurrentPlayersInfo():object{
        return this.players;
    }
    public addCurrentPlayers(socketId:string){
        this.players[socketId] = this.playersWaitQueue[socketId];
        delete this.playersWaitQueue[socketId];
    }
    public deletePlayer(socketId:string){
        delete this.players[socketId];
    }
    public createPlayer(imageManager:ImageManager,textManager:TextManager,playerInfo:object,isPlayer:boolean):Player{
        return new Player(
            imageManager.createPlayerSprite(playerInfo['spriteIndex'],isPlayer),
            new Phaser.Math.Vector2(playerInfo['player_x'],playerInfo['player_y']),
            textManager.addText(0,0,playerInfo['nickname']),
            new Pokemon(
                imageManager.createPetSprite(playerInfo['pokedex']),
                new Phaser.Math.Vector2(playerInfo['pet_x'],playerInfo['pet_y'])
            ),
            OBJECT_TYPE.PLAYER
        );
    }
}

export default new PlayerManager();