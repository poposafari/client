import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { TEXTSTYLE } from "../enums/textstyle";

export function addWindow(scene: InGameScene, texture:TEXTURE,x: number, y: number, width: number, height: number): Phaser.GameObjects.NineSlice {  
    const window = scene.add.nineslice(x, y, texture, undefined, width, height, 6, 6, 6, 6);
    window.setOrigin(0.5, 0.5);

    return window;
}

export function addTextInput(scene:InGameScene,x:number,y:number,width:number,height:number,style:TEXTSTYLE,option:InputText.IConfig):InputText{
    const result = new InputText(scene,x,y,width,height,getTextStyle(style,option));

    scene.add.existing(result);
    result.setScale(1);

    return result;
}

export function addText(scene:InGameScene,x:number,y:number,content:string,style:TEXTSTYLE):Phaser.GameObjects.Text{
    const result = scene.add.text(x,y,content,getTextStyle(style));
    result.setShadow(1,0,'#91919a');
    result.setScale(0.5);
    
    return result;
}

function getColor(style:TEXTSTYLE):string{
    switch(style){
        case TEXTSTYLE.ACCOUNT_INPUT: return '#424242';
        case TEXTSTYLE.ACCOUNT: return '#ffffff';
        case TEXTSTYLE.MESSAGE: return '#4b4b4b';
    }
}


function getTextStyle(style:TEXTSTYLE,option?:InputText.IConfig):any{
    let config:Phaser.Types.GameObjects.Text.TextStyle = {
        fontFamily:'font_4',
        fontSize:'96px',
        color: getColor(style),
    }

    if(option){
        Object.assign(config,option);
    }

    switch(style){
        case TEXTSTYLE.ACCOUNT:
            config.fontSize = '36px';
            break;
        case TEXTSTYLE.ACCOUNT_INPUT:
            break;
        case TEXTSTYLE.MESSAGE:
            config.fontSize = '64px';
            break;
    }

    return config;
}
 
export abstract class UiManager{
    protected scene:InGameScene;

    constructor(scene:InGameScene){
        this.scene = scene;
        this.scene.add.image(0,0,TEXTURE.ACCOUNT_BG).setOrigin(0,0).setDisplaySize(this.scene.game.canvas.width,this.scene.game.canvas.height);

    }
    
    abstract setup(): void;
    abstract show(): void;
    abstract clean(): void;

    getUi(){
        return this.scene.ui;
    }
}