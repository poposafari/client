import axios from "axios";
import EventManager, { EVENTS } from "../manager/EventManager";
import { ImageManager } from "../manager/ImageManager";

export class InitScene extends Phaser.Scene{
    constructor(){
        super({key:'InitScene'});
        this.imageManager = new ImageManager(this);
    }
    static BootSceneSeq:number = 0;
    private imageManager:ImageManager;
    
    private season:number;

    async init(){
        //register Event
        EventManager.onEvent(EVENTS.PLAYER_DATA,(data)=>{
            console.log(data);
        });

        try{
            const res = await axios.get('http://localhost:8081/game/user-info');
            this.season = res.data[0].season;
            // EventManager.triggerEvent(EVENTS.PLAYER_DATA,res.data[0]);
            // // EventManager.socketEvent();
            // this.playerManagement.setPlayerInfo(null,res.data[0]);
        } catch(error){
            console.error(error);
        }
    }
    preload(){
        this.imageManager.loadMapImage();
        this.imageManager.loadItemImage();
        this.imageManager.loadPlayerImage();
        this.imageManager.loadPokemonImage();
    }
    create(){
        this.scene.launch('SeasonScene',{season:this.season,im:this.imageManager})
    }
}