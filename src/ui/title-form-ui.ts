import i18next from "i18next";
import { ModeManager } from "../mode-manager";
import { InGameScene } from "../scenes/ingame-scene";
import { ServiceLocator } from "../utils/service-locator";
import { addText, addWindow, UiManager } from "./ui-manger";
import { TEXTSTYLE } from "../enums/textstyle";
import { TEXTURE } from "../enums/texture";

export class TitleFormUi extends UiManager{
    private btns: Phaser.GameObjects.NineSlice[]=[];
    private modeManger: ModeManager;

    private menuConfig=[
        {
            key: i18next.t("menu:startGame"),
            containerX: 240,
            containerY: 205,
            bgX: 0,
            bgY: 0,
            bgWidth: 120,
            bgHeight: 18
        },
        {
            key: i18next.t("menu:startNewGame"),
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
        this.modeManger = ServiceLocator.get<ModeManager>('mode-manager');
    }

    setup(): void {
        const ui = this.getUi();
        const field = this.getField("old")!;

        for(const item of field){
            const config = this.menuConfig.find(config => config.key === item);
            if(config){
                const btnContainer = this.scene.add.container(config.containerX,config.containerY);
                const btnBg = addWindow(this.scene,TEXTURE.MESSAGE,config.bgX, config.bgY, config.bgWidth, config.bgHeight);
                const btnText = addText(this.scene,config.bgX,0,item,TEXTSTYLE.MESSAGE);
                btnText.setOrigin(0.5,0.5);

                this.btns.push(btnBg);
                btnContainer.add(btnBg);
                btnContainer.add(btnText);
                btnContainer.setVisible(false);
                ui.add(btnContainer);
            }
        }
        
    }
    show(): void {
        for(const item of )
    }
    clean(): void {

    }

    getField(type:string){
        if(type==="new") return [i18next.t("menu:startGame"),i18next.t("menu:startNewGame")];
        else if(type==="old") return [i18next.t("menu:startNewGame")];
    }
    
}