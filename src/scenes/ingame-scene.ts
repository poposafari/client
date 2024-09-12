import { MODE } from "../enums/mode";
import { Mode } from "../mode";
import { ModeManager } from "../mode-manager";
import { UI } from "../ui/ui";
import { InputManager } from "../utils/input-manager";
import { ServiceLocator } from "../utils/service-locator";
import { BaseScene } from "./base-scene";

export class InGameScene extends BaseScene{
    public ui!: UI;
    public modeManager!:ModeManager;
    public modeStack:Mode[] = [];
    public inputManager!:InputManager;

    constructor(){
        super("InGameScene");
    }

    create(){
        this.modeManager = new ModeManager(this);
        ServiceLocator.register('mode-manager',this.modeManager);

        this.inputManager = new InputManager(this);
        ServiceLocator.register('input-manager',this.inputManager);

        this.ui = new UI(this);
        this.add.existing(this.ui);
        this.ui.setScale(2);
        this.ui.setup();

        this.modeManager.setMode(MODE.LOGIN,false);
    }
}