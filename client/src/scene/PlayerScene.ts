import { Player } from "../Player";
import EventManager, { EVENTS, SOCKET_EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager"
import PlayerManager from "../manager/PlayerManager";
import { TextManager } from "../manager/TextManager";
import { InitScene } from "./InitScene";

export class PlayerScene extends Phaser.Scene{
    constructor(){
        super('PlayerScene');
    }

    private imageManager: ImageManager;
    private textManager: TextManager;

    init(){
        EventManager.onEvent(EVENTS.ADD_PLAYER,(playerInfo)=>{
            PlayerManager.addCurrentPlayers(playerInfo[0].socketId);
            PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId],false);
            PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId].playerObj.setNicknamePosition(PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId].playerObj.getPosition());
        });
        EventManager.onEvent(EVENTS.REMOVE_PLAYER,(playerInfo)=>{
            PlayerManager.getCurrentPlayersInfo()[playerInfo[0]].playerObj.destoryAll();
            PlayerManager.deletePlayer(playerInfo[0]);
        });
    }
    create(data:object){
        this.imageManager = data['im'];
        this.textManager = data['tm'];
        Object.keys(PlayerManager.getCurrentPlayersInfo()).forEach((id)=>{
            if(PlayerManager.getCurrentPlayersInfo()[id].socketId === PlayerManager.getPlayerInfo()['socketId']){
                PlayerManager.getCurrentPlayersInfo()[id].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getCurrentPlayersInfo()[id],true);
                PlayerManager.getCurrentPlayersInfo()[id].playerObj.setNicknamePosition(PlayerManager.getCurrentPlayersInfo()[id].playerObj.getPosition());
            }
            else{
                PlayerManager.getCurrentPlayersInfo()[id].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getCurrentPlayersInfo()[id],false);
                PlayerManager.getCurrentPlayersInfo()[id].playerObj.setNicknamePosition(PlayerManager.getCurrentPlayersInfo()[id].playerObj.getPosition());
            }
        });
    }
}