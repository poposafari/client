import { TEXTURE } from "../enums/texture";
import { BaseScene } from "./base-scene";

export class LoadingScene extends BaseScene{
    constructor(){
        super("LoadingScene");
    }

    preload(){
        this.loadImage(TEXTURE.ACCOUNT_WINDOW,"ui","window_0");
    }

    create(){
        this.scene.start("InGameScene");
    }
}