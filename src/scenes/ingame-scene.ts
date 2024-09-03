import { MODE } from "../enums/mode";
import { ModeManager } from "../mode-manager";
import { BaseScene } from "./base-scene";

export class InGameScene extends BaseScene{
    public ui!: Phaser.GameObjects.Container;
    public modeManager!:ModeManager;
    private uiContainer!: Phaser.GameObjects.Container;

    constructor(){
        super("InGameScene");
    }

    create(){
        this.ui = this.add.container(0,0);
        this.ui.setScale(4);

        this.modeManager = new ModeManager(this);
        this.modeManager.setMode(MODE.LOGIN);
    }
}