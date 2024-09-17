import i18next from "i18next";
import { MODE } from "../enums/mode";
import { TEXTURE } from "../enums/texture";
import { ModeManager } from "../mode-manager";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { addDropdown, addText, addWindow, UiManager } from "./ui-manger";
import { TEXTSTYLE } from "../enums/textstyle";

export class ClosetFormUi extends ModalFormUi{
    private titleContainer!:Phaser.GameObjects.Container;
    private dropDownContainer!:Phaser.GameObjects.Container;

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        addDropdown(this.scene)
        super.setup();
        super.adjustSize(MODE.CLOSET);

        this.titleContainer = this.scene.add.container(this.scene.game.canvas.width/4,this.scene.game.canvas.height/4-190);
        const titleText = addText(this.scene,0,0,i18next.t("menu:closetTitle"),TEXTSTYLE.TITLE_MENU);
        titleText.setOrigin(0.5,0.5);
        this.titleContainer.add(titleText);
        this.modalContainer.add(this.titleContainer);
        
        const dropdown = addDropdown(this.scene);
        dropdown.setVisible(true);
        this.modalContainer.add(dropdown);
    }

    show(): void {
        super.show();
    }

    clean(): void {
        super.clean();
    }

    getField(){
        return []
    }


}