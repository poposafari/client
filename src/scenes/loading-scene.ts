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
        this.loadImage(TEXTURE.ACCOUNT_WINDOW,"ui","window_0");
        this.loadImage(TEXTURE.ACCOUNT_INPUT,"ui","input_0");
        this.loadImage(TEXTURE.ACCOUNT_BUTTON,"ui","button_0");
        this.loadImage(TEXTURE.ACCOUNT_SUBBUTTON,"ui","button_1");
        this.loadImage(TEXTURE.MESSAGE,"ui","message");
    }

    create(){
        this.scene.start("InGameScene");
    }
}