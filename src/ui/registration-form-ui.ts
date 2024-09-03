import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { ModeManager } from "../mode-manager";
import { addText, addTextInput, addWindow } from "./ui-manger";
import { TEXTURE } from "../enums/texture";
import { TEXTSTYLE } from "../enums/textstyle";
import i18next from "i18next";

export class RegistrationFormUi extends ModalFormUi{
    private inputs: InputText[]=[];
    private buttons: Phaser.GameObjects.NineSlice[]=[];
    private modeManager: ModeManager;

    constructor(modeManager:ModeManager, scene:InGameScene){
        super(scene);
        this.modeManager = modeManager;
    }

    setup(): void {
        super.setup();
        for(let i=0;i<3;i++){
            const inputContainer = this.scene.add.container(240,i===0?100:i===1?122:144);
            const inputBg = addWindow(this.scene,TEXTURE.ACCOUNT_INPUT,0,0,120,18);
            const input = addTextInput(this.scene,0,0,115,18,TEXTSTYLE.ACCOUNT_INPUT,{
                type:'text',
                fontSize:'8px',
                placeholder:i===0
                            ?i18next.t("menu:inputUsername")
                            :i===1?i18next.t("menu:inputPassword")
                            :i18next.t("menu:inputEmail"),
            });

            inputContainer.add(inputBg);
            inputContainer.add(input);
            this.inputs.push(input);
            this.modalContainer.add(inputContainer);
        }

        const moveToLoginContainer = this.scene.add.container(239,180);
        const moveToLoginBg = addWindow(this.scene,TEXTURE.ACCOUNT_BUTTON,-30,0,56,18);
        moveToLoginContainer.add(moveToLoginBg);
        this.modalContainer.add(moveToLoginContainer);
        this.buttons.push(moveToLoginBg);
        const moveToLoginText = addText(this.scene,-30,0,i18next.t("menu:moveToLogin"),TEXTSTYLE.ACCOUNT);
        moveToLoginText.setOrigin(0.5,0.5);
        moveToLoginContainer.add(moveToLoginText);
        this.modalContainer.add(moveToLoginContainer);

        const registerButton = this.scene.add.container(239,180);
        const registerBg = addWindow(this.scene,TEXTURE.ACCOUNT_BUTTON,+30,0,56,18);
        registerButton.add(registerBg);
        this.modalContainer.add(registerButton);
        this.buttons.push(registerBg);
        const registerText = addText(this.scene,+30,0,i18next.t("menu:moveToRegister"),TEXTSTYLE.ACCOUNT);
        registerText.setOrigin(0.5,0.5);
        registerButton.add(registerText);
        this.modalContainer.add(registerButton);
    }

    show(): void {
        super.show();
    }

    clean(): void {        
    }
}