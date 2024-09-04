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

export class RegistrationFormUi extends ModalFormUi{
    private inputContainers:Phaser.GameObjects.Container[]=[];
    private inputs: InputText[]=[];
    private btns: Phaser.GameObjects.NineSlice[]=[];
    private modeManager: ModeManager;

    private inputConfig=[
        {
            key: i18next.t("menu:username"),
            containerX: 240,
            containerY: 75,
            bgX: -58,
            bgY: -19,
            type: 'text',
            placeholder: i18next.t("menu:inputUsername")
        },
        {
            key: i18next.t("menu:password"),
            containerX: 240,
            containerY: 110,
            bgX: -58,
            bgY: -19,
            type: 'password',
            placeholder: i18next.t("menu:inputPassword")
        },
        {
            key: i18next.t("menu:repassword"),
            containerX: 240,
            containerY: 145,
            bgX: -58,
            bgY: -19,
            type: 'password',
            placeholder: i18next.t("menu:inputRePassword")
        },
        {
            key: i18next.t("menu:email"),
            containerX: 240,
            containerY: 180,
            bgX: -58,
            bgY: -19,
            type: 'text',
            placeholder: i18next.t("menu:inputEmail")
        }
    ];

    private btnConfig=[
        {
            key: i18next.t("menu:registerBtn"),
            containerX: 240,
            containerY: 205,
            bgX: 0,
            bgY: 0,
            bgWidth: 120,
            bgHeight: 18
        },
        {
            key: i18next.t("menu:loginBtn"),
            containerX: 240,
            containerY: 227,
            bgX: 0,
            bgY: 0,
            bgWidth: 120,
            bgHeight: 18
        },
    ];

    constructor(scene:InGameScene){
        super(scene);
        this.modeManager = ServiceLocator.get<ModeManager>('mode-manager');
    }

    setup(): void {
        super.setup();
        const field1 = this.getField('inputs')!;
        const field2 = this.getField('btns')!;

        for(const item of field1){
            const config = this.inputConfig.find(config => config.key === item);
            if(config){
                const inputContainer = this.scene.add.container(240,config.containerY);
                const inputBg = addWindow(this.scene,TEXTURE.ACCOUNT_INPUT,0,0,120,18);
                const input = addTextInput(this.scene,0,0,115,18,TEXTSTYLE.ACCOUNT_INPUT,{
                    type:config.type,
                    fontSize:'8px',
                    placeholder:config.placeholder
                });
                const label = addText(this.scene, config.bgX, config.bgY, item, TEXTSTYLE.ACCOUNT);
                
                inputContainer.add(inputBg);
                inputContainer.add(input);
                inputContainer.add(label);
                inputContainer.setVisible(false);

                this.inputs.push(input);
                this.inputContainers.push(inputContainer);
                this.modalContainer.add(inputContainer);
            }
        }

        for(const item of field2){
            const config = this.btnConfig.find(config => config.key === item);
            if(config){
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

        this.btns[0].on("pointerdown",()=>{console.log('moveToFindAccount');});
        this.btns[1].on("pointerdown",()=>{this.modeManager.setMode(MODE.LOGIN);});

    }

    clean(): void {  
        super.clean();
        for(const item of this.inputContainers){
            item.setVisible(false);
        }
    }
    
    getField(type:string){
        if(type === "inputs") return [i18next.t("menu:username"),i18next.t("menu:password"),i18next.t("menu:repassword"),i18next.t("menu:email")];
        else if(type === "btns") return [i18next.t("menu:registerBtn"),i18next.t("menu:loginBtn")];
    }
}