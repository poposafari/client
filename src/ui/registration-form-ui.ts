import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { ModeManager } from "../mode-manager";
import { addText, addTextInput, addWindow } from "./ui-manger";
import { TEXTURE } from "../enums/texture";
import { TEXTSTYLE } from "../enums/textstyle";
import i18next from "i18next";
import { ServiceLocator } from "../utils/service-locator";
import { MODE } from "../enums/mode";
import { apiPost } from "../utils/api";
import { registerBtnsConfig, registerInputsConfig } from "./config";

export class RegistrationFormUi extends ModalFormUi{
    private inputContainers:Phaser.GameObjects.Container[]=[];
    private inputs: InputText[]=[];
    private btns: Phaser.GameObjects.NineSlice[]=[];
    private modeManager: ModeManager;

    constructor(scene:InGameScene){
        super(scene);
        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
    }

    setup(): void {
        super.setup();
        super.adjustSize(MODE.REGISTRATION);
        const field1 = registerInputsConfig;
        const field2 = registerBtnsConfig;

        //inputs
        for(const item of field1){
            const inputContainer = this.scene.add.container(item.x,item.y);
            const inputBg = addWindow(this.scene,TEXTURE.INPUT_0,0,0,item.w,item.h);
            const input = addTextInput(this.scene,0,0,item.w-10,item.h,TEXTSTYLE.INPUT,{
                type:item.type,
                fontSize:'16px',
                placeholder:item.placeholder
            });
            const label = addText(this.scene, item.labelX!,item.labelY!,item.label!, TEXTSTYLE.ACCOUNT);
            
            inputContainer.add(inputBg);
            inputContainer.add(input);
            inputContainer.add(label);
            inputContainer.setVisible(false);

            this.inputs.push(input);
            this.inputContainers.push(inputContainer);
            this.modalContainer.add(inputContainer);
        }

        for(const item of field2){
            const btnContainer = this.scene.add.container(item.x, item.y);
            const btnBg = addWindow(this.scene, TEXTURE.BTN_0,0, 0, item.w, item.h);
            const btnText = addText(this.scene, 0, 0, item.content, TEXTSTYLE.ACCOUNT);
            btnText.setOrigin(0.5, 0.5);

            this.btns.push(btnBg);
            btnContainer.add(btnBg);
            btnContainer.add(btnText);
            this.modalContainer.add(btnContainer);
        }
    }

    show(): void {
        super.show();

        for(const item of this.inputContainers){
            item.setVisible(true);
        }

        for(const item of this.btns){
            item.setInteractive();
        }

        this.btns[0].on("pointerdown",()=>{
            const [username,password,repassword] = this.inputs;
            

            const isValidUsername = (username: string): boolean => {
                const usernameRegex = /^[a-zA-Z0-9]{5,16}$/;
                return usernameRegex.test(username);
            };

            const isValidPassword = (password: string): boolean => {
                const passwordRegex = /^(?=.*[!@#$%^&*()\-_=+])(?=.*[a-zA-Z0-9])[a-zA-Z0-9!@#$%^&*()\-_=+]{5,16}$/;
                return passwordRegex.test(password);
            };

            let retText=[];

            if(username.text.length === 0 || password.text.length === 0 || repassword.text.length === 0){
                retText = [i18next.t("message:registrationError1")];
                this.modeManager.setMode(MODE.MESSAGE,true,retText);
                return;
            }
            if(password.text !== repassword.text){
                retText = [i18next.t("message:registrationError3")];
                this.modeManager.setMode(MODE.MESSAGE,true,retText);
                return;
            }
            if(!isValidUsername(username.text)){
                retText = [i18next.t("message:registrationError5")];
                this.modeManager.setMode(MODE.MESSAGE,true,retText);
                return;
            }
            if(!isValidPassword(password.text)){
                retText = [i18next.t("message:registrationError6")];
                this.modeManager.setMode(MODE.MESSAGE,true,retText);
                return;
            }

            this.modeManager.setMode(MODE.WAITING,false);

            apiPost("/account/register",{"username":username.text,"password":password.text})
                .then(()=>{
                    this.modeManager.setMode(MODE.LOGIN,false);
                    this.modeManager.setMode(MODE.MESSAGE,true,[i18next.t("message:registrationSuccess")]);
                })
                .catch((value)=>{
                    if(value.status === 409){
                        this.modeManager.setMode(MODE.REGISTRATION,false);
                        this.modeManager.setMode(MODE.MESSAGE,true,[i18next.t("message:registrationError2")]);
                    }else{
                        this.modeManager.setMode(MODE.REGISTRATION,false);
                        this.modeManager.setMode(MODE.MESSAGE,true,[i18next.t("message:serverError")]);
                    }
                });
        });
        this.btns[1].on("pointerdown",()=>{this.modeManager.setMode(MODE.LOGIN,false);});
    }

    clean(): void {  
        super.clean();

        for(const item of this.inputContainers){
            item.setVisible(false);
        }

        for(const item of this.btns){
            item.off('pointerdown');
        }
    }
    
    getField(type:string){
        if(type === "inputs") return [i18next.t("menu:username"),i18next.t("menu:password"),i18next.t("menu:repassword")];
        else if(type === "btns") return [i18next.t("menu:registerBtn"),i18next.t("menu:loginBtn")];
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
}