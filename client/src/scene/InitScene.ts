import axios from "axios";
import EventManager, { EVENTS, SOCKET_EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager";
import PlayerManager from "../manager/PlayerManager";
import {io} from 'socket.io-client';
import { Player } from "../Player";
import { TextManager } from "../manager/TextManager";


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
        EventManager.onEvent(EVENTS.SEASONSCENE_END,()=>{
            this.scene.launch('MapScene',{im:this.imageManager});
            this.scene.launch('PlayerScene',{im:this.imageManager,tm:this.textManager});
        });
        EventManager.onEvent(EVENTS.PLAYER_DATA,(playerData:any)=>{
            PlayerManager.setPlayerInfo(playerData[0],playerData[1]);
            this.socket.emit(SOCKET_EVENTS.NEW_PLAYER,PlayerManager.getPlayerInfo());
            this.socket.on(SOCKET_EVENTS.CURRENT_PLAYERS,(players:object)=>{PlayerManager.setCurrentPlayersInfo(players)});
        });
        this.socket.on(SOCKET_EVENTS.NEW_PLAYER,(playerData:object)=>{
            PlayerManager.setOtherPlayersWaitQueue(playerData);
            EventManager.triggerEvent(EVENTS.ADD_PLAYER,playerData);
        });
        this.socket.on(SOCKET_EVENTS.DISCONNECT_PLAYER,(socketId:string)=>{
            EventManager.triggerEvent(EVENTS.REMOVE_PLAYER,socketId);
        });
    }
    preload(){
        this.imageManager.loadMapImage();
        this.imageManager.loadItemImage();
        this.imageManager.loadPlayerImage();
        this.imageManager.loadPokemonImage();
    }
    async create(){
        try{
            const res = await axios.get('http://localhost:8081/game/user-info');
            this.season = res.data[0].season;
            EventManager.triggerEvent(EVENTS.PLAYER_DATA,this.socket.id,res.data[0]);
        } catch(error){
            console.error(error);
        }
        this.scene.launch('SeasonScene',{season:this.season});
    }
}
