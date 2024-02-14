import axios from "axios";
import { ImageManagement } from "../ImageManagement";
import { OverworldScene } from "../OverworldScene";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../Config";

//#74CEFB - summer
//B7E763 - spring
//FDAC7D - autumn
//E5D2E1 - winter

export class LoadScene extends Phaser.Scene{
    constructor(){super({key:'LoadScene'});this.imageManagement = new ImageManagement(this);}
    
    private imageManagement: ImageManagement;
    public preload(){
        this.scene.add('OverworldScene',OverworldScene);
    
        this.imageManagement.loadMapImage();
        this.imageManagement.loadPlayerImage();
        this.imageManagement.loadItemImage();
        this.imageManagement.loadPokemonImage();
    
        const seasonChineseText = this.make.text({
            x: CANVAS_WIDTH/2,
            y: CANVAS_HEIGHT/2 - 25, // Adjusted Y coordinate
            text: '冬',
            style:{
                font: 'Bold 70px Arial',
                color: '#FFFFFF'
            }
        });
        const seasonText = this.make.text({
            x: CANVAS_WIDTH/2,
            y: CANVAS_HEIGHT/2 + 25, // Adjusted Y coordinate
            text: 'Winter',
            style:{
                font: 'bold 30px Arial',
                color: '#E5D2E1'
            }
        });
        seasonChineseText.setOrigin(0.5,0.5);
        seasonChineseText.alpha = 0;
        seasonText.setOrigin(0.5,0.5);
        seasonText.alpha = 0;
    
        // Apply fade-in effect
        this.load.on('progress',()=>{
            this.tweens.add({
                targets: [seasonChineseText, seasonText], // Added both texts to the targets array
                alpha: 1,
                duration: 1000, // Adjust the duration as needed
                ease: 'Linear'
            });
        });
    
        this.load.on('complete',()=>{
            setTimeout(() => {
                this.tweens.add({
                    targets: [seasonChineseText, seasonText], // Added both texts to the targets array
                    alpha: 0,
                    duration: 3000, // Adjust the duration as needed
                    onComplete: () => {
                        this.scene.start('OverworldScene', { imageManagement: this.imageManagement });
                        this.cameras.main.fadeIn(1500, 0, 0, 0);
                    }
                });
            }, 1500); // 2초 지연
        });
    }
}