import { Player } from "../Player";
import { ImageManager } from "./ImageManager";
import { TextManager } from "./TextManager";
import { Pokemon } from "../Pokemon";

class PlayerManager{
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

    public setOtherPlayersInfo(players:object){
        this.players = players;
        console.log(this.players);
    }
    public setOtherPlayerInfo(player:object){
        this.players[player['socketId']] = player;
    }
    public getOtherPlayerInfo():object{
        return this.players;
    }
    public createPlayer(imageManager:ImageManager,textManager:TextManager,playerInfo:object,isPlayer:boolean):Player{
        return new Player(
            imageManager.createPlayerSprite(playerInfo['spriteIndex'],isPlayer),
            new Phaser.Math.Vector2(playerInfo['player_x'],playerInfo['player_y']),
            textManager.addText(playerInfo['player_x'],playerInfo['player_y'],playerInfo['nickname']),
            new Pokemon(
                imageManager.createPetSprite(playerInfo['pokedex']),
                new Phaser.Math.Vector2(playerInfo['pet_x'],playerInfo['pet_y'])
            )
        );
    }
}

export default new PlayerManager();