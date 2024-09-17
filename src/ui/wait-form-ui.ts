import i18next from "i18next";
import { ModeManager } from "../mode-manager";
import { InGameScene } from "../scenes/ingame-scene";
import { ServiceLocator } from "../utils/service-locator";
import { addText, addWindow, UiManager } from "./ui-manger";
import { TEXTSTYLE } from "../enums/textstyle";
import { TEXTURE } from "../enums/texture";

export class WaitFormUi extends UiManager{
    private modeManager:ModeManager;

    private modalContainer!:Phaser.GameObjects.Container;

    constructor(scene:InGameScene){
        super(scene);
        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
    }

    setup(): void {
        const field = this.getField();
        const ui = this.getUi();

        this.modalContainer = this.scene.add.container(0,0);
        const modalBg = addWindow(this.scene,TEXTURE.WINDOW_2_CLICKED,this.scene.game.canvas.width/4,this.scene.game.canvas.height/4,100,50);
        const modalText = addText(this.scene,this.scene.game.canvas.width/4-30,this.scene.game.canvas.height/4-10,field[0],TEXTSTYLE.ACCOUNT);

        this.modalContainer.add(modalBg);
        this.modalContainer.add(modalText);

        this.modalContainer.setVisible(false);
        ui.add(this.modalContainer);
    }

    show(): void {
        this.modalContainer.setVisible(true);
    }

    clean(): void {
        this.modalContainer.setVisible(false);
    }

    getField(){
        return [i18next.t("menu:waiting")];
    }
}