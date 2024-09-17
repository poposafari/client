import InputText from "phaser3-rex-plugins/plugins/gameobjects/dom/inputtext/InputText";
import {DropDownList,SimpleDropDownList} from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { TEXTURE } from "../enums/texture";
import { InGameScene } from "../scenes/ingame-scene";
import { TEXTSTYLE } from "../enums/textstyle";
import { MODE } from "../enums/mode";
import i18next from "i18next";

export function addDropdown(scene:InGameScene){
    var style = {
        label: {
            space: { left: 10, right: 10, top: 10, bottom: 10 },
            background: {
                color: 0x4e342e
            },
            text: {
                fixedWidth: 150
            },
        },

        button: {
            space: { left: 10, right: 10, top: 10, bottom: 10 },
            background: {
                color: 0x4e342e,
                strokeWidth: 0,
                'hover.strokeColor': 0xffffff,
                'hover.strokeWidth': 2,
            },
            text: {
                fontSize: 20
            },
        }
    }

    var options = [
        { text: 'test1', value: 0 },
        { text: 'test2', value: 10 },
        { text: 'test3', value: 100 },
        { text: 'test4', value: 1000 },
    ]

    const ret = scene.rexUI.add.simpleDropDownList(style)
        .resetDisplayContent('-- Select --')
        .setOptions(options)
        .setPosition(0, 0)
        .setVisible(false)
        .layout()
    
    return ret;
}

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

function getDropDownStyle(mode:MODE,x: number, y: number, width: number, height: number):DropDownList.IConfig{

    const config = {
        x: x,
        y: y,
        width: width,
        height: height,
        options: [],
        list: {
            createButtonCallback: function (scene: { add: { text: (arg0: number, arg1: number, arg2: any, arg3: { fontSize: string; color: string; backgroundColor: string; padding: { left: number; right: number; top: number; bottom: number; }; }) => any; }; }, option: any, index: any, options: any) {
                // 옵션에 해당하는 버튼 생성
                return scene.add.text(0, 0, option, {
                    fontSize: '40px',
                    color: '#ffffff',
                    backgroundColor: '#6666ff',
                    padding: { left: 50, right: 10, top: 100, bottom: 5 }
                });
            },
            onButtonClick: function (button: any, index: any, pointer: any, event: any) {
                console.log(`Button ${index} clicked`);
            },
        }
    };
    
    switch(mode){
        case MODE.CLOSET:
            config.options.push(
                i18next.t("menu:man1"),
                i18next.t("menu:man2"),
                i18next.t("menu:man3"),
                i18next.t("menu:man4")
            );
            config.x = x;
            config.y = y;
            config.width = width;
            config.height = height;
            break;
    }

    return config;
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