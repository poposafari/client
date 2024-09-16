import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { TEXTSTYLE } from "../enums/textstyle";

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
        case TEXTSTYLE.TITLE_MENU: return '#ffffff';
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
        case TEXTSTYLE.TITLE_MENU:
            config.fontSize = '52px';
            break;
        case TEXTSTYLE.MESSAGE:
            config.fontSize = '64px';
            break;
    }

    return config;
}
 
export abstract class UiManager{
    protected scene:InGameScene;
    protected bg:Phaser.GameObjects.Image;

    constructor(scene:InGameScene){
        this.scene = scene;
        this.bg = this.scene.add.image(0,0,"").setOrigin(0,0).setDisplaySize(this.scene.game.canvas.width/8+2,this.scene.game.canvas.height/6+2);
        this.bg.setVisible(false);
    }
    
    abstract setup(): void;
    abstract show(): void;
    abstract clean(): void;

    setBackground(texture:TEXTURE){
        this.bg.setVisible(true);
        this.bg.setTexture(texture);
    }

    getUi(){
        return this.scene.ui;
    }
}