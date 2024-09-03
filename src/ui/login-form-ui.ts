import i18next from "i18next";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { addText, addTextInput, addWindow } from "./ui-manger";
import { TEXTURE } from "../enums/texture";
import { TEXTSTYLE } from "../enums/textstyle";
import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { ModeManager } from "../mode-manager";
import { MODE } from "../enums/mode";

export class LoginFormUi extends ModalFormUi{
    private inputs: InputText[] = [];
    private buttons: Phaser.GameObjects.NineSlice[] = [];
    private modeManager: ModeManager;

    constructor(modeManager:ModeManager,scene:InGameScene){
        super(scene);
        this.modeManager = modeManager;
    }

    setup(): void {
        super.setup();
        for(let i=0;i<2;i++){
            const inputContainer = this.scene.add.container(240,i===0?100:122);
            const inputBg = addWindow(this.scene,TEXTURE.ACCOUNT_INPUT,0,0,120,18);
            const input = addTextInput(this.scene,0,0,115,18,TEXTSTYLE.ACCOUNT_INPUT,{
                    type:i===0?'text':'password',
                    fontSize:'8px',
                    placeholder:i===0?i18next.t("menu:usernamePlaceholder"):i18next.t("menu:passwordPlaceholder"),
                }
            );
            inputContainer.add(inputBg);
            inputContainer.add(input);
            this.inputs.push(input);
            this.modalContainer.add(inputContainer);
        }

        const loginBtnContainer = this.scene.add.container(240,160);
        const loginBg = addWindow(this.scene,TEXTURE.ACCOUNT_BUTTON,0,0,120,18);
        const loginText = addText(this.scene,0,0,i18next.t("menu:loginButton"),TEXTSTYLE.ACCOUNT);
        loginBtnContainer.add(loginBg);
        this.modalContainer.add(loginBtnContainer);
        this.buttons.push(loginBg);

        const loginTextContainer = this.scene.add.container(240,160);
        loginText.setOrigin(0.5, 0.5);
        loginTextContainer.add(loginText);
        this.modalContainer.add(loginTextContainer);

        const moveToRegisterContainer = this.scene.add.container(239,182);
        const moveToRegisterBg = addWindow(this.scene,TEXTURE.ACCOUNT_BUTTON,-30,0,56,18);
        moveToRegisterContainer.add(moveToRegisterBg);
        this.modalContainer.add(moveToRegisterContainer);
        this.buttons.push(moveToRegisterBg);
        const moveToRegisterText = addText(this.scene,-30,0,i18next.t("menu:moveToRegister"),TEXTSTYLE.ACCOUNT);
        moveToRegisterText.setOrigin(0.5,0.5);
        moveToRegisterContainer.add(moveToRegisterText);
        this.modalContainer.add(moveToRegisterContainer);

        const moveToFindAccountContainer = this.scene.add.container(241,182);
        const moveToFindAccountBg = addWindow(this.scene,TEXTURE.ACCOUNT_BUTTON,30,0,56,18);
        moveToFindAccountContainer.add(moveToFindAccountBg);
        this.modalContainer.add(moveToRegisterContainer);
        this.buttons.push(moveToFindAccountBg);
        const moveToFindAccountText = addText(this.scene,30,0,i18next.t("menu:moveToFindAccount"),TEXTSTYLE.ACCOUNT);
        moveToFindAccountText.setOrigin(0.5,0.5);
        moveToFindAccountContainer.add(moveToFindAccountText);
        this.modalContainer.add(moveToFindAccountContainer);
    }

    show(): void {
        super.show();
        for(const item of this.buttons){
            item.setInteractive();
        }
        
        this.buttons[0].on("pointerdown",()=>{
            console.log('tryToLogin');
            console.log(this.inputs[0].text);
            console.log(this.inputs[1].text);
        });
        
        this.buttons[1].on("pointerdown",()=>{
            console.log('moveToRegister');
            this.modeManager.setMode(MODE.REGISTRATION);
        });

        this.buttons[2].on("pointerdown",()=>{
            console.log('moveToFindAccount');
        });
    }

    clean():void{

    }
}