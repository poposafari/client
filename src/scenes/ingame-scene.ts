import { MODE } from "../enums/mode";
import { ModeManager } from "../mode-manager";
import { UI } from "../ui/ui";
import { ServiceLocator } from "../utils/service-locator";
import { BaseScene } from "./base-scene";

export class InGameScene extends BaseScene{
    public ui!: UI;
    public modeManager!:ModeManager;

    constructor(){
        super("InGameScene");
    }

    create(){
        this.modeManager = new ModeManager(this);
        ServiceLocator.register('mode-manager',this.modeManager);

        this.ui = new UI(this,this.modeManager);
        this.add.existing(this.ui);
        this.ui.setScale(4);
        this.ui.setup();

        this.modeManager.setMode(MODE.LOGIN);
    }
}