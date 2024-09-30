import { InGameScene } from "../scenes/ingame-scene";
import { addText, addWindow, UiManager } from "./ui-manger";
import { TEXTSTYLE } from "../enums/textstyle";
import { TEXTURE } from "../enums/texture";
import { lobbyMenuConfig, lobbyTitleConfig } from "./config";
import { KEYBOARD } from "../enums/keyboard";
import { ORDER } from "../enums/order";
import { MODE } from "../enums/mode";
import { UiLobbyMenu } from "../interfaces/ui";

export class TitleFormUi extends UiManager{
    private titleContainer!:Phaser.GameObjects.Container;
    private btns:Phaser.GameObjects.NineSlice[]=[];
    private btnContainers:Phaser.GameObjects.Container[]=[];
    private choiceStatus!: number;
    private lobbyMenuConfig:UiLobbyMenu[]=[];

    constructor(scene:InGameScene){
        super(scene);

        this.whitelistKey=[
            KEYBOARD.SELECT,
            KEYBOARD.UP,
            KEYBOARD.DOWN,
        ]
    }

    setup(): void {
        const ui = this.getUi();
        const field1 = lobbyTitleConfig
        this.lobbyMenuConfig = lobbyMenuConfig;

        this.choiceStatus = 0;

        this.titleContainer = this.scene.add.container(this.scene.game.canvas.width/4,this.scene.game.canvas.height/4);
        const titleBg = addWindow(this.scene,TEXTURE.WINDOW_0,field1.bx,field1.by,field1.bw,field1.bh);
        this.titleContainer.add(titleBg);
        this.titleContainer.setVisible(false);
        ui.add(this.titleContainer);

        for(const item of this.lobbyMenuConfig){
            const btnContainer = this.scene.add.container(this.scene.game.canvas.width/4,this.scene.game.canvas.height/4);
            const btnBg = addWindow(this.scene,TEXTURE.WINDOW_2,item.bx,item.by,item.bw,item.bh);
            const btnText = addText(this.scene,item.tx,item.ty,item.content,TEXTSTYLE.TITLE);
            btnText.setOrigin(0.5,0.5);

            this.btns.push(btnBg);
            btnContainer.add(btnBg);
            btnContainer.add(btnText);
            btnContainer.setVisible(false);
            this.btnContainers.push(btnContainer);
        }
        ui.add(this.btnContainers);
    }

    show(data?:any): void {
        const userData = data.data;
        this.titleContainer.setVisible(true);

        this.btnContainers = this.btnContainers.filter(item=>{
            if(!userData && item.list[1].text === this.lobbyMenuConfig[0].content){
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

    actionInput(key: KEYBOARD): void {
        if(key === KEYBOARD.SELECT){
            this.updateMenu();
        }else if(key === KEYBOARD.UP){
            this.updateChoice(true);
        }else if(key === KEYBOARD.DOWN){
            this.updateChoice(false);
        }
    }

    pause(onoff: boolean): void {}

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
            case this.lobbyMenuConfig[0].content:
                console.log('startGame');
                break;
            case this.lobbyMenuConfig[1].content:
                this.mode.order(ORDER.ChangeMode,{mode:MODE.NEWGAME,isChain:false});
                break;
            case this.lobbyMenuConfig[2].content:
                console.log('setting');
                break;
            case this.lobbyMenuConfig[3].content:
                this.mode.order(ORDER.ChangeMode,{mode:MODE.LOGIN,isChain:false});
                break;
        }

    }
}