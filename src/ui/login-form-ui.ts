import i18next from "i18next";
import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { addText, addTextInput, addWindow } from "./ui-manger";
import { TEXTURE } from "../enums/texture";
import { TEXTSTYLE } from "../enums/textstyle";
import { ModeManager } from "../mode-manager";
import { MODE } from "../enums/mode";
import { ServiceLocator } from "../utils/service-locator";
import { apiPost } from "../utils/api";
import { loginBtnsConfig,loginInputsConfig } from "./config";

export class LoginFormUi extends ModalFormUi{
    private inputContainers:Phaser.GameObjects.Container[]=[];
    private inputs: InputText[] = [];
    private btns: Phaser.GameObjects.NineSlice[] = [];
    private modeManager: ModeManager;

    constructor(scene:InGameScene){
        super(scene);
        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
    }

    setup(): void {
        super.setup();
        super.adjustSize(MODE.LOGIN);

        const field1 = loginInputsConfig;
        const field2 = loginBtnsConfig;

        console.log(field1);
        //inputs
        for (const item of field1!) {
            console.log(item);
            const inputContainer = this.scene.add.container(item.x,item.y);
            const inputBg = addWindow(this.scene, TEXTURE.INPUT_0, 0, 0, item.w, item.h);
            const input = addTextInput(this.scene, 0, 0, item.w-10, item.h, TEXTSTYLE.INPUT, {
                type: item.type,
                fontSize: '18px',
                placeholder: item.placeholder,
                minLength:6,
                maxLength:16
            });
                
            inputContainer.add(inputBg);
            inputContainer.add(input);
            inputContainer.setVisible(false);
    
            this.inputs.push(input);
            this.inputContainers.push(inputContainer);
            this.modalContainer.add(inputContainer);
        }

        //btns
        for (const item of field2) {
            const btnContainer = this.scene.add.container(item.x,item.y);
            const btnBg = addWindow(this.scene, TEXTURE.BTN_0, 0, 0, item.w, item.h);
            const btnText = addText(this.scene, 0, 0, item.content, TEXTSTYLE.ACCOUNT);

            this.btns.push(btnBg);
            btnContainer.add(btnBg);
            btnContainer.add(btnText);
            this.modalContainer.add(btnContainer);
        }   
    }

    show(): void {
        super.show();

        this.setBackground(TEXTURE.BG_0);

        for(const item of this.inputContainers){
            item.setVisible(true);
        }

        for(const item of this.btns){
            item.setInteractive();
        }
        
        this.btns[0].on("pointerdown",()=>{
            if(this.inputs[0].text.length===0 || this.inputs[1].text.length===0){
                this.modeManager.setMode(MODE.MESSAGE,true,[i18next.t("message:loginError1")]);
                return;
            }

            this.modeManager.setMode(MODE.WAITING,false);

            apiPost("/account/login",{"username":this.inputs[0].text,"password":this.inputs[1].text})
                .then((value)=>{
                    if(value.data){this.modeManager.setMode(MODE.TITLE,false,value.data);}
                    else{this.modeManager.setMode(MODE.TITLE,false,null);}
                })
                .catch((value)=>{
                    if(value.status === 401){
                        this.modeManager.setMode(MODE.LOGIN,false);
                        this.modeManager.setMode(MODE.MESSAGE,true,[i18next.t("message:loginError2")]);
                    }else{
                        this.modeManager.setMode(MODE.LOGIN,false);
                        this.modeManager.setMode(MODE.MESSAGE,true,[i18next.t("message:serverError")]);
                    }
                })
        });
        
        this.btns[1].on("pointerdown",()=>{this.modeManager.setMode(MODE.REGISTRATION,false);});
        this.btns[2].on("pointerdown",()=>{console.log('moveToFindAccount');});
    }

    blockInputs(): void {
        for (const input of this.inputs) {
            input.setBlur();
            input.pointerEvents = 'none';
        }
        for (const btn of this.btns) {
            btn.disableInteractive();
        }
    }

    unblockInputs(): void{
        for (const input of this.inputs) {
            input.pointerEvents = 'auto';
        }
        for (const btn of this.btns) {
            btn.setInteractive();
        }
    }

    clean():void{
        super.clean();

        for(const item of this.inputContainers){
            item.setVisible(false);
        }

        for(const item of this.btns){
            item.off('pointerdown')
        }
    }
}