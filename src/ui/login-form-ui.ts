import i18next from "i18next";
import { InGameScene } from "../scenes/ingame-scene";
import { ModalFormUi } from "./modal-form-ui";
import { addText, addTextInput, addWindow } from "./ui-manger";
import { TEXTURE } from "../enums/texture";
import { TEXTSTYLE } from "../enums/textstyle";
import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { ModeManager } from "../mode-manager";
import { MODE } from "../enums/mode";
import { ServiceLocator } from "../utils/service-locator";
import { InputManager } from "../utils/input-manager";

export class LoginFormUi extends ModalFormUi{
    private inputContainers:Phaser.GameObjects.Container[]=[];
    private inputs: InputText[] = [];
    private btns: Phaser.GameObjects.NineSlice[] = [];
    private modeManager: ModeManager;
    private inputManager: InputManager;

    private inputConfig = [
        {
            key: i18next.t("menu:username"),
            containerY: 100,
            type: 'text',
            placeholder: i18next.t("menu:username")
        },
        {
            key: i18next.t("menu:password"),
            containerY: 122,
            type: 'password',
            placeholder: i18next.t("menu:password")
        }
    ];

    private btnConfig = [
        {
            key: i18next.t("menu:loginBtn"),
            containerX: 240,
            containerY: 160,
            bgX: 0,
            bgY: 0,
            bgWidth: 120,
            bgHeight: 18
        },
        {
            key: i18next.t("menu:registerBtn"),
            containerX: 239,
            containerY: 182,
            bgX: -30,
            bgY: 0,
            bgWidth: 56,
            bgHeight: 18
        },
        {
            key: i18next.t("menu:findAccountBtn"),
            containerX: 241,
            containerY: 182,
            bgX: 30,
            bgY: 0,
            bgWidth: 56,
            bgHeight: 18
        }
    ]

    constructor(scene:InGameScene){
        super(scene);
        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
        this.inputManager = ServiceLocator.get<InputManager>('input-manager');
    }

    setup(): void {
        super.setup();
        const field1 = this.getField('inputs')!;
        const field2 = this.getField('btns')!;

        for (const item of field1) {
            const config = this.inputConfig.find(config => config.key === item);
            if (config) {
                const inputContainer = this.scene.add.container(240, config.containerY);
                const inputBg = addWindow(this.scene, TEXTURE.ACCOUNT_INPUT, 0, 0, 120, 18);
                const input = addTextInput(this.scene, 0, 0, 115, 18, TEXTSTYLE.ACCOUNT_INPUT, {
                    type: config.type,
                    fontSize: '8px',
                    placeholder: config.placeholder,
                    minLength:8,
                    maxLength:16
                });
                
                inputContainer.add(inputBg);
                inputContainer.add(input);
                inputContainer.setVisible(false);
        
                this.inputs.push(input);
                this.inputContainers.push(inputContainer);
                this.modalContainer.add(inputContainer);
            }
        }
        for (const item of field2) {
            const config = this.btnConfig.find(config => config.key === item);
            if (config) {
                const btnContainer = this.scene.add.container(config.containerX, config.containerY);
                const btnBg = addWindow(this.scene, TEXTURE.ACCOUNT_BUTTON, config.bgX, config.bgY, config.bgWidth, config.bgHeight);
                const btnText = addText(this.scene, config.bgX, 0, item, TEXTSTYLE.ACCOUNT);
                btnText.setOrigin(0.5, 0.5);

                this.btns.push(btnBg);
                btnContainer.add(btnBg);
                btnContainer.add(btnText);
                this.modalContainer.add(btnContainer);
            }
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
            if(this.inputs[0].text.length===0 || this.inputs[1].text.length===0)
                this.modeManager.setMode(MODE.MESSAGE,true);
            
            console.log(this.inputs[0].text);
            console.log(this.inputs[1].text);
        });
        
        this.btns[1].on("pointerdown",()=>{this.modeManager.setMode(MODE.REGISTRATION,false);});
        this.btns[2].on("pointerdown",()=>{console.log('moveToFindAccount');});
    }

    clean():void{
        super.clean();
        for(const item of this.inputContainers){
            item.setVisible(false);
        }
    }

    getField(type:string){
        if(type==="inputs") return [i18next.t("menu:username"),i18next.t("menu:password")];
        else if(type==="btns") return [i18next.t("menu:loginBtn"),i18next.t("menu:registerBtn"),i18next.t("menu:findAccountBtn")];
    }
}