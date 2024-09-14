import { TEXTURE } from "../enums/texture";
import { initI18n } from "../utils/i18n";
import { BaseScene } from "./base-scene";

export class LoadingScene extends BaseScene{
    constructor(){
        super("LoadingScene");
        initI18n();
    }

    preload(){
        console.log('LoadingScene preload()');

        this.loadImage(TEXTURE.BG_0,"ui","bg_0");
        this.loadImage(TEXTURE.BTN_0,"ui","btn_0");
        this.loadImage(TEXTURE.BTN_0_CLICKED,"ui","btn_0_clicked");
        this.loadImage(TEXTURE.INPUT_0,"ui","input_0");
        this.loadImage(TEXTURE.MESSAGE,"ui","message");
        this.loadImage(TEXTURE.MESSAGE_MARK,"ui","message_mark");
        this.loadImage(TEXTURE.WINDOW_0,"ui","window_0");
        this.loadImage(TEXTURE.WINDOW_1,"ui","window_1");
        this.loadImage(TEXTURE.WINDOW_2,"ui","window_2");
        this.loadImage(TEXTURE.WINDOW_2_CLICKED,"ui","window_2_clicked");
    }

    create(){
        this.scene.start("InGameScene");
    }
}