import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../Config";
import { AnimationManagement } from "../management/AnimationManagement";
import { TextManagement } from "../management/TextManagement";

export class SeasonScene extends Phaser.Scene{
    constructor(){
        super({key:'SeasonScene'});
        this.textManagement = new TextManagement(this);
        this.animationManagement = new AnimationManagement(this);
    }

    private textManagement: TextManagement;
    private animationManagement: AnimationManagement;

    private seasonTextChinese: Phaser.GameObjects.Text;
    private seasonText: Phaser.GameObjects.Text;
    
    init(){
        this.seasonTextChinese = this.textManagement.createText(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 - 25,'冬','Bold 70px Arial','#FFFFFF');
        this.seasonText = this.textManagement.createText(CANVAS_WIDTH/2,CANVAS_HEIGHT/2 + 25,'Winter','Bold 30px Arial','#E5D2E1');
        this.seasonText.setOrigin(0.5,0.5);
        this.seasonText.alpha = 0;
        this.seasonTextChinese.setOrigin(0.5,0.5);
        this.seasonTextChinese.alpha = 0;

    }
    preload(){
        this.load.on('progress',()=>{
            this.animationManagement.fade([this.seasonText,this.seasonTextChinese],1,1000,null);
        });
        this.load.on('complete',()=>{
            setTimeout(()=>{
                this.animationManagement.fade([this.seasonText,this.seasonTextChinese],0,3000,this.textDestory());
            },1000);
        });
    }
    private startOverworldScene(){
        this.scene.start('OverworldScene', {
            socket: this.socket,
            playerManagement: this.playerManagement
        });
    }
    private textDestory(){
        this.seasonText.destroy();
        this.seasonTextChinese.destroy();
    }   
}