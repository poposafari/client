import { Behavior } from "../Behavior";
import { KeyControl } from "../KeyControl";
import { Player } from "../Player";
import { OBJECT_TYPE } from "../constants/Game";
import EventManager, { EVENTS, SOCKET_EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager"
import PlayerManager from "../manager/PlayerManager";
import { TextManager } from "../manager/TextManager";
import { InitScene } from "./InitScene";
import { MapScene } from "./MapScene";

export class PlayerScene extends Phaser.Scene{
    constructor(){
        super('PlayerScene');
    }

    private mapScene:Phaser.Scene;
    private map:Phaser.Tilemaps.Tilemap;

    private imageManager: ImageManager;
    private textManager: TextManager;

    private keyControl:KeyControl;

    init(){
        EventManager.onEvent(EVENTS.ADD_PLAYER,(playerInfo)=>{
            PlayerManager.addCurrentPlayers(playerInfo[0].socketId);
            PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId],false);
            PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId].playerObj.setNicknamePosition(PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId].playerObj.getPosition());
            PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId].behavior = new Behavior(OBJECT_TYPE.PLAYER,PlayerManager.getCurrentPlayersInfo()[playerInfo[0].socketId].playerObj);
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
                PlayerManager.getCurrentPlayersInfo()[id].behavior = new Behavior(OBJECT_TYPE.PLAYER,PlayerManager.getCurrentPlayersInfo()[id].playerObj);
                this.keyControl = new KeyControl(this.input,PlayerManager.getCurrentPlayersInfo()[id].behavior);
            }
            else{
                PlayerManager.getCurrentPlayersInfo()[id].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getCurrentPlayersInfo()[id],false);
                PlayerManager.getCurrentPlayersInfo()[id].playerObj.setNicknamePosition(PlayerManager.getCurrentPlayersInfo()[id].playerObj.getPosition());
                PlayerManager.getCurrentPlayersInfo()[id].behavior = new Behavior(OBJECT_TYPE.PLAYER,PlayerManager.getCurrentPlayersInfo()[id].playerObj);
            }
        });
    }
    update(){
        if(this.keyControl){this.keyControl.update()}

        Object.keys(PlayerManager.getCurrentPlayersInfo()).forEach((id)=>{
            PlayerManager.getCurrentPlayersInfo()[id].behavior.update();
        });
    }
}