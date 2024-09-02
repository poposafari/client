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

        this.modalContainer = this.scene.add.container(0,0);
        // this.modalContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.scene.game.canvas.width, this.scene.game.canvas.height), Phaser.Geom.Rectangle.Contains);

        this.modalBg = addWindow(this.scene,TEXTURE.ACCOUNT_WINDOW,this.scene.game.canvas.width/8,this.scene.game.canvas.height/8,180,230);
        this.modalContainer.add(this.modalBg);

        ui.add(this.modalContainer);
    }

    show(): void {
        this.modalContainer.y += 24;
        this.modalContainer.setAlpha(0);
  
        this.scene.tweens.add({
          targets: this.modalContainer,
          duration: 1000,
          ease: "Sine.easeInOut",
          y: "-=24",
          alpha: 1
        });
    }
}