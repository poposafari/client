import axios from "axios";
import { ImageManagement } from "../ImageManagement";
import { OverworldScene } from "../OverworldScene";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../Config";
import { TextManagement } from "../management/TextManagement";
import { AnimationManagement } from "../management/AnimationManagement";

//#74CEFB - summer
//B7E763 - spring
//FDAC7D - autumn
//E5D2E1 - winter

export class LoadScene extends Phaser.Scene{
    constructor(){
        super({key:'LoadScene'});
        this.imageManagement = new ImageManagement(this);
        this.textManagement = new TextManagement(this);
        this.animationManagement = new AnimationManagement(this);
    }
    private textManagement: TextManagement;
    private imageManagement: ImageManagement;
    private animationManagement: AnimationManagement;

    private seasonTextChinese: Phaser.GameObjects.Text;
    private seasonText: Phaser.GameObjects.Text;

    public init(){
        this.seasonTextChinese = this.textManagement.createText(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 - 25,'冬','Bold 70px Arial','#FFFFFF');
        this.seasonText = this.textManagement.createText(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 + 25,'Winter','Bold 30px Arial','#E5D2E1');
        this.seasonText.setOrigin(0.5,0.5);
        this.seasonText.alpha = 0;
        this.seasonTextChinese.setOrigin(0.5,0.5);
        this.seasonTextChinese.alpha = 0;
    }
    public preload(){
        this.scene.add('OverworldScene',OverworldScene);

        this.imageManagement.loadMapImage();
        this.imageManagement.loadPlayerImage();
        this.imageManagement.loadItemImage();
        this.imageManagement.loadPokemonImage();

        this.load.on('progress',()=>{
            this.animationManagement.fade([this.seasonText,this.seasonTextChinese],1,1000,null);
        });
    
        this.load.on('complete',()=>{
            setTimeout(()=>{
                this.animationManagement.fade([this.seasonText,this.seasonTextChinese],0,3000,this.textDestory);
            },2000);
        });
    }
    public async create(){
        
        //this.startOverworldScene();
    }
    private startOverworldScene(){
        this.scene.start('OverworldScene', { imageManagement: this.imageManagement });
    }
    private textDestory(){
        this.seasonText.destroy();
        this.seasonTextChinese.destroy();
    }
}