import i18next from "i18next";
import { ModeManager } from "../mode-manager";
import { InGameScene } from "../scenes/ingame-scene";
import { ServiceLocator } from "../utils/service-locator";
import { addText, addWindow, UiManager } from "./ui-manger";
import { TEXTSTYLE } from "../enums/textstyle";
import { TEXTURE } from "../enums/texture";
import { MODE } from "../enums/mode";

export class TitleFormUi extends UiManager{
    private titleContainer!:Phaser.GameObjects.Container;
    private gameStartContainer!:Phaser.GameObjects.Container;
    private btns:Phaser.GameObjects.NineSlice[]=[];
    private btnContainers:Phaser.GameObjects.Container[]=[];
    private choiceContainer!:Phaser.GameObjects.Container;
    private choiceStatus!: number;
    private modeManger: ModeManager;

    private menuConfig=[
        {
            key: i18next.t("menu:startGame"),
            containerY: 245,
        },
        {
            key: i18next.t("menu:startNewGame"),
            containerY: 300,
        },
        {
            key: i18next.t("menu:setting"),
            containerY: 355,
        },
        {
            key: i18next.t("menu:logout"),
            containerY: 410,
        },
    ];

    constructor(scene:InGameScene){
        super(scene);
        this.modeManger = ServiceLocator.get<ModeManager>('mode-manager');
    }

    setup(): void {
        const ui = this.getUi();
        const field = this.getField();

        this.choiceStatus = 0;

        this.titleContainer = this.scene.add.container(0,0);
        const titleBg = addWindow(this.scene,TEXTURE.WINDOW_0,this.scene.game.canvas.width/4,this.scene.game.canvas.height/4-200,200,100);
        this.titleContainer.add(titleBg);
        this.titleContainer.setVisible(false);
        ui.add(this.titleContainer);

        for(const item of field){
            const config = this.menuConfig.find(config => config.key === item);
            if(config){
                const btnContainer = this.scene.add.container(480,config.containerY);
                const btnBg = addWindow(this.scene,TEXTURE.WINDOW_2,0,0, 280, 50);
                const btnText = addText(this.scene,0,0,item,TEXTSTYLE.TITLE_MENU);
                btnText.setOrigin(0.5,0.5);

                this.btns.push(btnBg);
                btnContainer.add(btnBg);
                btnContainer.add(btnText);
                btnContainer.setVisible(false);
                this.btnContainers.push(btnContainer);
            }
        }
        ui.add(this.btnContainers);
    }

    show(data?:any): void {
        this.titleContainer.setVisible(true);

        this.btnContainers = this.btnContainers.filter(item=>{
            if(!data && item.list[1].text === i18next.t("menu:startGame")){
                return false;
            }
            item.setVisible(true);
            return true;
        });
    }

    clean(): void {
        this.titleContainer.setVisible(false);
        for(const item of this.btnContainers){
            item.setVisible(false);
        }
    }

    updateChoice(direction:boolean){
        for(const item of this.btnContainers){
            item.list[0].setTexture(TEXTURE.WINDOW_2);
        }

        if(direction) this.choiceStatus= (this.choiceStatus - 1 + this.btnContainers.length) % this.btnContainers.length;
        else this.choiceStatus = (this.choiceStatus + 1) % this.btnContainers.length;
        
        this.btnContainers[this.choiceStatus].list[0].setTexture(TEXTURE.WINDOW_2_CLICKED);
    }

    updateMenu(){
        switch(this.btnContainers[this.choiceStatus].list[1].text){
            case i18next.t("menu:logout"):
                this.modeManger.setMode(MODE.LOGIN,false);
                break;
            case i18next.t("menu:startNewGame"):
                this.modeManger.setMode(MODE.TUTORIAL,false);
                break;
            case i18next.t("menu:startGame"):
                console.log('start game');
                break;
        }
    }

    getField(){
        return [i18next.t("menu:startGame"),i18next.t("menu:startNewGame"),i18next.t("menu:setting"),i18next.t("menu:logout")];
    }
    
}