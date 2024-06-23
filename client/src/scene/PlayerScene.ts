import axios from "axios";
import { KeyControl } from "../KeyControl";
import { BEHAVIOR_STATUS, OBJECT_TYPE } from "../constants/Game";
import EventManager, { EVENTS, SOCKET_EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager"
import PlayerManager from "../manager/PlayerManager";
import { TextManager } from "../manager/TextManager";

export class PlayerScene extends Phaser.Scene{
    constructor(){
        super('PlayerScene');
        console.log('PlayerScene constructor');
    }

    private imageManager: ImageManager;
    private textManager: TextManager;
    private socket:any;

    private keyControl:KeyControl;

    async create(data:object){
        console.log('PlayerScene create');
        
        this.imageManager = data['im'];
        this.textManager = data['tm'];
        this.socket = data['socket'];

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
            if(PlayerManager.getCurrentPlayersInfo()[id].playerObj){
                PlayerManager.getCurrentPlayersInfo()[id].playerObj.movement.update();
            }
        });
    }
}