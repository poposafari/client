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
        playerPosX: 0,
        playerPosY: 0,
        petPosX: 0,
        petPosY: 0,
    }
    public setPlayerInfo(obj:object):void{
        this.playerInfo['pokedex'] = '000';
        this.playerInfo['nickname'] = 'seophohoho';
        this.playerInfo['spriteIndex'] = 1;
        this.playerInfo['money'] = 0;
        this.playerInfo['pokeball'] = 0;
        this.playerInfo['greatball'] = 0;
        this.playerInfo['ultraball'] = 0;
        this.playerInfo['masterball'] = 0;
        this.playerInfo['playerPosX'] = 2;
        this.playerInfo['playerPosY'] = 2;
        this.playerInfo['petPosX'] = 2;
        this.playerInfo['petPosY'] = 1;
    }

    public getPlayerInfo():object{
        return this.playerInfo;
    }
}