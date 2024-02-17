import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../../constants/Game";
import { TextManager } from "../manager/TextManager";
import { SEASON_TEXT } from "../../constants/Text";
import { AnimationManager } from "../manager/AnimationManager";
import { InitScene } from "./InitScene";
import { MapScene } from "./MapScene";
import { ImageManager } from "../manager/ImageManager";

export class SeasonScene extends Phaser.Scene{
    constructor(){
        super('SeasonScene');
        this.textManager = new TextManager(this);
        this.animationManager = new AnimationManager(this);
    }

    private textManager: TextManager;
    private animationManager: AnimationManager;
    private imageManager:ImageManager;

    private seasonText: Phaser.GameObjects.Text;
    private seasonChineseText: Phaser.GameObjects.Text;

    private season:number=null;
    
    create(data:object){
        this.season = data['season'];
        this.season = data['im'];
        this.seasonChineseText = this.textManager.createText(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 - 25,SEASON_TEXT[this.season].chinese,'Bold 70px Arial',SEASON_TEXT[this.season].chineseColor);
        this.seasonText = this.textManager.createText(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 + 25,SEASON_TEXT[this.season].text,'Bold 30px Arial',SEASON_TEXT[this.season].textColor);
        this.seasonText.setOrigin(0.5,0.5);
        this.seasonText.alpha = 0;
        this.seasonChineseText.setOrigin(0.5,0.5);
        this.seasonChineseText.alpha = 0;

        this.animationManager.fade([this.seasonText, this.seasonChineseText], 1, 1000, () => {
            this.animationManager.fade([this.seasonText, this.seasonChineseText], 0, 2000, () => {
                this.textDestroy();
            });
        });
    }
    private textDestroy(){
        this.seasonText.destroy();
        this.seasonChineseText.destroy();
        InitScene.BootSceneSeq++;
        this.scene.launch('MapScene',{im:this.imageManager});
    }
}