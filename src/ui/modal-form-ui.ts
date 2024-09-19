import { MODE } from "../enums/mode";
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { addWindow, UiManager } from "./ui-manger";

export class ModalFormUi extends UiManager{
    protected modalContainer!:Phaser.GameObjects.Container;
    protected modalBg!:Phaser.GameObjects.NineSlice;

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        const ui = this.getUi();

        this.modalContainer = this.scene.add.container(this.scene.game.canvas.width/4,this.scene.game.canvas.height/4);

        this.modalBg = addWindow(this.scene,TEXTURE.WINDOW_2_CLICKED,0,0,0,0);
        this.modalContainer.add(this.modalBg);

        this.modalContainer.setVisible(false);
        ui.add(this.modalContainer);
    }

    show(): void {
        this.modalContainer.setVisible(true);

        this.modalContainer.y += 48;
        this.modalContainer.setAlpha(0);
  
        this.scene.tweens.add({
          targets: this.modalContainer,
          duration: 700,
          ease: "Sine.easeInOut",
          y: "-=48",
          alpha: 1
        });
        
    }

    clean():void{
        this.modalContainer.setVisible(false);
        this.modalContainer.y = 0;
    }

    adjustSize(mode:MODE){
        let width=0,height=0;
        switch(mode){
            case MODE.LOGIN:
            case MODE.REGISTRATION:
                width = 360;
                height = 460;
                break;
            case MODE.CLOSET:
                width = 653;
                height = 460;
                break;
        }
        this.modalBg.setSize(width,height);
    }
}