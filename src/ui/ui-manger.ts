import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";

import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { TEXTSTYLE } from "../enums/textstyle";
import { Mode } from "../mode";
import { MessageFormUi } from "./message-form-ui";
import { KEYBOARD } from "../enums/keyboard";

export function addWindow(scene: InGameScene, texture:TEXTURE,x: number, y: number, width: number, height: number): Phaser.GameObjects.NineSlice {  
    const window = scene.add.nineslice(x, y, texture, undefined, width, height, 8, 8, 8, 8);
    window.setOrigin(0.5, 0.5);

    return window;
}

export function addImage(scene:InGameScene,texture:TEXTURE,x: number, y: number, width: number, height: number){
    const ret = scene.add.image(x,y,texture);
    
    ret.setDisplaySize(width,height);

    return ret;
}

export function addText(scene:InGameScene,x:number,y:number,content:string,style:TEXTSTYLE):Phaser.GameObjects.Text{
    const result = scene.add.text(x,y,content,getTextStyle(style));
    
    result.setShadow(1,0,'#91919a');
    result.setScale(0.5);
    result.setOrigin(0.5,0.5);
    
    return result;
}

export function addTextInput(scene:InGameScene,x:number,y:number,width:number,height:number,style:TEXTSTYLE,option:InputText.IConfig):InputText{
    const result = new InputText(scene,x,y,width,height,getTextStyle(style,option));

    scene.add.existing(result);
    result.setScale(1);

    return result;
}

function getTextStyle(style:TEXTSTYLE,option?:InputText.IConfig):any{
    let config:Phaser.Types.GameObjects.Text.TextStyle = {
        fontFamily:'font_4',
        fontSize:'0px',
        color: '#ffffff'
    }

    if(option) Object.assign(config,option);

    switch(style){
        case TEXTSTYLE.ACCOUNT: 
            config.fontSize = '36px';
            config.color = '#ffffff';
            break;
        case TEXTSTYLE.TITLE: 
            config.fontSize = '52px';
            config.color = '#ffffff'
            break;
        case TEXTSTYLE.MESSAGE_W: 
            config.fontSize = '64px'; 
            config.color = '#4b4b4b';
            break;
        case TEXTSTYLE.MESSAGE_B:
            config.fontSize = '64px'; 
            config.color = '#ffffff';
            break;
        case TEXTSTYLE.INPUT:
            config.fontSize = '18px'; 
            config.color = '#4b4b4b';
            break;
        case TEXTSTYLE.WAIT:
            config.fontSize = '52px';
            config.color = '#ffffff';
            break;
    }

    return config;
}
 
export abstract class UiManager{
    protected scene:InGameScene;
    protected bg:Phaser.GameObjects.Image;
    protected mode!:Mode;
    protected message!:MessageFormUi;

    public whitelistKey:KEYBOARD[] = [];

    constructor(scene:InGameScene){
        this.scene = scene;
        this.bg = this.scene.add.image(0,0,"").setOrigin(0,0).setDisplaySize(this.scene.game.canvas.width/8+2,this.scene.game.canvas.height/6+2);
        this.bg.setVisible(false);
    }
    
    abstract setup(): void;
    abstract show(data?:any): void;
    abstract clean(): void;
    abstract actionInput(key:KEYBOARD): void;

    setBackground(texture:TEXTURE){
        this.bg.setVisible(true);
        this.bg.setTexture(texture);
    }

    getUi(){
        return this.scene.ui;
    }

    setMode(mode:Mode){
        this.mode = mode;
    }
}