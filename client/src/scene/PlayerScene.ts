import { KeyControl } from "../KeyControl";
import { BEHAVIOR_STATUS, OBJECT_TYPE } from "../constants/Game";
import EventManager, { EVENTS, SOCKET_EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager"
import PlayerManager from "../manager/PlayerManager";
import { TextManager } from "../manager/TextManager";

export class PlayerScene extends Phaser.Scene{
    constructor(){
        super('PlayerScene');
    }

    private imageManager: ImageManager;
    private textManager: TextManager;

    private keyControl:KeyControl;

    create(data:object){
        this.imageManager = data['im'];
        this.textManager = data['tm'];
        Object.keys(PlayerManager.getCurrentPlayersInfo()).forEach((id)=>{
            if(PlayerManager.getCurrentPlayersInfo()[id].socketId === PlayerManager.getPlayerInfo()['socketId']){
                PlayerManager.getCurrentPlayersInfo()[id].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getCurrentPlayersInfo()[id],true);
                PlayerManager.getCurrentPlayersInfo()[id].playerObj.setNicknamePosition(PlayerManager.getCurrentPlayersInfo()[id].playerObj.getPosition());
                this.keyControl = new KeyControl(this.input,PlayerManager.getCurrentPlayersInfo()[id].playerObj);
            }
            else{
                PlayerManager.getCurrentPlayersInfo()[id].playerObj = PlayerManager.createPlayer(this.imageManager,this.textManager,PlayerManager.getCurrentPlayersInfo()[id],false);
                PlayerManager.getCurrentPlayersInfo()[id].playerObj.setNicknamePosition(PlayerManager.getCurrentPlayersInfo()[id].playerObj.getPosition());
            }
        });
    }

    update(){
        if(this.keyControl){this.keyControl.update();}
        Object.keys(PlayerManager.getCurrentPlayersInfo()).forEach((id)=>{
            PlayerManager.getCurrentPlayersInfo()[id].playerObj.movement.update();
        });
    }
}