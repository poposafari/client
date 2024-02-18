import { Player } from "../Player";
import EventManager, { EVENTS, SOCKET_EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager"
import PlayerManager from "../manager/PlayerManager";
import { TextManager } from "../manager/TextManager";

export class PlayerScene extends Phaser.Scene{
    constructor(){
        super('PlayerScene');
        this.textManager = new TextManager(this);
    }

    private imageManager: ImageManager;
    private textManager: TextManager;

    create(data:object){
        this.imageManager = data['im'];
        Object.keys(PlayerManager.getOtherPlayerInfo()).forEach((id)=>{
            if(PlayerManager.getOtherPlayerInfo()[id].socketId === PlayerManager.getPlayerInfo()['socketId'].socketId){
                PlayerManager.getOtherPlayerInfo()[id].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getOtherPlayerInfo()[id],true);
            }
            else{
                PlayerManager.getOtherPlayerInfo()[id].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getOtherPlayerInfo()[id],false);
            }
        });
    }
}