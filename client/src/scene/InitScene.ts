import axios from "axios";
import EventManager, { EVENTS, SOCKET_EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager";
import PlayerManager from "../manager/PlayerManager";
import {io} from 'socket.io-client';
import { Player } from "../Player";
import { TextManager } from "../manager/TextManager";
import { BEHAVIOR_STATUS, OBJECT_TYPE } from "../constants/Game";
import WildPokemonManager from "../manager/WildPokemonManager";

export class InitScene extends Phaser.Scene{
    constructor(){
        super({key:'InitScene'});
        this.imageManager = new ImageManager(this);
        this.textManager = new TextManager(this);
        this.socket = io('/game');
        console.log('InitScene constructor');
    }

    private imageManager:ImageManager;
    private textManager:TextManager;
    
    private season:number;

    private socket:any;

    init(){
        console.log('InitScene init');

        //events
        EventManager.onEvent(EVENTS.SEASONSCENE_FIN,()=>{
            this.scene.launch('MapScene',{im:this.imageManager});
            this.scene.launch('PlayerScene',{im:this.imageManager,tm:this.textManager,socket:this.socket});
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
        });
        EventManager.onEvent(EVENTS.REMOVE_PLAYER,(playerInfo)=>{
            PlayerManager.getCurrentPlayersInfo()[playerInfo[0]].playerObj.destoryAll();
            PlayerManager.deletePlayer(playerInfo[0]);
        });
        EventManager.onEvent(EVENTS.MOVEMENT_PLAYER,(data)=>{
            this.socket.emit(SOCKET_EVENTS.EMIT_MOVEMENT_PLAYER,{socketId:this.socket.id,direction:data[0],player_x:data[1],player_y:data[2]});
        });
        EventManager.onEvent(EVENTS.MOVEMENT_OTHERPLAYER,(data)=>{
            if(PlayerManager.getCurrentPlayersInfo()[data[0]]['player_x'] != data[2] || PlayerManager.getCurrentPlayersInfo()[data[0]]['player_y'] != data[3]){
                
            }
            PlayerManager.getCurrentPlayersInfo()[data[0]]['playerObj'].movement.addMovementDirectionQueue(data[1]);
        });
        EventManager.onEvent(EVENTS.SAVE_PLAYER,(data)=>{
            this.socket.emit(SOCKET_EVENTS.EMIT_SAVE_PLAYER,{player_x:data[0],player_y:data[1],pet_x:data[2],pet_y:data[3]});
        });
        EventManager.onEvent(EVENTS.STAND_PLAYER,()=>{
            this.socket.emit(SOCKET_EVENTS.EMIT_STAND_PLAYER);
        });
        EventManager.onEvent(EVENTS.STAND_OTHER_PLAYER,(data)=>{
            if(PlayerManager.getCurrentPlayersInfo()[data[0]].playerObj){
                PlayerManager.getCurrentPlayersInfo()[data[0]].playerObj.setBehavior(BEHAVIOR_STATUS.IDLE);
            }
        });

        //socket events.
        this.socket.on(SOCKET_EVENTS.ON_MOVEMENT_PLAYER,(data:object)=>{
            EventManager.triggerEvent(EVENTS.MOVEMENT_OTHERPLAYER,data['socketId'],data['direction'],data['player_x'],data['player_y']);
        });
        this.socket.on(SOCKET_EVENTS.CONNECT_PLAYER,(playerData:object)=>{
            PlayerManager.setOtherPlayersWaitQueue(playerData);
            EventManager.triggerEvent(EVENTS.ADD_PLAYER,playerData);
        });
        this.socket.on(SOCKET_EVENTS.DISCONNECT_PLAYER,(socketId:string)=>{
            EventManager.triggerEvent(EVENTS.REMOVE_PLAYER,socketId);
        });
        this.socket.on(SOCKET_EVENTS.ON_STAND_PLAYER,(data:object)=>{
            EventManager.triggerEvent(EVENTS.STAND_OTHER_PLAYER,data['socketId']);
        });
        this.socket.on(SOCKET_EVENTS.ON_WILD_POKEMON,(data:object)=>{
            WildPokemonManager.setWildPokemonInfo(data);
            if(Object.keys(WildPokemonManager.getWildPokemonInfo()).length != 0){
                this.scene.launch('WildPokemonScene',{im:this.imageManager,tm:this.textManager});
            }
        });
    }
    preload(){
        console.log('InitScene preload');
        this.imageManager.loadImageMap();
        this.imageManager.loadImageItem();
        this.imageManager.loadImagePlayer();
        this.imageManager.loadImagePokemon();
    }
    async create(){
        console.log('InitScene create');
    
        try{
            const res = await axios.get('http://localhost:9991/game/user-info');
            EventManager.triggerEvent(EVENTS.INITIAL_PLAYER_DATA,this.socket.id,res.data[0]);
        } catch(error){
            console.error(error);
        }

        this.scene.launch('SeasonScene');
    }
}