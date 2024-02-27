import axios from "axios";
import EventManager, { EVENTS, SOCKET_EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager";
import PlayerManager from "../manager/PlayerManager";
import {io} from 'socket.io-client';
import { Player } from "../Player";
import { TextManager } from "../manager/TextManager";
import { Behavior } from "../Behavior";
import { OBJECT_TYPE } from "../constants/Game";

export class InitScene extends Phaser.Scene{
    constructor(){
        super({key:'InitScene'});
        this.imageManager = new ImageManager(this);
        this.textManager = new TextManager(this);
        this.socket = io('/game');
    }

    private imageManager:ImageManager;
    private textManager:TextManager;
    
    private season:number;

    private socket:any;

    init(){
        //register Event
        EventManager.onEvent(EVENTS.SEASONSCENE_FIN,()=>{
            this.scene.launch('MapScene',{im:this.imageManager});
            this.scene.launch('PlayerScene',{im:this.imageManager,tm:this.textManager});
        });
        EventManager.onEvent(EVENTS.INITIAL_PLAYER_DATA,(playerData:any)=>{
            PlayerManager.setPlayerInfo(playerData[0],playerData[1]);
            this.socket.emit(SOCKET_EVENTS.CONNECT_PLAYER,PlayerManager.getPlayerInfo());
            this.socket.on(SOCKET_EVENTS.CONNECTED_PLAYERS,(players:object)=>{PlayerManager.setCurrentPlayersInfo(players)});
        });
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
        EventManager.onEvent(EVENTS.MOVEMENT_PLAYER,(data)=>{
            this.socket.emit(SOCKET_EVENTS.EMIT_MOVEMENT_PLAYER,{socketId:this.socket.id,direction:data[0]});
        });
        EventManager.onEvent(EVENTS.MOVEMENT_OTHERPLAYER,(data)=>{
            console.log(data);
            PlayerManager.getCurrentPlayersInfo()[data[0]]['playerObj'].movement.setDirection(data[1]);
        });

        this.socket.on(SOCKET_EVENTS.ON_MOVEMENT_PLAYER,(data:object)=>{
            EventManager.triggerEvent(EVENTS.MOVEMENT_OTHERPLAYER,data['socketId'],data['direction']);
        });
        this.socket.on(SOCKET_EVENTS.CONNECT_PLAYER,(playerData:object)=>{
            PlayerManager.setOtherPlayersWaitQueue(playerData);
            EventManager.triggerEvent(EVENTS.ADD_PLAYER,playerData);
        });
        this.socket.on(SOCKET_EVENTS.DISCONNECT_PLAYER,(socketId:string)=>{
            EventManager.triggerEvent(EVENTS.REMOVE_PLAYER,socketId);
        });
    }
    preload(){
        this.imageManager.loadImageMap();
        this.imageManager.loadImageItem();
        this.imageManager.loadImagePlayer();
        this.imageManager.loadImagePokemon();
    }
    async create(){
        try{
            const res = await axios.get('http://localhost:8081/game/user-info');
            this.season = res.data[0].season;
            EventManager.triggerEvent(EVENTS.INITIAL_PLAYER_DATA,this.socket.id,res.data[0]);
        } catch(error){
            console.error(error);
        }
        this.scene.launch('SeasonScene',{season:this.season});
    }
}
