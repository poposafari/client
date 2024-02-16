import axios from "axios";
import EventManager, { EVENTS } from "../management/EventManager";
import { ImageManagement } from "../management/ImageManagement";
import { OverworldScene } from "../scene/OverworldScene";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../Config";
import { TextManagement } from "../management/TextManagement";
import { AnimationManagement } from "../management/AnimationManagement";
import { PlayerManagement } from "../management/PlayerManagement";

import { Player } from "../Player";

//#74CEFB - summer
//B7E763 - spring
//FDAC7D - autumn
//E5D2E1 - winter

export class LoadScene extends Phaser.Scene{
    constructor(){
        super({key:'LoadScene'});
        this.imageManagement = new ImageManagement(this);
        this.playerManagement = new PlayerManagement();
    }

    private imageManagement: ImageManagement;
    private playerManagement: PlayerManagement;

    public init(){

    }
    public async preload(){
        this.scene.add('OverworldScene',OverworldScene);
        this.imageManagement.loadMapImage();
        this.imageManagement.loadPlayerImage();
        this.imageManagement.loadItemImage();
        this.imageManagement.loadPokemonImage();
    }
    public async create(){
        try{
            const res = await axios.get('http://localhost:8081/game/user-info');
            EventManager.triggerEvent(EVENTS.PLAYER_DATA,res.data[0]);
            EventManager.socketEvent();
            this.playerManagement.setPlayerInfo(this.socket.id,res.data[0]);
            this.startSeasonScene();
        }catch(error){
            console.error(error);
        }
    }
    private startSeasonScene(){
        this.scene.start('SeasonScene', {
            socket: this.socket,
            playerManagement: this.playerManagement
        });
    }
}