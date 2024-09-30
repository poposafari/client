import i18next from "i18next";
import { MODE } from "../enums/mode";
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { addText, addTextInput, addWindow } from "./ui-manger";
import { TEXTSTYLE } from "../enums/textstyle";

export class NewGameFormUi extends ModalFormUi{
    private titleContainer!:Phaser.GameObjects.Container;
    private labelContainer!:Phaser.GameObjects.Container;

    constructor(scene:InGameScene){
        super(scene);
    }

    setup(): void {
        super.setup();
        super.adjustSize(MODE.NEWGAME);

        
        this.titleContainer = this.scene.add.container(this.scene.game.canvas.width/4,this.scene.game.canvas.height/4);
        const titleText = addText(this.scene,0,0,i18next.t("menu:closetTitle"),TEXTSTYLE.TITLE);
        titleText.setOrigin(0.5,0.5);
        this.titleContainer.add(titleText);
        this.modalContainer.add(this.titleContainer);

        this.labelContainer = this.scene.add.container(this.scene.game.canvas.width/4,this.scene.game.canvas.height/4);
        this.labelContainer.setVisible(false);
        const nicknameText = addText(this.scene,0,0,i18next.t("menu:closetLabel1"),TEXTSTYLE.ACCOUNT).setScale(2);
        nicknameText.setOrigin(0.5,0.5);
        const nicknameBg = addWindow(this.scene,TEXTURE.INPUT_0,0,0,240,36);
        const nicknameTextInput = addTextInput(this.scene,0,0,230,36,TEXTSTYLE.ACCOUNT_INPUT,{
            type:'text',
            fontSize:'16px',
        });
        
        this.labelContainer.add(nicknameText);
        this.labelContainer.add(nicknameBg);
        this.labelContainer.add(nicknameTextInput);
    }

    show(): void {
        super.show();
        this.labelContainer.setVisible(true);
    }

    clean(): void {
        super.clean();
    }

    pause(onoff: boolean): void {}
}